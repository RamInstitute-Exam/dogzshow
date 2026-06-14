"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Notice: Webhook should usually bypass the JSON parsing if you need raw body,
// but for simplicity and express.json() defaults we keep it simple here.
router.post('/webhook', payment_controller_1.razorpayWebhook);
router.get('/transactions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), payment_controller_1.getTransactions);
router.get('/refunds', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), payment_controller_1.getRefunds);
exports.default = router;
