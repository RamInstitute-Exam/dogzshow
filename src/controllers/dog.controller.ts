import { Request, Response } from 'express';
import { DogService } from '../services/dog.service';

const dogService = new DogService();

export const getDogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await dogService.getAllDogs(req.query);
    res.status(200).json({
      success: true,
      message: 'Dogs retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await dogService.getDogById(req.params.id as string);
    res.status(200).json({ success: true, message: 'Dog found', data });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || 'SYSTEM';
    const data = await dogService.createDog(req.body, userId);
    res.status(201).json({ success: true, message: 'Dog created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || 'SYSTEM';
    const data = await dogService.updateDog(req.params.id as string, req.body, userId);
    res.status(200).json({ success: true, message: 'Dog updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteDog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || 'SYSTEM';
    await dogService.deleteDog(req.params.id as string, userId);
    res.status(200).json({ success: true, message: 'Dog deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const restoreDog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || 'SYSTEM';
    await dogService.restoreDog(req.params.id as string, userId);
    res.status(200).json({ success: true, message: 'Dog restored successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkDeleteDogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
      return;
    }
    const result = await dogService.bulkDeleteDogs(ids, userId);
    res.status(200).json({ success: true, message: `Successfully deleted ${result.count} dogs` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkUpdateDogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
      return;
    }
    const result = await dogService.bulkUpdateDogs(ids, data, userId);
    res.status(200).json({ success: true, message: `Successfully updated ${result.count} dogs` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
