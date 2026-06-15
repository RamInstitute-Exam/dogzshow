import { Router } from 'express';
import { getMenus, createMenu, updateMenu, deleteMenu, reorderMenus } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public read
router.get('/', getMenus);

// Admin only operations
router.post('/', authenticate, authorize(['Admin', 'Super Admin']), createMenu);
router.post('/reorder', authenticate, authorize(['Admin', 'Super Admin']), reorderMenus);
router.put('/:id', authenticate, authorize(['Admin', 'Super Admin']), updateMenu);
router.delete('/:id', authenticate, authorize(['Admin', 'Super Admin']), deleteMenu);

export default router;
