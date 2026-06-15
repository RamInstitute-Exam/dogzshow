"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fci_controller_1 = require("../controllers/fci.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public / Authenticated Read routes
router.get('/', auth_middleware_1.authenticate, fci_controller_1.getFciGroups);
router.get('/:id', auth_middleware_1.authenticate, fci_controller_1.getFciGroupDetail);
// Admin Only Write Routes
const adminOnly = (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']);
router.post('/', auth_middleware_1.authenticate, adminOnly, fci_controller_1.createFciGroup);
router.put('/:id', auth_middleware_1.authenticate, adminOnly, fci_controller_1.updateFciGroup);
router.delete('/:id', auth_middleware_1.authenticate, adminOnly, fci_controller_1.deleteFciGroup);
// Breeds
router.post('/:id/breeds', auth_middleware_1.authenticate, adminOnly, fci_controller_1.addBreed);
router.put('/breeds/:breedId', auth_middleware_1.authenticate, adminOnly, fci_controller_1.updateBreed);
router.delete('/breeds/:breedId', auth_middleware_1.authenticate, adminOnly, fci_controller_1.deleteBreed);
exports.default = router;
