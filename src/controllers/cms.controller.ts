import { Request, Response } from 'express';
import { CmsService } from '../services/cms.service';
import prisma from '../prisma';

const service = new CmsService();

export const getGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getGlobal();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updateGlobal(req.body);
    res.status(200).json({ success: true, message: 'Global CMS updated', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHomeCms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Stats for StatsCounter
    const stats = await prisma.dashboardMetric.findMany();
    // Default seed if empty
    if (!stats.length) {
      await prisma.dashboardMetric.createMany({
        data: [
          { metricKey: 'registered_dogs', metricValue: 15000 },
          { metricKey: 'dog_shows', metricValue: 250 },
          { metricKey: 'verified_judges', metricValue: 500 },
          { metricKey: 'active_users', metricValue: 12000 },
          { metricKey: 'breeds_supported', metricValue: 350 }
        ]
      });
    }
    const finalStats = await prisma.dashboardMetric.findMany();
    
    // Page data for About Section
    const about = await service.getPageBySlug('about');

    res.status(200).json({ success: true, data: { stats: finalStats, about } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventsCms = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { startDate: 'asc' },
      take: 10,
      include: { club: true }
    });
    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPageBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getPageBySlug(req.params.slug as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updatePage(req.params.slug as string, req.body);
    res.status(200).json({ success: true, message: 'Page CMS updated', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getAllPages();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
