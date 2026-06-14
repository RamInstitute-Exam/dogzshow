import { Router } from 'express';
import { 
  getFciGroups, 
  getFciGroupDetail, 
  createFciGroup, 
  updateFciGroup, 
  deleteFciGroup,
  addBreed,
  updateBreed,
  deleteBreed
} from '../controllers/fci.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRoles, UserRole } from '../middlewares/rbac.middleware';

const router = Router();

// Public / Authenticated Read routes
router.get('/', authenticate, getFciGroups);
router.get('/:id', authenticate, getFciGroupDetail);

// Admin Only Write Routes
const adminOnly = requireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

router.post('/', authenticate, adminOnly, createFciGroup);
router.put('/:id', authenticate, adminOnly, updateFciGroup);
router.delete('/:id', authenticate, adminOnly, deleteFciGroup);

// Breeds
router.post('/:id/breeds', authenticate, adminOnly, addBreed);
router.put('/breeds/:breedId', authenticate, adminOnly, updateBreed);
router.delete('/breeds/:breedId', authenticate, adminOnly, deleteBreed);

export default router;
