import { Router } from 'express';
import { getAll, getById, create, update, remove, bulkRemove } from '../controllers/photoAlbum.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.patch('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);

export default router;
