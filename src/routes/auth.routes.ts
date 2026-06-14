import { Router } from 'express';
import { register, login, refreshToken, socialLogin, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/social-login', socialLogin);

// Example of a protected route using RBAC
router.get('/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

router.get('/admin-only', authenticate, authorize(['Admin', 'Super Admin']), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

export default router;
