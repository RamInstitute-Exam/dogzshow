import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import prisma from '../prisma';

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category } = req.body;
    const fileUrl = (req as any).file?.location || (req as any).file?.path;

    if (!fileUrl) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const media = await prisma.mediaGallery.create({
      data: {
        url: fileUrl,
        type, // PHOTO or VIDEO
        category, // DOG_SHOW, PICS, POSTERS
        isPublic: true
      }
    });

    res.status(201).json({ message: 'Media uploaded successfully', media });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

export const getPublicGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const gallery = await prisma.mediaGallery.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(gallery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch public gallery' });
  }
};
