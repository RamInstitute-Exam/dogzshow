"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competition_controller_1 = require("../controllers/competition.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/matches', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'JUDGE']), competition_controller_1.getMatches);
router.post('/matches/score', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'JUDGE']), competition_controller_1.scoreMatch);
exports.default = router;
