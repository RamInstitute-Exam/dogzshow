import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import { SponsorService } from '../services/sponsor.service';
import { memoryCache } from '../utils/cache';

const service = new SponsorService();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    const cacheKey = `sponsor:all:${JSON.stringify(req.query)}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, message: 'Retrieved successfully', ...cached });
      return;
    }
    const result = await service.getAll(req.query);
    memoryCache.set(cacheKey, result);
    res.status(200).json({ success: true, message: 'Retrieved successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getById(req.params.id as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.create(req.body);
    memoryCache.clear();
    await AuditLogger.log(req, 'CREATE', 'SPONSOR', data.id, null, data);
    res.status(201).json({ success: true, message: 'Created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id as string, req.body);
    memoryCache.clear();
    await AuditLogger.log(req, 'UPDATE', 'SPONSOR', data.id, null, data);
    res.status(200).json({ success: true, message: 'Updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id as string);
    memoryCache.clear();
    await AuditLogger.log(req, 'DELETE', 'SPONSOR', req.params.id as string, null, null);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    memoryCache.clear();
    await AuditLogger.log(req, 'BULK_DELETE', 'SPONSOR', null, null, { ids: req.body.ids });
    res.status(200).json({ success: true, message: 'Bulk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
