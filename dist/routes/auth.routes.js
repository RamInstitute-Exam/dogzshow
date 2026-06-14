"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/send-otp', auth_controller_1.sendOtp);
router.post('/verify-otp', auth_controller_1.verifyOtp);
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/social-login', auth_controller_1.socialLogin);
// Example of a protected route using RBAC
router.get('/me', auth_middleware_1.authenticate, (req, res) => {
    res.json({ user: req.user });
});
router.get('/admin-only', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Super Admin']), (req, res) => {
    res.json({ message: 'Welcome Admin' });
});
exports.default = router;
