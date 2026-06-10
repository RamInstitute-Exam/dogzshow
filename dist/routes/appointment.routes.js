"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET all appointments for current user (protected, both user and breeder roles)
router.get('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.userId;
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { breederId: currentUserId },
                ],
            },
            include: {
                user: {
                    select: { id: true, email: true },
                },
                breeder: {
                    select: { id: true, email: true },
                },
                dog: {
                    select: { id: true, name: true, breed: true },
                },
            },
            orderBy: {
                dateTime: 'asc',
            },
        });
        res.status(200).json(appointments);
    }
    catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
}));
// POST: Schedule a breeding consultation / appointment (protected)
router.post('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { dogId, dateTime, notes } = req.body;
        if (!dogId || !dateTime) {
            res.status(400).json({ error: 'Dog ID and appointment date/time are required' });
            return;
        }
        const dog = yield prisma_1.default.dogProfile.findUnique({
            where: { id: dogId },
        });
        if (!dog) {
            res.status(404).json({ error: 'Dog listing not found' });
            return;
        }
        if (dog.ownerId === userId) {
            res.status(400).json({ error: 'You cannot book consultations for your own dogs' });
            return;
        }
        const appointment = yield prisma_1.default.appointment.create({
            data: {
                userId,
                breederId: dog.ownerId,
                dogId,
                dateTime: new Date(dateTime),
                notes: notes || '',
            },
        });
        res.status(201).json({ message: 'Consultation appointment scheduled successfully', appointment });
    }
    catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({ error: 'Failed to schedule appointment' });
    }
}));
// PATCH: Update appointment status (protected)
router.patch('/:id/status', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.userId;
        const id = String(req.params.id);
        const { status } = req.body;
        if (status !== 'CONFIRMED' && status !== 'CANCELLED' && status !== 'PENDING') {
            res.status(400).json({ error: 'Invalid status value' });
            return;
        }
        const appointment = yield prisma_1.default.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }
        // Verify authorized user (either the attendee or the host/breeder)
        if (appointment.userId !== currentUserId && appointment.breederId !== currentUserId && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized to update this appointment' });
            return;
        }
        const updated = yield prisma_1.default.appointment.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({ message: `Appointment status updated to ${status}`, appointment: updated });
    }
    catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
}));
exports.default = router;
