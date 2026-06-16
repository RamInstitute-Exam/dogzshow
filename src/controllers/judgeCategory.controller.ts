import { Request, Response } from 'express';
import { JudgeCategoryService } from '../services/judgeCategory.service';

const service = new JudgeCategoryService();

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await service.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const item = await service.getById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const item = await service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkRemove = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid ids array' });
    }
    const result = await service.bulkDelete(ids);
    res.json({ success: true, message: 'Deleted successfully', count: result.count });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
