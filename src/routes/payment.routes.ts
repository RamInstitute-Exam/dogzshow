import { Router } from 'express';
import { createOrder, verifyPayment, getTransactions, getRefunds } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// User payment flows
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

// Admin reports
router.get('/transactions', authenticate, authorize(['Super Admin', 'Admin']), getTransactions);
router.get('/refunds', authenticate, authorize(['Super Admin', 'Admin']), getRefunds);

export default router;
