import { Request, Response } from 'express';
import prisma from '../prisma';

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Run aggregations in parallel
    const [totalDogs, upcomingEvents, pendingRegistrations, certificates, recentRegistrations] = await Promise.all([
      prisma.dog.count({ where: { userOwnerId: userId, deletedAt: null } }),
      prisma.eventRegistration.count({
        where: {
          userId,
          status: 'CONFIRMED',
          event: { startDate: { gte: new Date() } }
        }
      }),
      prisma.eventRegistration.count({
        where: { userId, status: 'PENDING' }
      }),
      prisma.kCICertificate.count({
        where: { dog: { userOwnerId: userId } }
      }),
      prisma.eventRegistration.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { event: true, dog: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDogs,
        upcomingEvents,
        pendingRegistrations,
        certificates,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalDogs,
      totalUsers,
      totalEvents,
      registrations,
      payments,
      upcomingEvents,
      completedEvents,
      pendingPayments,
      winners,
      revenueResult,
      recentRegistrations
    ] = await Promise.all([
      prisma.dog.count({ where: { deletedAt: null } }),
      prisma.user.count(),
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.eventRegistration.count(),
      prisma.payment.count(),
      prisma.event.count({ where: { startDate: { gte: new Date() }, deletedAt: null } }),
      prisma.event.count({ where: { status: 'COMPLETED', deletedAt: null } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.winner.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.eventRegistration.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, dog: true, event: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDogs,
        totalUsers,
        totalEvents,
        registrations,
        payments,
        upcomingEvents,
        completedEvents,
        pendingPayments,
        winners,
        revenue: revenueResult._sum.amount || 0,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};
