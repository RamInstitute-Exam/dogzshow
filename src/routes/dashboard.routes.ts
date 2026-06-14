import { Router } from 'express';
import { getUserStats, getAdminStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRoles, UserRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/stats', authenticate, getUserStats);
router.get('/admin/stats', authenticate, requireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getAdminStats);

export default router;
