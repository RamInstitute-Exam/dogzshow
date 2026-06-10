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
// POST: Flag/Report a listing or user (protected)
router.post('/report', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reporterId = req.user.userId;
        const { targetType, targetId, reason } = req.body;
        if (!targetType || !targetId || !reason) {
            res.status(400).json({ error: 'targetType, targetId, and reason are required' });
            return;
        }
        if (targetType !== 'DOG' && targetType !== 'USER') {
            res.status(400).json({ error: 'Invalid report target type (must be DOG or USER)' });
            return;
        }
        const report = yield prisma_1.default.report.create({
            data: {
                reporterId,
                targetType,
                targetId,
                reason: String(reason),
            },
        });
        res.status(201).json({ message: 'Safety report filed successfully', report });
    }
    catch (error) {
        console.error('Error submitting safety report:', error);
        res.status(500).json({ error: 'Failed to file report' });
    }
}));
// GET: Fetch all moderation reports (protected, admin only)
router.get('/reports', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield prisma_1.default.report.findMany({
            include: {
                reporter: {
                    select: { id: true, email: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(reports);
    }
    catch (error) {
        console.error('Error fetching safety reports:', error);
        res.status(500).json({ error: 'Failed to retrieve moderation queue' });
    }
}));
// PATCH: Resolve or dismiss a report (protected, admin only)
router.patch('/reports/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { status } = req.body;
        if (status !== 'RESOLVED' && status !== 'DISMISSED' && status !== 'PENDING') {
            res.status(400).json({ error: 'Invalid status value' });
            return;
        }
        const report = yield prisma_1.default.report.findUnique({
            where: { id },
        });
        if (!report) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        const updated = yield prisma_1.default.report.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({ message: `Report status set to ${status}`, report: updated });
    }
    catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
}));
exports.default = router;
