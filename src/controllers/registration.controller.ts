import { Request, Response } from 'express';
import prisma from '../prisma';
import { calculateAge, getEligibleAgeClass } from '../utils/ageCalculator';

export const validateRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, dogId } = req.body;
    if (!eventId || !dogId) {
      res.status(400).json({ success: false, message: 'eventId and dogId are required' });
      return;
    }

    // Fetch Event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { categories: true }
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // 1. Check Registration Window Status
    const now = new Date();
    if (event.registrationWindowStart && now < new Date(event.registrationWindowStart)) {
      res.status(400).json({ success: false, eligible: false, message: 'Registration has not opened yet' });
      return;
    }
    if (event.registrationWindowEnd && now > new Date(event.registrationWindowEnd)) {
      res.status(400).json({ success: false, eligible: false, message: 'Registration has already closed' });
      return;
    }
    if (event.status !== 'REGISTRATION_OPEN' && event.status !== 'ACTIVE') { // Handle legacy states
       // Relaxing this to just rely on dates if status is weird, but usually you check status
       if (event.status === 'COMPLETED' || event.status === 'DRAFT') {
         res.status(400).json({ success: false, eligible: false, message: `Event is currently in ${event.status} state` });
         return;
       }
    }

    // Fetch Dog details
    const dog = await prisma.dog.findUnique({
      where: { id: dogId },
      include: { breed: { include: { fciGroup: true } } }
    });

    if (!dog || !dog.dob) {
      res.status(400).json({ success: false, eligible: false, message: 'Dog not found or missing Date of Birth' });
      return;
    }

    // 2. Calculate Exact Age relative to Event Start Date
    const ageResult = calculateAge(new Date(dog.dob), new Date(event.startDate));
    
    // Fetch all globally active AgeClasses
    const allAgeClasses = await prisma.ageClass.findMany({ where: { status: 'ACTIVE' } });

    // Filter to find which classes the dog's totalMonths fits into
    let eligibleClasses = getEligibleAgeClass(ageResult.totalMonths, allAgeClasses);

    // 3. Enforce Champion Rules
    if (dog.isChampion) {
      // If dog is a champion, maybe they ONLY qualify for Champion class, 
      // or at least Champion class is available to them. 
      // This depends on the specific event rules, but generally:
      eligibleClasses = eligibleClasses.filter(c => c.name === 'Champion' || !c.specialRequirements?.includes('Champion Only'));
      
      // Ensure Champion class is added if available and not already in list
      const championClass = allAgeClasses.find(c => c.specialRequirements?.includes('Champion'));
      if (championClass && !eligibleClasses.find(c => c.id === championClass.id)) {
          eligibleClasses.push(championClass);
      }
    } else {
      // Non-champions cannot enter Champion Only classes
      eligibleClasses = eligibleClasses.filter(c => !c.specialRequirements?.includes('Champion'));
    }

    // 4. Validate against Event's specific allowed categories (if event restricts them)
    // If event.categories is populated, it means the event only allows those specific age classes
    if (event.categories && event.categories.length > 0) {
      // Map event categories by name
      const eventCategoryNames = event.categories.map(c => c.name);
      eligibleClasses = eligibleClasses.filter(c => eventCategoryNames.includes(c.name));
    }

    if (eligibleClasses.length === 0) {
      res.status(200).json({ 
        success: true, 
        eligible: false, 
        message: `Dog is not eligible for any classes in this event. Age: ${ageResult.totalMonths.toFixed(1)} months.`,
        ageData: ageResult
      });
      return;
    }

    res.status(200).json({
      success: true,
      eligible: true,
      message: 'Dog is eligible',
      eligibleClasses,
      ageData: ageResult
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate registration' });
  }
};

export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    // Search can apply to registration id, or we could join dog/user. Let's do simple search for now
    let whereClause: any = {};

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          dog: true,
          user: true,
          event: true,
          category: true
        }
      }),
      prisma.eventRegistration.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
  }
};

export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, dogId, userId, categoryId } = req.body;
    const reg = await prisma.eventRegistration.create({
      data: {
        eventId,
        dogId,
        userId,
        categoryId: categoryId,
        serialNumber: `JZ-${Date.now()}`,
        status: 'PENDING'
      }
    });
    res.status(201).json({ success: true, data: reg });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create registration' });
  }
};

export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    let dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const reg = await prisma.eventRegistration.update({
      where: { id: (req.params.id as string) },
      data: dataToUpdate
    });
    res.status(200).json({ success: true, data: reg });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update registration' });
  }
};

export const bulkDeleteRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    await prisma.eventRegistration.deleteMany({
      where: { id: { in: ids } }
    });
    res.status(200).json({ success: true, message: 'Registrations deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete registrations' });
  }
};
