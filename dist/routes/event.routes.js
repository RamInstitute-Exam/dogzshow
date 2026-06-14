"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Clubs
router.get('/clubs', event_controller_1.getClubs);
router.post('/clubs', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin', 'Sub Admin']), event_controller_1.createClub);
// Events
router.get('/', event_controller_1.getEvents);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN']), event_controller_1.createEvent);
router.get('/upcoming', event_controller_1.getUpcomingEvents);
router.get('/registered', auth_middleware_1.authenticate, event_controller_1.getUserRegistrations);
router.get('/past', auth_middleware_1.authenticate, event_controller_1.getPastEvents);
// Admin Routes
router.get('/admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN']), event_controller_1.getAdminEvents);
router.get('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN']), event_controller_1.getEventById);
router.post('/admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), event_controller_1.createEvent);
router.put('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN']), event_controller_1.updateEvent);
router.delete('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), event_controller_1.deleteEvent);
router.post('/admin/bulk-delete', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'SUPER_ADMIN']), event_controller_1.bulkDeleteEvents);
exports.default = router;
