import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import { JudgeService } from '../services/judge.service';
import { memoryCache } from '../utils/cache';

const service = new JudgeService();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    const cacheKey = `judge:all:${JSON.stringify(req.query)}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, message: 'Retrieved successfully', ...cached });
      return;
    }
    const result = await service.getAll(req.query);
    memoryCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes TTL
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
    await AuditLogger.log(req, 'CREATE', 'JUDGE', data.id, null, data);
    res.status(201).json({ success: true, message: 'Created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id as string, req.body);
    memoryCache.clear();
    await AuditLogger.log(req, 'UPDATE', 'JUDGE', data.id, null, data);
    res.status(200).json({ success: true, message: 'Updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id as string);
    memoryCache.clear();
    await AuditLogger.log(req, 'DELETE', 'JUDGE', req.params.id as string, null, null);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    memoryCache.clear();
    await AuditLogger.log(req, 'BULK_DELETE', 'JUDGE', null, null, { ids: req.body.ids });
    res.status(200).json({ success: true, message: 'Bulk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkImport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { replaceExisting, judges } = req.body;
    if (!Array.isArray(judges)) {
      res.status(400).json({ success: false, message: 'Judges must be an array' });
      return;
    }
    const result = await service.bulkImport(replaceExisting, judges);
    memoryCache.clear();
    await AuditLogger.log(req, 'BULK_IMPORT', 'JUDGE', null, null, { replaceExisting, count: judges.length });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real scenario, middleware like multer handles the file and places the URL/path in req.body.photoUrl
    // Assuming the photo URL is passed after uploading to S3 / local disk
    const photoUrl = req.body.photoUrl;
    const data = await service.updatePhotoUrl(req.params.id as string, photoUrl);
    memoryCache.clear();
    await AuditLogger.log(req, 'UPDATE', 'JUDGE_PHOTO', data.id, null, { photoUrl });
    res.status(200).json({ success: true, message: 'Photo updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getBySlug(req.params.slug as string);
    if (!data) {
      res.status(404).json({ success: false, message: 'Judge not found' });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};
