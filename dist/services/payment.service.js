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
exports.PaymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma"));
class PaymentService {
    constructor() {
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
        });
    }
    createOrder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { registrationId, amount, userId } = data;
            const reg = yield prisma_1.default.eventRegistration.findUnique({ where: { id: registrationId } });
            if (!reg)
                throw new Error('Registration not found');
            const options = {
                amount: amount * 100, // paise
                currency: "INR",
                receipt: `rcpt_${registrationId.slice(0, 10)}`
            };
            const order = yield this.razorpay.orders.create(options);
            const payment = yield prisma_1.default.payment.create({
                data: {
                    registrationId,
                    userId,
                    amount,
                    currency: 'INR',
                    status: 'PENDING',
                    transactionId: order.id,
                    paymentGateway: 'RAZORPAY'
                }
            });
            yield prisma_1.default.paymentLog.create({
                data: {
                    paymentId: payment.id,
                    status: 'ORDER_CREATED',
                    responsePayload: order
                }
            });
            return { order, paymentId: payment.id };
        });
    }
    verifyPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
            const payment = yield prisma_1.default.payment.findUnique({
                where: { transactionId: razorpay_order_id }
            });
            if (!payment)
                throw new Error('Payment record not found');
            const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto_1.default
                .createHmac("sha256", secret)
                .update(body.toString())
                .digest("hex");
            const isAuthentic = expectedSignature === razorpay_signature;
            if (isAuthentic) {
                yield prisma_1.default.payment.update({
                    where: { id: payment.id },
                    data: { status: 'SUCCESS', transactionId: razorpay_payment_id }
                });
                yield prisma_1.default.eventRegistration.update({
                    where: { id: payment.registrationId },
                    data: { status: 'CONFIRMED' }
                });
                yield prisma_1.default.paymentLog.create({
                    data: {
                        paymentId: payment.id,
                        status: 'SUCCESS',
                        responsePayload: data
                    }
                });
                return { success: true, message: 'Payment verified successfully' };
            }
            else {
                yield prisma_1.default.payment.update({
                    where: { id: payment.id },
                    data: { status: 'FAILED' }
                });
                yield prisma_1.default.paymentLog.create({
                    data: {
                        paymentId: payment.id,
                        status: 'FAILED_VERIFICATION',
                        responsePayload: data
                    }
                });
                throw new Error('Payment verification failed');
            }
        });
    }
    getTransactions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const [data, total] = yield Promise.all([
                prisma_1.default.payment.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { user: true, registration: { include: { event: true, dog: true } } }
                }),
                prisma_1.default.payment.count()
            ]);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        });
    }
    getRefunds(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const [data, total] = yield Promise.all([
                prisma_1.default.refund.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { payment: { include: { user: true } } }
                }),
                prisma_1.default.refund.count()
            ]);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        });
    }
}
exports.PaymentService = PaymentService;
