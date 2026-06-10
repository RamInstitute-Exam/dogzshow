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
// GET all breeders (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verified, search } = req.query;
        const whereClause = {};
        if (verified === 'true') {
            whereClause.verified = true;
        }
        if (search) {
            whereClause.OR = [
                { companyName: { contains: String(search) } },
                { address: { contains: String(search) } },
            ];
        }
        const breeders = yield prisma_1.default.breederProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(breeders);
    }
    catch (error) {
        console.error('Error fetching breeders:', error);
        res.status(500).json({ error: 'Failed to fetch breeders' });
    }
}));
// GET current user's breeder profile (protected)
router.get('/me', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const profile = yield prisma_1.default.breederProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            res.status(404).json({ error: 'Breeder profile not found' });
            return;
        }
        res.status(200).json(profile);
    }
    catch (error) {
        console.error('Error fetching breeder profile:', error);
        res.status(500).json({ error: 'Failed to fetch breeder profile' });
    }
}));
// GET a breeder by user ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const breeder = yield prisma_1.default.breederProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profiles: {
                            include: {
                                images: true,
                            },
                        },
                    },
                },
            },
        });
        if (!breeder) {
            res.status(404).json({ error: 'Breeder not found' });
            return;
        }
        res.status(200).json(breeder);
    }
    catch (error) {
        console.error('Error fetching breeder details:', error);
        res.status(500).json({ error: 'Failed to fetch breeder profile' });
    }
}));
// POST to create or update breeder profile (protected)
router.post('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { companyName, licenseNo, address, phone, website } = req.body;
        if (!companyName) {
            res.status(400).json({ error: 'Company Name is required' });
            return;
        }
        // Upsert breeder profile
        const profile = yield prisma_1.default.breederProfile.upsert({
            where: { userId },
            update: {
                companyName,
                licenseNo,
                address,
                phone,
                website,
            },
            create: {
                userId,
                companyName,
                licenseNo,
                address,
                phone,
                website,
                verified: false, // Must be verified by admin
            },
        });
        res.status(200).json({ message: 'Breeder profile updated successfully', profile });
    }
    catch (error) {
        console.error('Error setting breeder profile:', error);
        res.status(500).json({ error: 'Failed to save breeder profile' });
    }
}));
exports.default = router;
