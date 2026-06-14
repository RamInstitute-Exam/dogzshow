import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, restoreUser, bulkDeleteUsers, bulkUpdateUsers } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only Admins can manage users freely
router.get('/', authenticate, authorize(['Super Admin', 'Admin']), getUsers);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), createUser);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkDeleteUsers);
router.post('/bulk-update', authenticate, authorize(['Super Admin', 'Admin']), bulkUpdateUsers);

// Individual operations (users can view/update themselves, handled logically if needed, but for now strict admin)
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), deleteUser);
router.patch('/:id/restore', authenticate, authorize(['Super Admin', 'Admin']), restoreUser);

export default router;
