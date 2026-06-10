import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// POST: Flag/Report a listing or user (protected)
router.post('/report', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const reporterId = (req as any).user.userId;
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ error: 'targetType, targetId, and reason are required' });
      return;
    }

    if (targetType !== 'DOG' && targetType !== 'USER') {
      res.status(400).json({ error: 'Invalid report target type (must be DOG or USER)' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason: String(reason),
      },
    });

    res.status(201).json({ message: 'Safety report filed successfully', report });
  } catch (error) {
    console.error('Error submitting safety report:', error);
    res.status(500).json({ error: 'Failed to file report' });
  }
});

// GET: Fetch all moderation reports (protected, admin only)
router.get('/reports', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { id: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching safety reports:', error);
    res.status(500).json({ error: 'Failed to retrieve moderation queue' });
  }
});

// PATCH: Resolve or dismiss a report (protected, admin only)
router.patch('/reports/:id', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (status !== 'RESOLVED' && status !== 'DISMISSED' && status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: `Report status set to ${status}`, report: updated });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
