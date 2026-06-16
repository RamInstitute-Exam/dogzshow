import { Router } from 'express';
import { getAll, getById, getBySlug, create, update, remove, bulkRemove, bulkImport, uploadPhoto } from '../controllers/judge.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public', getAll);
router.get('/', getAll);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/bulk-import', authenticate, authorize(['Super Admin', 'Admin']), bulkImport);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
router.patch('/:id/photo', authenticate, authorize(['Super Admin', 'Admin']), uploadPhoto);
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);

export default router;
