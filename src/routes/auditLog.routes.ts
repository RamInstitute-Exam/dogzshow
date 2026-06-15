import { Router } from 'express';
import { getAll, getById } from '../controllers/auditLog.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only Super Admins and Admins can view audit logs
router.get('/', authenticate, authorize(['Super Admin', 'Admin']), getAll);
router.get('/:id', authenticate, authorize(['Super Admin', 'Admin']), getById);

export default router;
