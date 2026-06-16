import { Request, Response } from 'express';
import { MediaGalleryService } from '../services/mediaGallery.service';

const service = new MediaGalleryService();

// ==========================================
// Public Handlers
// ==========================================

export const getPublicImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getImages(req.query);
    res.status(200).json({ success: true, message: 'Retrieved images successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getVideos(req.query);
    res.status(200).json({ success: true, message: 'Retrieved videos successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getAlbums(req.query);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getCategories();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getFeaturedImages();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getFeaturedVideos();
    res.status(200).json({ success: true, data });
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

export const incrementViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.body; // 'image' | 'video'
    await service.incrementViews(req.params.id as string, type);
    res.status(200).json({ success: true, message: 'View incremented' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const incrementLikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.body; // 'image' | 'video'
    await service.incrementLikes(req.params.id as string, type);
    res.status(200).json({ success: true, message: 'Like incremented' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// Admin Handlers
// ==========================================

// Image CRUD
export const getAdminImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAdminImages(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.createImage(req.body);
    res.status(201).json({ success: true, message: 'Image created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Video CRUD
export const getAdminVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAdminVideos(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.createVideo(req.body);
    res.status(201).json({ success: true, message: 'Video created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Media Update & Delete
export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updateMedia(req.params.id as string, req.body);
    res.status(200).json({ success: true, message: 'Media updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.deleteMedia(req.params.id as string);
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Category CRUD
export const getAdminCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAdminCategories(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.createCategory(req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updateCategory(req.params.id as string, req.body);
    res.status(200).json({ success: true, message: 'Category updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.deleteCategory(req.params.id as string);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Album CRUD
export const getAdminAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAdminAlbums(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.createAlbum(req.body);
    res.status(201).json({ success: true, message: 'Album created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.updateAlbum(req.params.id as string, req.body);
    res.status(200).json({ success: true, message: 'Album updated successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.deleteAlbum(req.params.id as string);
    res.status(200).json({ success: true, message: 'Album deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
