"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("../controllers/cms.controller");
const router = (0, express_1.Router)();
// Public CMS Routes for Frontend Consumption
router.get('/home', cms_controller_1.getHomepageCms);
router.get('/global', cms_controller_1.getGlobalCms);
router.get('/events', cms_controller_1.getEventsCms);
router.get('/events/:slug', cms_controller_1.getEventDetailCms);
exports.default = router;
