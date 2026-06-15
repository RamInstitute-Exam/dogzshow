import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import { CmsService } from '../services/cms.service';
import prisma from '../prisma';
import { memoryCache } from '../utils/cache';

const service = new CmsService();

export const getGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = 'cms:global';
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }
    const data = await service.getGlobal();
    memoryCache.set(cacheKey, data);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updateGlobal(req.body);
    memoryCache.clear();
    res.status(200).json({ success: true, message: 'Global CMS updated', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHomeCms = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = 'cms:home';
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

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

    const resultData = { stats: finalStats, about };
    memoryCache.set(cacheKey, resultData);

    res.status(200).json({ success: true, data: resultData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventsCms = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = 'cms:events';
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const events = await prisma.event.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { startDate: 'asc' },
      take: 10,
      include: { club: true }
    });
    memoryCache.set(cacheKey, events);

    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPageBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = `cms:page:${req.params.slug}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const data = await service.getPageBySlug(req.params.slug as string);
    memoryCache.set(cacheKey, data);

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updatePage(req.params.slug as string, req.body);
    memoryCache.clear();
    res.status(200).json({ success: true, message: 'Page CMS updated', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllPages = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = 'cms:pages';
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const data = await service.getAllPages();
    memoryCache.set(cacheKey, data);

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
