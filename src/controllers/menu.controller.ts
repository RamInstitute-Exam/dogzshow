import { Request, Response } from 'express';
import prisma from '../prisma';

export const getMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position = 'NAVBAR' } = req.query;
    const menus = await prisma.menu.findMany({
      where: { position: String(position) },
      orderBy: { displayOrder: 'asc' }
    });

    // Build hierarchical structure
    const menuTree = menus.filter(m => !m.parentId).map(parent => ({
      ...parent,
      children: menus.filter(child => child.parentId === parent.id).sort((a, b) => a.displayOrder - b.displayOrder)
    }));

    res.status(200).json({ success: true, data: menuTree });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const menu = await prisma.menu.create({ data });
    res.status(201).json({ success: true, message: 'Menu created', data: menu });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const menu = await prisma.menu.update({ where: { id: String(id) }, data });
    res.status(200).json({ success: true, message: 'Menu updated', data: menu });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Also delete children
    await prisma.menu.deleteMany({ where: { parentId: String(id) } });
    await prisma.menu.delete({ where: { id: String(id) } });
    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reorderMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body; // Array of { id, displayOrder, parentId }
    for (const item of items) {
      await prisma.menu.update({
        where: { id: String(item.id) },
        data: { displayOrder: Number(item.displayOrder), parentId: item.parentId ? String(item.parentId) : null }
      });
    }
    res.status(200).json({ success: true, message: 'Menus reordered' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
