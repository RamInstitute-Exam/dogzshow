"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pageBanner_controller_1 = require("../controllers/pageBanner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public Route
router.get('/:slug', pageBanner_controller_1.getBannerBySlug);
// Admin Routes
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']));
router.route('/')
    .get(pageBanner_controller_1.getAllBanners)
    .post(pageBanner_controller_1.createBanner);
router.route('/:id')
    .put(pageBanner_controller_1.updateBanner)
    .delete(pageBanner_controller_1.deleteBanner);
exports.default = router;
