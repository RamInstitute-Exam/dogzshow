import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET all appointments for current user (protected, both user and breeder roles)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.userId;

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { userId: currentUserId },
          { breederId: currentUserId },
        ],
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
        breeder: {
          select: { id: true, email: true },
        },
        dog: {
          select: { id: true, name: true, breed: true },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST: Schedule a breeding consultation / appointment (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { dogId, dateTime, notes } = req.body;

    if (!dogId || !dateTime) {
      res.status(400).json({ error: 'Dog ID and appointment date/time are required' });
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
      res.status(400).json({ error: 'You cannot book consultations for your own dogs' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        breederId: dog.ownerId,
        dogId,
        dateTime: new Date(dateTime),
        notes: notes || '',
      },
    });

    res.status(201).json({ message: 'Consultation appointment scheduled successfully', appointment });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// PATCH: Update appointment status (protected)
router.patch('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = (req as any).user.userId;
    const id = String(req.params.id);
    const { status } = req.body;

    if (status !== 'CONFIRMED' && status !== 'CANCELLED' && status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Verify authorized user (either the attendee or the host/breeder)
    if (appointment.userId !== currentUserId && appointment.breederId !== currentUserId && (req as any).user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to update this appointment' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: `Appointment status updated to ${status}`, appointment: updated });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

export default router;
