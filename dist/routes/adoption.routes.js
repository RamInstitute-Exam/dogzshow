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
// GET all received adoption requests for current owner's dogs (protected)
router.get('/received', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.user.userId;
        const requests = yield prisma_1.default.adoptionRequest.findMany({
            where: {
                dog: {
                    ownerId: ownerId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                dog: {
                    select: {
                        id: true,
                        name: true,
                        breed: true,
                        age: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(requests);
    }
    catch (error) {
        console.error('Error fetching received adoption requests:', error);
        res.status(500).json({ error: 'Failed to fetch received adoption requests' });
    }
}));
// GET all sent adoption requests (protected)
router.get('/sent', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const requests = yield prisma_1.default.adoptionRequest.findMany({
            where: {
                userId,
            },
            include: {
                dog: {
                    include: {
                        images: { take: 1 },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(requests);
    }
    catch (error) {
        console.error('Error fetching sent adoption requests:', error);
        res.status(500).json({ error: 'Failed to fetch sent adoption requests' });
    }
}));
// POST: Submit a new adoption request (protected)
router.post('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { dogId, notes } = req.body;
        if (!dogId) {
            res.status(400).json({ error: 'Dog ID is required' });
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
            res.status(400).json({ error: 'You cannot submit adoption requests for your own listings' });
            return;
        }
        // Check for existing request
        const existing = yield prisma_1.default.adoptionRequest.findFirst({
            where: {
                userId,
                dogId,
            },
        });
        if (existing) {
            res.status(400).json({ error: 'You have already submitted an adoption request for this dog' });
            return;
        }
        const request = yield prisma_1.default.adoptionRequest.create({
            data: {
                userId,
                dogId,
                notes,
            },
            include: {
                dog: true,
            },
        });
        res.status(201).json({ message: 'Adoption request submitted successfully', request });
    }
    catch (error) {
        console.error('Error creating adoption request:', error);
        res.status(500).json({ error: 'Failed to submit adoption request' });
    }
}));
// PATCH: Approve or reject adoption request (protected, owner of the dog only)
router.patch('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const id = String(req.params.id);
        const { status } = req.body;
        if (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'PENDING') {
            res.status(400).json({ error: 'Invalid status update' });
            return;
        }
        const request = yield prisma_1.default.adoptionRequest.findUnique({
            where: { id },
            include: {
                dog: true,
            },
        });
        if (!request) {
            res.status(404).json({ error: 'Adoption request not found' });
            return;
        }
        // Verify ownership
        if (request.dog.ownerId !== userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized to moderate this request' });
            return;
        }
        const updatedRequest = yield prisma_1.default.adoptionRequest.update({
            where: { id },
            data: { status },
        });
        // If approved, optionally update the dog's status
        if (status === 'APPROVED') {
            yield prisma_1.default.dogProfile.update({
                where: { id: request.dogId },
                data: {
                    status: request.dog.listingType === 'SALE' ? 'SOLD' : 'ADOPTED',
                },
            });
        }
        res.status(200).json({ message: `Request successfully marked as ${status}`, request: updatedRequest });
    }
    catch (error) {
        console.error('Error updating adoption request status:', error);
        res.status(500).json({ error: 'Failed to update adoption request status' });
    }
}));
exports.default = router;
