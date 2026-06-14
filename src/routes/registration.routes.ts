import { Router } from 'express';
import { validateRegistration, getRegistrations, createRegistration, updateRegistrationStatus, bulkDeleteRegistrations } from '../controllers/registration.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/validate', authenticate, validateRegistration);

// Admin Routes
router.get('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getRegistrations);
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createRegistration);
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updateRegistrationStatus);
router.post('/bulk-delete', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), bulkDeleteRegistrations);

export default router;
