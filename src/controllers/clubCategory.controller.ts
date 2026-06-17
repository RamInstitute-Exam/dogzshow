import { Request, Response } from 'express';
import { ClubCategoryService } from '../services/clubCategory.service';

const service = new ClubCategoryService();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAll(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    res.status(200).json({ success: true });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};
