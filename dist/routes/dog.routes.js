"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dog_controller_1 = require("../controllers/dog.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', dog_controller_1.getDogs);
router.get('/:id', dog_controller_1.getDogById);
// Protected routes (Any logged in user can create a dog, but only update/delete if owner - handled in service/controller)
router.post('/', auth_middleware_1.authenticate, dog_controller_1.createDog);
router.put('/:id', auth_middleware_1.authenticate, dog_controller_1.updateDog);
router.delete('/:id', auth_middleware_1.authenticate, dog_controller_1.deleteDog);
// Admin / Super Admin routes
router.patch('/:id/restore', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), dog_controller_1.restoreDog);
router.post('/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), dog_controller_1.bulkDeleteDogs);
router.post('/bulk-update', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Super Admin', 'Admin']), dog_controller_1.bulkUpdateDogs);
exports.default = router;
