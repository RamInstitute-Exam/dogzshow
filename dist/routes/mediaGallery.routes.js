"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaGallery_controller_1 = require("../controllers/mediaGallery.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ==========================================
// Public Routes (Prefix: /api/v1/public/media)
// ==========================================
router.get('/images', mediaGallery_controller_1.getPublicImages);
router.get('/videos', mediaGallery_controller_1.getPublicVideos);
router.get('/albums', mediaGallery_controller_1.getPublicAlbums);
router.get('/categories', mediaGallery_controller_1.getPublicCategories);
router.get('/featured-images', mediaGallery_controller_1.getFeaturedImages);
router.get('/featured-videos', mediaGallery_controller_1.getFeaturedVideos);
router.get('/:id', mediaGallery_controller_1.getById);
router.post('/increment-views/:id', mediaGallery_controller_1.incrementViews);
router.post('/increment-likes/:id', mediaGallery_controller_1.incrementLikes);
// ==========================================
// Admin CRUD Routes (Prefix: /api/v1/media)
// ==========================================
// Images
router.get('/admin/images', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.getAdminImages);
router.post('/admin/image', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.createImage);
// Videos
router.get('/admin/videos', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.getAdminVideos);
router.post('/admin/video', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.createVideo);
// Categories
router.get('/admin/categories', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.getAdminCategories);
router.post('/admin/category', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.createCategory);
router.put('/admin/category/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.updateCategory);
router.delete('/admin/category/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.deleteCategory);
// Albums
router.get('/admin/albums', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.getAdminAlbums);
router.post('/admin/album', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.createAlbum);
router.put('/admin/album/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.updateAlbum);
router.delete('/admin/album/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.deleteAlbum);
// Media Item Update/Delete
router.put('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.updateMedia);
router.delete('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), mediaGallery_controller_1.deleteMedia);
exports.default = router;
