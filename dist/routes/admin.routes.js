"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Ensure only admins can access these stats
router.get('/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), admin_controller_1.getAdminStats);
router.get('/users', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), admin_controller_1.getAdminUsers);
router.get('/dogs', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), admin_controller_1.getAdminDogs);
exports.default = router;
