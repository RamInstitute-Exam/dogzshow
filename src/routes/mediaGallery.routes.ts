import { Router } from 'express';
import {
  getPublicImages,
  getPublicVideos,
  getPublicAlbums,
  getPublicCategories,
  getFeaturedImages,
  getFeaturedVideos,
  getById,
  incrementViews,
  incrementLikes,
  getAdminImages,
  getAdminVideos,
  getAdminCategories,
  getAdminAlbums,
  createImage,
  createVideo,
  createCategory,
  createAlbum,
  updateMedia,
  deleteMedia,
  updateCategory,
  deleteCategory,
  updateAlbum,
  deleteAlbum
} from '../controllers/mediaGallery.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// ==========================================
// Public Routes (Prefix: /api/v1/public/media)
// ==========================================
router.get('/images', getPublicImages);
router.get('/videos', getPublicVideos);
router.get('/albums', getPublicAlbums);
router.get('/categories', getPublicCategories);
router.get('/featured-images', getFeaturedImages);
router.get('/featured-videos', getFeaturedVideos);
router.get('/:id', getById);
router.post('/increment-views/:id', incrementViews);
router.post('/increment-likes/:id', incrementLikes);

// ==========================================
// Admin CRUD Routes (Prefix: /api/v1/media)
// ==========================================

// Images
router.get('/admin/images', authenticate, authorize(['Super Admin', 'Admin']), getAdminImages);
router.post('/admin/image', authenticate, authorize(['Super Admin', 'Admin']), createImage);

// Videos
router.get('/admin/videos', authenticate, authorize(['Super Admin', 'Admin']), getAdminVideos);
router.post('/admin/video', authenticate, authorize(['Super Admin', 'Admin']), createVideo);

// Categories
router.get('/admin/categories', authenticate, authorize(['Super Admin', 'Admin']), getAdminCategories);
router.post('/admin/category', authenticate, authorize(['Super Admin', 'Admin']), createCategory);
router.put('/admin/category/:id', authenticate, authorize(['Super Admin', 'Admin']), updateCategory);
router.delete('/admin/category/:id', authenticate, authorize(['Super Admin', 'Admin']), deleteCategory);

// Albums
router.get('/admin/albums', authenticate, authorize(['Super Admin', 'Admin']), getAdminAlbums);
router.post('/admin/album', authenticate, authorize(['Super Admin', 'Admin']), createAlbum);
router.put('/admin/album/:id', authenticate, authorize(['Super Admin', 'Admin']), updateAlbum);
router.delete('/admin/album/:id', authenticate, authorize(['Super Admin', 'Admin']), deleteAlbum);

// Media Item Update/Delete
router.put('/admin/:id', authenticate, authorize(['Super Admin', 'Admin']), updateMedia);
router.delete('/admin/:id', authenticate, authorize(['Super Admin', 'Admin']), deleteMedia);

export default router;
