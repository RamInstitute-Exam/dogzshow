import { Router } from 'express';
import { extractKciData } from '../controllers/ocr.controller';

const router = Router();

// Endpoint for processing KCI Certificate uploads
router.post('/extract', extractKciData);

export default router;
