import { Router } from 'express';
import { uploadToS3 } from '../config/s3';
import {
  uploadPhoto,
  getPhotos,
  getFeaturedPhotos,
  getPhotoBySlug,
  deletePhoto,
  uploadVideo,
  getVideos,
  getFeaturedVideos,
  getVideoBySlug,
  deleteVideo,
} from '../controllers/media.controller';

const router = Router();

// Middleware instances for Multer
const photoUpload = uploadToS3('media/photos').single('file');
const videoUpload = uploadToS3('media/videos').single('file'); // Note: single file upload up to 2GB

// ==========================
// PHOTOS ROUTES
// ==========================
router.get('/photos', getPhotos);
router.get('/photos/featured', getFeaturedPhotos);
router.get('/photos/:slug', getPhotoBySlug);
router.post('/photos', photoUpload, uploadPhoto);
// router.put('/photos/:id', updatePhoto);
router.delete('/photos/:id', deletePhoto);

// ==========================
// VIDEOS ROUTES
// ==========================
router.get('/videos', getVideos);
router.get('/videos/featured', getFeaturedVideos);
router.get('/videos/:slug', getVideoBySlug);
router.post('/videos', videoUpload, uploadVideo);
// router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

export default router;
