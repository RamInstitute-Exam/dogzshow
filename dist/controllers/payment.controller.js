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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefunds = exports.getTransactions = exports.verifyPayment = exports.createOrder = void 0;
const payment_service_1 = require("../services/payment.service");
const paymentService = new payment_service_1.PaymentService();
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { registrationId, amount } = req.body;
        if (!registrationId || !amount) {
            res.status(400).json({ success: false, message: 'registrationId and amount are required' });
            return;
        }
        const data = yield paymentService.createOrder({ registrationId, amount, userId });
        res.status(201).json({ success: true, message: 'Order created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createOrder = createOrder;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ success: false, message: 'Invalid payment verification payload' });
            return;
        }
        const data = yield paymentService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.verifyPayment = verifyPayment;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield paymentService.getTransactions(req.query);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getTransactions = getTransactions;
const getRefunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield paymentService.getRefunds(req.query);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getRefunds = getRefunds;
