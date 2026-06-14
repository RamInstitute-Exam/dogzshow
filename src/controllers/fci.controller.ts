import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFciGroups = async (req: Request, res: Response) => {
  try {
    const groups = await (prisma as any).fCIGroup.findMany({
      include: {
        _count: {
          select: { breeds: true }
        }
      },
      orderBy: { groupNumber: 'asc' }
    });
    
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    console.error('Error fetching FCI Groups:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFciGroupDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await (prisma as any).fCIGroup.findUnique({
      where: { id },
      include: {
        breeds: true,
        _count: { select: { breeds: true } }
      }
    });

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error('Error fetching FCI Group Detail:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createFciGroup = async (req: Request, res: Response) => {
  try {
    const { groupNumber, name, description, status } = req.body;
    const group = await (prisma as any).fCIGroup.create({
      data: { groupNumber: Number(groupNumber), name, description, status }
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateFciGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { groupNumber, name, description, status } = req.body;
    const group = await (prisma as any).fCIGroup.update({
      where: { id },
      data: { groupNumber: Number(groupNumber), name, description, status }
    });
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteFciGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).fCIGroup.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Breed Controllers
export const addBreed = async (req: Request, res: Response) => {
  try {
    const { id: fciGroupId } = req.params;
    const { name } = req.body;
    const breed = await (prisma as any).breed.create({
      data: { name, fciGroupId }
    });
    res.status(201).json({ success: true, data: breed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateBreed = async (req: Request, res: Response) => {
  try {
    const { breedId } = req.params;
    const { name } = req.body;
    const breed = await (prisma as any).breed.update({
      where: { id: breedId },
      data: { name }
    });
    res.status(200).json({ success: true, data: breed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteBreed = async (req: Request, res: Response) => {
  try {
    const { breedId } = req.params;
    await (prisma as any).breed.delete({ where: { id: breedId } });
    res.status(200).json({ success: true, message: 'Breed deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
