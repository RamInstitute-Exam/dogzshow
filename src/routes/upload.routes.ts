import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadToS3, getS3Url } from '../config/s3';

const router = Router();

// Configure S3 storage using the shared middleware
const upload = uploadToS3('general-uploads').single('file');

// POST /api/v1/uploads
router.post('/', authenticate, upload, (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // multer-s3 adds the 'location' property with the full S3 URL
    // If it's not present for some reason, fallback to generating it from the key
    const fileUrl = req.file.location || getS3Url(req.file.key);
    
    res.status(200).json({ 
      success: true, 
      url: fileUrl,
      bucket: req.file.bucket,
      key: req.file.key,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
