import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalDogs, activeEvents, pendingPayments, totalRevenueAggr, recentActivity] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.dog.count({ where: { deletedAt: null } }),
      prisma.event.count({ where: { status: 'ACTIVE' } }),
      
      // Mocking pending payments count for now if there is no Payment model yet
      // prisma.payment.count({ where: { status: 'PENDING' } })
      Promise.resolve(12), 

      // Mocking total revenue sum
      // prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } })
      Promise.resolve(1450000), 

      // Fetch 4 most recent events (as activity mock)
      prisma.event.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { name: true, createdAt: true, status: true }
      })
    ]);

    // Construct formatted response
    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenueAggr, // Return exact number, frontend formats to ₹
        revenueTrend: '+14%', // Mocked trend
        activeEvents,
        eventsTrend: '+2',
        totalDogs,
        dogsTrend: '+18%',
        totalUsers,
        usersTrend: '+5%',
        recentActivity: recentActivity.map(a => ({
          text: `New event created: ${a.name}`,
          time: new Date(a.createdAt).toLocaleDateString(),
          color: 'text-brand-orange',
          bg: 'bg-orange-50'
        })),
        chartData: [31000, 40000, 28000, 51000, 42000, 109000, totalRevenueAggr / 10] // Mocked chart tailing with current data
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const whereClause = search ? {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: { include: { role: true } }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const getAdminDogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const whereClause = search ? {
      OR: [
        { name: { contains: search } },
        { kciNumber: { contains: search } }
      ]
    } : {};

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          breed: true
        }
      }),
      prisma.dog.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: dogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dogs' });
  }
};
