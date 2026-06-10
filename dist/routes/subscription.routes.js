"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RW6NQI0SjBZbsw';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '75u5Qa5Di6duxkFDS8aPtzot';
// POST: Create a billing checkout order (protected)
router.post('/checkout', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield fetch('https://api.razorpay.com/v1/orders', {
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
        });
        if (!response.ok) {
            const errorData = yield response.json();
            console.error('Razorpay order creation failed:', errorData);
            res.status(500).json({ error: 'Failed to initialize payment gateway' });
            return;
        }
        const data = yield response.json();
        res.status(201).json({
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            plan,
        });
    }
    catch (error) {
        console.error('Razorpay order creation failed:', error.message);
        res.status(500).json({ error: 'Failed to initialize payment gateway' });
    }
}));
// POST: Verify payment signature and activate plan (protected)
router.post('/verify', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
            res.status(400).json({ error: 'Missing payment signature verification parameters' });
            return;
        }
        // Verify signature using HMAC SHA256
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto_1.default
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
        const updatedUser = yield prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Subscription verification failed:', error);
        res.status(500).json({ error: 'Failed to process and upgrade subscription status' });
    }
}));
exports.default = router;
