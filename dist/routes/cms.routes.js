"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("../controllers/cms.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Global CMS
router.get('/global', cms_controller_1.getGlobal);
router.put('/global', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), cms_controller_1.updateGlobal);
// Specific CMS endpoints for Frontend
router.get('/home', cms_controller_1.getHomeCms);
router.get('/events', cms_controller_1.getEventsCms);
// Page CMS
router.get('/pages', cms_controller_1.getAllPages); // Important: /pages must be before /:slug so 'pages' is not treated as a slug
router.get('/:slug', cms_controller_1.getPageBySlug);
router.put('/:slug', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), cms_controller_1.updatePage);
exports.default = router;
