import { Router } from 'express';
import { uploadMedia, getPublicGallery } from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticate, authorize(['Admin']), upload.single('media'), uploadMedia);
router.get('/public', getPublicGallery);

export default router;
