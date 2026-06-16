import { Request, Response } from 'express';
import prisma from '../prisma';
import { deleteFromS3, getS3Url } from '../config/s3';


// =======================
// PHOTOS
// =======================

export const uploadPhoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file as any;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const s3Key = file.key;
    const bucketName = file.bucket;
    const mimeType = file.mimetype;
    const fileSize = file.size;
    // Use the direct S3 public URL (file.location set by multer-s3)
    const cdnUrl = file.location || getS3Url(s3Key);

    // If metadata was sent as form-data
    const {
      title,
      slug,
      description,
      albumId,
      categoryId,
      breed,
      photographer,
      location,
      tags,
      altText,
      seoTitle,
      seoDescription,
      featured,
      status,
    } = req.body;

    const photo = await prisma.mediaPhoto.create({
      data: {
        title: title || 'Untitled',
        slug: slug || `photo-${Date.now()}`,
        description,
        albumId: albumId || null,
        categoryId: categoryId || null,
        breed,
        photographer,
        location,
        tags: tags ? JSON.parse(tags) : [],
        altText,
        seoTitle,
        seoDescription,
        s3Key,
        bucketName,
        cdnUrl,
        mimeType,
        fileSize,
        featured: featured === 'true',
        status: status || 'ACTIVE',
      },
    });

    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await prisma.mediaPhoto.findMany({
      include: {
        album: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeaturedPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await prisma.mediaPhoto.findMany({
      where: { featured: true, status: 'ACTIVE' },
      include: { album: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPhotoBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    const photo = await prisma.mediaPhoto.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        album: true,
        category: true,
      },
    });
    
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Increment views asynchronously
    prisma.mediaPhoto.update({
      where: { id: photo.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const photo = await prisma.mediaPhoto.findUnique({ where: { id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Delete from S3
    await deleteFromS3(photo.s3Key);

    // Delete from DB
    await prisma.mediaPhoto.delete({ where: { id } });

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =======================
// VIDEOS
// =======================

export const uploadVideo = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file as any;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const s3Key = file.key;
    const bucketName = file.bucket;
    const mimeType = file.mimetype;
    const fileSize = file.size;
    // Use the direct S3 public URL (file.location set by multer-s3)
    const cdnUrl = file.location || getS3Url(s3Key);

    const {
      title,
      slug,
      description,
      categoryId,
      breed,
      location,
      tags,
      duration,
      featured,
      status,
    } = req.body;

    const video = await prisma.mediaVideo.create({
      data: {
        title: title || 'Untitled',
        slug: slug || `video-${Date.now()}`,
        description,
        categoryId: categoryId || null,
        breed,
        location,
        tags: tags ? JSON.parse(tags) : [],
        s3Key,
        bucketName,
        cdnUrl,
        mimeType,
        fileSize,
        duration,
        featured: featured === 'true',
        status: status || 'ACTIVE',
      },
    });

    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await prisma.mediaVideo.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeaturedVideos = async (req: Request, res: Response) => {
  try {
    const videos = await prisma.mediaVideo.findMany({
      where: { featured: true, status: 'ACTIVE' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVideoBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    const video = await prisma.mediaVideo.findUnique({
      where: { slug: req.params.slug as string },
      include: { category: true },
    });
    
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Increment views asynchronously
    prisma.mediaVideo.update({
      where: { id: video.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVideo = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const video = await prisma.mediaVideo.findUnique({ where: { id } });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Delete from S3
    await deleteFromS3(video.s3Key);

    // Delete from DB
    await prisma.mediaVideo.delete({ where: { id } });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
