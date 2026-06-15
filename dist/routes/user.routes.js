"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Only Admins can manage users freely
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.getUsers);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.createUser);
router.post('/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.bulkDeleteUsers);
router.post('/bulk-update', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.bulkUpdateUsers);
// Individual operations (users can view/update themselves, handled logically if needed, but for now strict admin)
router.get('/:id', auth_middleware_1.authenticate, user_controller_1.getUserById);
router.put('/:id', auth_middleware_1.authenticate, user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.deleteUser);
router.patch('/:id/restore', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), user_controller_1.restoreUser);
exports.default = router;
