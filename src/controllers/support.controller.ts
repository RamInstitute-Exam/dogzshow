import { Request, Response } from 'express';
import { SupportService } from '../services/support.service';

const service = new SupportService();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAll(req.query);
    res.status(200).json({ success: true, message: 'Support tickets retrieved successfully', ...result });
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
    const userId = (req as any).user?.id || req.body.userId || null;
    const ticketData = { ...req.body, userId };
    const data = await service.create(ticketData);
    res.status(201).json({ success: true, message: 'Support ticket created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id as string, req.body);
    res.status(200).json({ success: true, message: 'Support ticket updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id as string);
    res.status(200).json({ success: true, message: 'Support ticket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    res.status(200).json({ success: true, message: 'Support tickets bulk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
