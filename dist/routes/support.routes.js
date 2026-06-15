"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("../controllers/support.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, support_controller_1.getAll);
router.get('/:id', auth_middleware_1.authenticate, support_controller_1.getById);
router.post('/', auth_middleware_1.authenticate, support_controller_1.create); // Anyone logged in can create a support ticket
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), support_controller_1.update);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), support_controller_1.remove);
router.post('/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), support_controller_1.bulkRemove);
exports.default = router;
