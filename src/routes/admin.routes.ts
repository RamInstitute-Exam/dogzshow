import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Secure all routes in this file with authenticate AND authorizeAdmin
router.use(authenticate, authorizeAdmin);

// GET all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { profiles: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE a user
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    // Prevent admins from deleting themselves via this route
    if (id === (req as any).user?.userId) {
      res.status(400).json({ error: 'Cannot delete your own admin account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Since we don't have onDelete: Cascade set up in Prisma for DogProfile -> User,
    // we must manually delete all images of the user's dogs, then their dogs, then the user.
    const userDogs = await prisma.dogProfile.findMany({
      where: { ownerId: id },
      select: { id: true }
    });
    
    const dogIds = userDogs.map(d => d.id);

    if (dogIds.length > 0) {
      // Delete images of all these dogs
      await prisma.image.deleteMany({
        where: { profileId: { in: dogIds } }
      });

      // Delete the dogs
      await prisma.dogProfile.deleteMany({
        where: { ownerId: id }
      });
    }

    // Finally delete the user
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// CREATE a user
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { profiles: true }
        }
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// UPDATE user role (RBAC)
router.patch('/users/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    if (id === (req as any).user?.userId) {
      res.status(400).json({ error: 'Cannot change your own role.' });
      return;
    }

    if (role !== 'ADMIN' && role !== 'USER') {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { profiles: true }
        }
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// GET dashboard analytics aggregates (admin only)
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDogs = await prisma.dogProfile.count();
    const totalBreeders = await prisma.breederProfile.count();
    const verifiedBreeders = await prisma.breederProfile.count({ where: { verified: true } });
    
    // Group users by subscription plan
    const freeUsers = await prisma.user.count({ where: { subscriptionType: 'FREE' } });
    const proUsers = await prisma.user.count({ where: { subscriptionType: 'PRO' } });
    const enterpriseUsers = await prisma.user.count({ where: { subscriptionType: 'ENTERPRISE' } });

    // Mock revenue tracking based on active subscriptions
    const totalRevenue = (proUsers * 499) + (enterpriseUsers * 1999);

    // Group dogs by breed
    const breedGroup = await prisma.dogProfile.groupBy({
      by: ['breed'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const popularBreeds = breedGroup.map(item => ({
      breed: item.breed,
      count: item._count.id,
    }));

    // User growth mock datasets
    const userGrowth = [
      { name: 'Jan', users: Math.max(1, Math.round(totalUsers * 0.3)) },
      { name: 'Feb', users: Math.max(2, Math.round(totalUsers * 0.45)) },
      { name: 'Mar', users: Math.max(3, Math.round(totalUsers * 0.6)) },
      { name: 'Apr', users: Math.max(5, Math.round(totalUsers * 0.75)) },
      { name: 'May', users: Math.max(8, Math.round(totalUsers * 0.9)) },
      { name: 'Jun', users: totalUsers }
    ];

    res.status(200).json({
      summary: {
        totalUsers,
        totalDogs,
        totalBreeders,
        verifiedBreeders,
        totalRevenue,
      },
      subscriptionBreakdown: {
        FREE: freeUsers,
        PRO: proUsers,
        ENTERPRISE: enterpriseUsers,
      },
      popularBreeds,
      userGrowth,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to aggregate system analytics data' });
  }
});

// PATCH: Verify or unverify a breeder (admin only)
router.patch('/breeders/:id/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      res.status(400).json({ error: 'verified state must be a boolean' });
      return;
    }

    const breeder = await prisma.breederProfile.findUnique({
      where: { id },
    });

    if (!breeder) {
      res.status(404).json({ error: 'Breeder profile not found' });
      return;
    }

    const updated = await prisma.breederProfile.update({
      where: { id },
      data: { verified },
    });

    res.status(200).json({ message: `Breeder verification status updated to ${verified}`, breeder: updated });
  } catch (error) {
    console.error('Error modifying breeder verification:', error);
    res.status(500).json({ error: 'Failed to update breeder verification status' });
  }
});

export default router;
