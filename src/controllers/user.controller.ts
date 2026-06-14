import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
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

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await userService.getUserById(req.params.id as string);
    res.status(200).json({ success: true, message: 'User found', data });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id || 'SYSTEM';
    const data = await userService.createUser(req.body, adminId);
    res.status(201).json({ success: true, message: 'User created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id || 'SYSTEM';
    const data = await userService.updateUser(req.params.id as string, req.body, adminId);
    res.status(200).json({ success: true, message: 'User updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id || 'SYSTEM';
    await userService.deleteUser(req.params.id as string, adminId);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const restoreUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id || 'SYSTEM';
    await userService.restoreUser(req.params.id as string, adminId);
    res.status(200).json({ success: true, message: 'User restored successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkDeleteUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
      return;
    }
    const result = await userService.bulkDeleteUsers(ids, adminId);
    res.status(200).json({ success: true, message: `Successfully deleted ${result.count} users` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkUpdateUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
      return;
    }
    const result = await userService.bulkUpdateUsers(ids, data, adminId);
    res.status(200).json({ success: true, message: `Successfully updated ${result.count} users` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
