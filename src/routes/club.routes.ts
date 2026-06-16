import { Router } from 'express';
import { getAll, getById, getBySlug, create, update, remove, bulkRemove, bulkUpload } from '../controllers/club.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public', getAll);
router.get('/', getAll);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);
router.post('/bulk-upload', authenticate, authorize(['Super Admin', 'Admin']), bulkUpload);

export default router;
