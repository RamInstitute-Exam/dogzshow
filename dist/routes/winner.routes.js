"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const winner_controller_1 = require("../controllers/winner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/public', winner_controller_1.getPublicWinners);
router.post('/tags', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN']), winner_controller_1.issueWinnerTag);
router.get('/dogs/:dogId/tags', winner_controller_1.getDogWinnerTags);
// Admin Routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), winner_controller_1.getWinners);
router.post('/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), winner_controller_1.bulkDeleteWinners);
exports.default = router;
