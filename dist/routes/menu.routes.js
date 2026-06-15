"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menu_controller_1 = require("../controllers/menu.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public read
router.get('/', menu_controller_1.getMenus);
// Admin only operations
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Super Admin']), menu_controller_1.createMenu);
router.post('/reorder', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Super Admin']), menu_controller_1.reorderMenus);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Super Admin']), menu_controller_1.updateMenu);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Super Admin']), menu_controller_1.deleteMenu);
exports.default = router;
