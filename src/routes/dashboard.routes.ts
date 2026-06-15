import { Router } from 'express';
import { getUserStats, getAdminStats } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, getUserStats);
router.get('/admin/stats', authenticate, authorize(['Super Admin', 'Admin']), getAdminStats);

export default router;
