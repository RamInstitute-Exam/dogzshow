import { Request, Response } from 'express';
import { HeroBannerService } from '../services/heroBanner.service';
import { AuditLogger } from '../utils/audit.logger';

const service = new HeroBannerService();

export const getActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await service.getActiveBanners();
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAll(req.query);
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
    try {
      await AuditLogger.log(req, 'CREATE', 'HERO_BANNER', data.id, null, data);
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }
    res.status(201).json({ success: true, message: 'Created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id as string, req.body);
    try {
      await AuditLogger.log(req, 'UPDATE', 'HERO_BANNER', data.id, null, data);
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }
    res.status(200).json({ success: true, message: 'Updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id as string);
    try {
      await AuditLogger.log(req, 'DELETE', 'HERO_BANNER', req.params.id as string, null, null);
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      res.status(400).json({ success: false, message: 'Orders array is required' });
      return;
    }
    await service.reorder(orders);
    try {
      await AuditLogger.log(req, 'REORDER', 'HERO_BANNER', null, null, { orders });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }
    res.status(200).json({ success: true, message: 'Banners reordered successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
