"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fci_controller_1 = require("../controllers/fci.controller");
const router = (0, express_1.Router)();
// Public FCI Group Routes
router.get('/', fci_controller_1.getFciGroups);
router.get('/:slug', fci_controller_1.getFciGroupDetail);
router.get('/:slug/breeds', fci_controller_1.getFciGroupBreeds);
exports.default = router;
