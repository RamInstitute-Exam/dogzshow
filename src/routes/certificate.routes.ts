import { Router } from 'express';
import { getUserKciCertificates, getAdminKciCertificates, verifyKciCertificate } from '../controllers/kci.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// User endpoints
router.get('/', authenticate, getUserKciCertificates);

// Admin endpoints
router.get('/admin', authenticate, authorize(['Super Admin', 'Admin']), getAdminKciCertificates);
router.put('/admin/:id/verify', authenticate, authorize(['Super Admin', 'Admin']), verifyKciCertificate);

export default router;
