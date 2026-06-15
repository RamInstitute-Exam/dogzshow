"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// User payment flows
router.post('/create-order', auth_middleware_1.authenticate, payment_controller_1.createOrder);
router.post('/verify', auth_middleware_1.authenticate, payment_controller_1.verifyPayment);
// Admin reports
router.get('/transactions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), payment_controller_1.getTransactions);
router.get('/refunds', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), payment_controller_1.getRefunds);
exports.default = router;
