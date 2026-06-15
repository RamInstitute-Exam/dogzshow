import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import { BreederService } from '../services/breeder.service';

const service = new BreederService();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAll(req.query);
    res.status(200).json({ success: true, message: 'Breeders retrieved successfully', ...result });
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
    await AuditLogger.log(req, 'CREATE', 'BREEDER', data.id, null, data);
    res.status(201).json({ success: true, message: 'Breeder created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id as string, req.body);
    await AuditLogger.log(req, 'UPDATE', 'BREEDER', data.id, null, data);
    res.status(200).json({ success: true, message: 'Breeder updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id as string);
    await AuditLogger.log(req, 'DELETE', 'BREEDER', req.params.id as string, null, null);
    res.status(200).json({ success: true, message: 'Breeder deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    await AuditLogger.log(req, 'BULK_DELETE', 'BREEDER', null, null, { ids: req.body.ids });
    res.status(200).json({ success: true, message: 'Breeders bulk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
