"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("../controllers/registration.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/validate', auth_middleware_1.authenticate, registration_controller_1.validateRegistration);
// Admin Routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), registration_controller_1.getRegistrations);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), registration_controller_1.createRegistration);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), registration_controller_1.updateRegistrationStatus);
router.post('/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), registration_controller_1.bulkDeleteRegistrations);
exports.default = router;
