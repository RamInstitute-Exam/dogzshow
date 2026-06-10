import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET all received adoption requests for current owner's dogs (protected)
router.get('/received', authenticate, async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.userId;

    const requests = await prisma.adoptionRequest.findMany({
      where: {
        dog: {
          ownerId: ownerId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        dog: {
          select: {
            id: true,
            name: true,
            breed: true,
            age: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching received adoption requests:', error);
    res.status(500).json({ error: 'Failed to fetch received adoption requests' });
  }
});

// GET all sent adoption requests (protected)
router.get('/sent', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const requests = await prisma.adoptionRequest.findMany({
      where: {
        userId,
      },
      include: {
        dog: {
          include: {
            images: { take: 1 },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching sent adoption requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent adoption requests' });
  }
});

// POST: Submit a new adoption request (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { dogId, notes } = req.body;

    if (!dogId) {
      res.status(400).json({ error: 'Dog ID is required' });
      return;
    }

    const dog = await prisma.dogProfile.findUnique({
      where: { id: dogId },
    });

    if (!dog) {
      res.status(404).json({ error: 'Dog listing not found' });
      return;
    }

    if (dog.ownerId === userId) {
      res.status(400).json({ error: 'You cannot submit adoption requests for your own listings' });
      return;
    }

    // Check for existing request
    const existing = await prisma.adoptionRequest.findFirst({
      where: {
        userId,
        dogId,
      },
    });

    if (existing) {
      res.status(400).json({ error: 'You have already submitted an adoption request for this dog' });
      return;
    }

    const request = await prisma.adoptionRequest.create({
      data: {
        userId,
        dogId,
        notes,
      },
      include: {
        dog: true,
      },
    });

    res.status(201).json({ message: 'Adoption request submitted successfully', request });
  } catch (error) {
    console.error('Error creating adoption request:', error);
    res.status(500).json({ error: 'Failed to submit adoption request' });
  }
});

// PATCH: Approve or reject adoption request (protected, owner of the dog only)
router.patch('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const id = String(req.params.id);
    const { status } = req.body;

    if (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid status update' });
      return;
    }

    const request = await prisma.adoptionRequest.findUnique({
      where: { id },
      include: {
        dog: true,
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Adoption request not found' });
      return;
    }

    // Verify ownership
    if (request.dog.ownerId !== userId && (req as any).user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to moderate this request' });
      return;
    }

    const updatedRequest = await prisma.adoptionRequest.update({
      where: { id },
      data: { status },
    });

    // If approved, optionally update the dog's status
    if (status === 'APPROVED') {
      await prisma.dogProfile.update({
        where: { id: request.dogId },
        data: {
          status: request.dog.listingType === 'SALE' ? 'SOLD' : 'ADOPTED',
        },
      });
    }

    res.status(200).json({ message: `Request successfully marked as ${status}`, request: updatedRequest });
  } catch (error) {
    console.error('Error updating adoption request status:', error);
    res.status(500).json({ error: 'Failed to update adoption request status' });
  }
});

export default router;
