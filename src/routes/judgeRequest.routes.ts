import { Router } from 'express';
import { getAll, getById, create, update, remove, bulkRemove } from '../controllers/judgeRequest.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Super Admin', 'Admin']), getAll);
router.get('/:id', authenticate, authorize(['Super Admin', 'Admin']), getById);
router.post('/', create); // Public can submit requests
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);

export default router;
