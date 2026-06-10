import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RW6NQI0SjBZbsw';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '75u5Qa5Di6duxkFDS8aPtzot';

// POST: Create a billing checkout order (protected)
router.post('/checkout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    
    if (plan !== 'PRO' && plan !== 'ENTERPRISE') {
      res.status(400).json({ error: 'Invalid subscription plan' });
      return;
    }

    // Pro = 499 INR, Enterprise = 1999 INR
    const amountInINR = plan === 'PRO' ? 499 : 1999;
    const amountInPaise = amountInINR * 100;

    // Call Razorpay API using native fetch to create the order
    const authHeader = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
    
    const response = await fetch(
      'https://api.razorpay.com/v1/orders',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay order creation failed:', errorData);
      res.status(500).json({ error: 'Failed to initialize payment gateway' });
      return;
    }

    const data: any = await response.json();

    res.status(201).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      plan,
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error.message);
    res.status(500).json({ error: 'Failed to initialize payment gateway' });
  }
});

// POST: Verify payment signature and activate plan (protected)
router.post('/verify', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      res.status(400).json({ error: 'Missing payment signature verification parameters' });
      return;
    }

    // Verify signature using HMAC SHA256
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      res.status(400).json({ error: 'Payment signature verification failed. Transaction was not authorized.' });
      return;
    }

    // Set expiry to 30 days in the future
    const subExpiresAt = new Date();
    subExpiresAt.setDate(subExpiresAt.getDate() + 30);

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: plan,
        subExpiresAt,
      },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionType: true,
        subExpiresAt: true,
      },
    });

    res.status(200).json({
      message: `Subscription successfully updated to ${plan}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Subscription verification failed:', error);
    res.status(500).json({ error: 'Failed to process and upgrade subscription status' });
  }
});

export default router;
