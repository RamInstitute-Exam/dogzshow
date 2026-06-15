import { Router } from 'express';
import {
  getMenus,
  getAllMenusForAdmin,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────
// GET /menus?position=NAVBAR&role=Guest
router.get('/', getMenus);

// ── Admin only ─────────────────────────────────────────────────────
// GET /menus/all — returns ALL menus (ignores visibility) for admin management
router.get('/all', authenticate, authorize(['Admin', 'Super Admin']), getAllMenusForAdmin);

// Reorder (must be before /:id to avoid conflict)
router.post('/reorder', authenticate, authorize(['Admin', 'Super Admin']), reorderMenus);

router.post('/', authenticate, authorize(['Admin', 'Super Admin']), createMenu);
router.put('/:id', authenticate, authorize(['Admin', 'Super Admin']), updateMenu);
router.delete('/:id', authenticate, authorize(['Admin', 'Super Admin']), deleteMenu);

export default router;
