"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ocr_controller_1 = require("../controllers/ocr.controller");
const router = (0, express_1.Router)();
// Endpoint for processing KCI Certificate uploads
router.post('/extract', ocr_controller_1.extractKciData);
exports.default = router;
