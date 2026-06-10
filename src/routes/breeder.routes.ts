import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET all breeders (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { verified, search } = req.query;

    const whereClause: any = {};
    if (verified === 'true') {
      whereClause.verified = true;
    }
    if (search) {
      whereClause.OR = [
        { companyName: { contains: String(search) } },
        { address: { contains: String(search) } },
      ];
    }

    const breeders = await prisma.breederProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(breeders);
  } catch (error) {
    console.error('Error fetching breeders:', error);
    res.status(500).json({ error: 'Failed to fetch breeders' });
  }
});

// GET current user's breeder profile (protected)
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const profile = await prisma.breederProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      res.status(404).json({ error: 'Breeder profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching breeder profile:', error);
    res.status(500).json({ error: 'Failed to fetch breeder profile' });
  }
});

// GET a breeder by user ID (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const breeder = await prisma.breederProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profiles: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!breeder) {
      res.status(404).json({ error: 'Breeder not found' });
      return;
    }

    res.status(200).json(breeder);
  } catch (error) {
    console.error('Error fetching breeder details:', error);
    res.status(500).json({ error: 'Failed to fetch breeder profile' });
  }
});

// POST to create or update breeder profile (protected)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { companyName, licenseNo, address, phone, website } = req.body;

    if (!companyName) {
      res.status(400).json({ error: 'Company Name is required' });
      return;
    }

    // Upsert breeder profile
    const profile = await prisma.breederProfile.upsert({
      where: { userId },
      update: {
        companyName,
        licenseNo,
        address,
        phone,
        website,
      },
      create: {
        userId,
        companyName,
        licenseNo,
        address,
        phone,
        website,
        verified: false, // Must be verified by admin
      },
    });

    res.status(200).json({ message: 'Breeder profile updated successfully', profile });
  } catch (error) {
    console.error('Error setting breeder profile:', error);
    res.status(500).json({ error: 'Failed to save breeder profile' });
  }
});

export default router;
