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
exports.getRefunds = exports.getTransactions = exports.razorpayWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma"));
const razorpayWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret';
        const shasum = crypto_1.default.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');
        if (digest === req.headers['x-razorpay-signature']) {
            console.log('Razorpay signature valid, processing event...');
            const event = req.body.event;
            if (event === 'payment.captured') {
                const paymentData = req.body.payload.payment.entity;
                // Mock updating database with payment success
                yield prisma_1.default.payment.updateMany({
                    where: { transactionId: paymentData.id },
                    data: { status: 'SUCCESS' }
                });
                console.log(`Payment captured for transaction: ${paymentData.id}`);
            }
            res.status(200).json({ status: 'ok' });
        }
        else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});
exports.razorpayWebhook = razorpayWebhook;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const [transactions, total] = yield Promise.all([
            prisma_1.default.payment.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    registration: { include: { event: true, dog: true } }
                }
            }),
            prisma_1.default.payment.count()
        ]);
        res.status(200).json({
            success: true,
            data: transactions,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
});
exports.getTransactions = getTransactions;
const getRefunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refunds = yield prisma_1.default.refund.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                payment: {
                    include: {
                        user: { select: { firstName: true, lastName: true, email: true } }
                    }
                }
            }
        });
        res.status(200).json({ success: true, data: refunds });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch refunds' });
    }
});
exports.getRefunds = getRefunds;
