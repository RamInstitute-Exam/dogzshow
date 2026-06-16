import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Configure local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

// POST /api/v1/uploads
router.post('/', authenticate, upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url: fileUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
