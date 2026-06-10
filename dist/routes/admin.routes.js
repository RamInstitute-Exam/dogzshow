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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Secure all routes in this file with authenticate AND authorizeAdmin
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin);
// GET all users
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { profiles: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
// DELETE a user
router.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = String(req.params.id);
        // Prevent admins from deleting themselves via this route
        if (id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(400).json({ error: 'Cannot delete your own admin account.' });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Since we don't have onDelete: Cascade set up in Prisma for DogProfile -> User,
        // we must manually delete all images of the user's dogs, then their dogs, then the user.
        const userDogs = yield prisma_1.default.dogProfile.findMany({
            where: { ownerId: id },
            select: { id: true }
        });
        const dogIds = userDogs.map(d => d.id);
        if (dogIds.length > 0) {
            // Delete images of all these dogs
            yield prisma_1.default.image.deleteMany({
                where: { profileId: { in: dogIds } }
            });
            // Delete the dogs
            yield prisma_1.default.dogProfile.deleteMany({
                where: { ownerId: id }
            });
        }
        // Finally delete the user
        yield prisma_1.default.user.delete({
            where: { id }
        });
        res.status(200).json({ message: 'User and all associated data deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}));
// CREATE a user
router.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
        const newUser = yield prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                role: userRole
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { profiles: true }
                }
            }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}));
// UPDATE user role (RBAC)
router.patch('/users/:id/role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = String(req.params.id);
        const { role } = req.body;
        if (id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(400).json({ error: 'Cannot change your own role.' });
            return;
        }
        if (role !== 'ADMIN' && role !== 'USER') {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }
        const updatedUser = yield prisma_1.default.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { profiles: true }
                }
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
}));
// GET dashboard analytics aggregates (admin only)
router.get('/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield prisma_1.default.user.count();
        const totalDogs = yield prisma_1.default.dogProfile.count();
        const totalBreeders = yield prisma_1.default.breederProfile.count();
        const verifiedBreeders = yield prisma_1.default.breederProfile.count({ where: { verified: true } });
        // Group users by subscription plan
        const freeUsers = yield prisma_1.default.user.count({ where: { subscriptionType: 'FREE' } });
        const proUsers = yield prisma_1.default.user.count({ where: { subscriptionType: 'PRO' } });
        const enterpriseUsers = yield prisma_1.default.user.count({ where: { subscriptionType: 'ENTERPRISE' } });
        // Mock revenue tracking based on active subscriptions
        const totalRevenue = (proUsers * 499) + (enterpriseUsers * 1999);
        // Group dogs by breed
        const breedGroup = yield prisma_1.default.dogProfile.groupBy({
            by: ['breed'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 5,
        });
        const popularBreeds = breedGroup.map(item => ({
            breed: item.breed,
            count: item._count.id,
        }));
        // User growth mock datasets
        const userGrowth = [
            { name: 'Jan', users: Math.max(1, Math.round(totalUsers * 0.3)) },
            { name: 'Feb', users: Math.max(2, Math.round(totalUsers * 0.45)) },
            { name: 'Mar', users: Math.max(3, Math.round(totalUsers * 0.6)) },
            { name: 'Apr', users: Math.max(5, Math.round(totalUsers * 0.75)) },
            { name: 'May', users: Math.max(8, Math.round(totalUsers * 0.9)) },
            { name: 'Jun', users: totalUsers }
        ];
        res.status(200).json({
            summary: {
                totalUsers,
                totalDogs,
                totalBreeders,
                verifiedBreeders,
                totalRevenue,
            },
            subscriptionBreakdown: {
                FREE: freeUsers,
                PRO: proUsers,
                ENTERPRISE: enterpriseUsers,
            },
            popularBreeds,
            userGrowth,
        });
    }
    catch (error) {
        console.error('Error fetching admin analytics:', error);
        res.status(500).json({ error: 'Failed to aggregate system analytics data' });
    }
}));
// PATCH: Verify or unverify a breeder (admin only)
router.patch('/breeders/:id/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { verified } = req.body;
        if (typeof verified !== 'boolean') {
            res.status(400).json({ error: 'verified state must be a boolean' });
            return;
        }
        const breeder = yield prisma_1.default.breederProfile.findUnique({
            where: { id },
        });
        if (!breeder) {
            res.status(404).json({ error: 'Breeder profile not found' });
            return;
        }
        const updated = yield prisma_1.default.breederProfile.update({
            where: { id },
            data: { verified },
        });
        res.status(200).json({ message: `Breeder verification status updated to ${verified}`, breeder: updated });
    }
    catch (error) {
        console.error('Error modifying breeder verification:', error);
        res.status(500).json({ error: 'Failed to update breeder verification status' });
    }
}));
exports.default = router;
