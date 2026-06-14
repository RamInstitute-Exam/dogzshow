import { Router } from 'express';
import { getDogs, getDogById, createDog, updateDog, deleteDog, restoreDog, bulkDeleteDogs, bulkUpdateDogs } from '../controllers/dog.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getDogs);
router.get('/:id', getDogById);

// Protected routes (Any logged in user can create a dog, but only update/delete if owner - handled in service/controller)
router.post('/', authenticate, createDog);
router.put('/:id', authenticate, updateDog);
router.delete('/:id', authenticate, deleteDog);

// Admin / Super Admin routes
router.patch('/:id/restore', authenticate, authorize(['Super Admin', 'Admin']), restoreDog);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkDeleteDogs);
router.post('/bulk-update', authenticate, authorize(['Super Admin', 'Admin']), bulkUpdateDogs);

export default router;
