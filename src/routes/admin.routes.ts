import { Router } from 'express';
import { getAdminStats, getAdminUsers, getAdminDogs } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Ensure only admins can access these stats
router.get('/stats', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAdminStats);
router.get('/users', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAdminUsers);
router.get('/dogs', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAdminDogs);

export default router;
