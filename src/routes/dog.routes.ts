import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// GET all dogs (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const whereClause = search
      ? {
          name: {
            contains: String(search),
          },
        }
      : {};

    const dogs = await prisma.dogProfile.findMany({
      where: whereClause,
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dog profiles' });
  }
});

// GET current user's dogs (protected)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.userId;
    const dogs = await prisma.dogProfile.findMany({
      where: { ownerId },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(dogs);
  } catch (error) {
    console.error('Error fetching user dogs:', error);
    res.status(500).json({ error: 'Failed to fetch your dog profiles' });
  }
});

// GET a single dog by ID (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const dog = await prisma.dogProfile.findUnique({
      where: { id },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!dog) {
      res.status(404).json({ error: 'Dog profile not found' });
      return;
    }

    res.status(200).json(dog);
  } catch (error) {
    console.error('Error fetching dog:', error);
    res.status(500).json({ error: 'Failed to fetch dog profile' });
  }
});

// POST to create a new dog profile (protected)
router.post('/', authenticate, upload.array('photos', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, breed, age, description } = req.body;
    const ownerId = (req as any).user.userId;

    if (!name || !breed || !age || !description) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    
    const dogProfile = await prisma.dogProfile.create({
      data: {
        name: String(name),
        breed: String(breed),
        age: parseInt(String(age), 10),
        description: String(description),
        ownerId,
        images: {
          create: files?.map(file => ({
            url: (file as any).location,
          })) || [],
        },
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({ message: 'Dog profile created successfully', dogProfile });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    res.status(500).json({ error: 'Failed to create dog profile' });
  }
});

// PUT to update an existing dog profile (protected)
router.put('/:id', authenticate, upload.array('photos', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, breed, age, description } = req.body;
    const userId = (req as any).user.userId;

    const dog = await prisma.dogProfile.findUnique({ where: { id } });
    
    if (!dog) {
      res.status(404).json({ error: 'Dog profile not found' });
      return;
    }

    if (dog.ownerId !== userId && (req as any).user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to update this profile' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    let newImagesData = {};
    
    if (files && files.length > 0) {
      newImagesData = {
        images: {
          create: files.map(file => ({
            url: (file as any).location,
          }))
        }
      };
    }

    const updatedDog = await prisma.dogProfile.update({
      where: { id },
      data: {
        ...(name && { name: String(name) }),
        ...(breed && { breed: String(breed) }),
        ...(age && { age: parseInt(String(age), 10) }),
        ...(description && { description: String(description) }),
        ...newImagesData
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({ message: 'Dog profile updated successfully', dogProfile: updatedDog });
  } catch (error) {
    console.error('Error updating dog profile:', error);
    res.status(500).json({ error: 'Failed to update dog profile' });
  }
});

// DELETE a dog profile (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = (req as any).user.userId;

    const dog = await prisma.dogProfile.findUnique({ where: { id } });
    
    if (!dog) {
      res.status(404).json({ error: 'Dog profile not found' });
      return;
    }

    if (dog.ownerId !== userId && (req as any).user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to delete this profile' });
      return;
    }

    await prisma.image.deleteMany({
      where: { profileId: id }
    });

    await prisma.dogProfile.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Dog profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog profile:', error);
    res.status(500).json({ error: 'Failed to delete dog profile' });
  }
});

export default router;
