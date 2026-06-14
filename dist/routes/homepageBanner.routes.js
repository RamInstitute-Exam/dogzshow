"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homepageBanner_controller_1 = require("../controllers/homepageBanner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public Routes
router.get('/', homepageBanner_controller_1.getActiveBanners);
// Admin Routes
router.get('/all', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), homepageBanner_controller_1.getAllBanners);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), homepageBanner_controller_1.createBanner);
router.post('/reorder', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), homepageBanner_controller_1.reorderBanners);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), homepageBanner_controller_1.updateBanner);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), homepageBanner_controller_1.deleteBanner);
exports.default = router;
