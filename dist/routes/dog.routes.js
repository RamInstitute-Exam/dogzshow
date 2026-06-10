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
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// GET all dogs (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const whereClause = search
            ? {
                name: {
                    contains: String(search),
                },
            }
            : {};
        const dogs = yield prisma_1.default.dogProfile.findMany({
            where: whereClause,
            include: {
                images: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(dogs);
    }
    catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ error: 'Failed to fetch dog profiles' });
    }
}));
// GET current user's dogs (protected)
router.get('/me', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.user.userId;
        const dogs = yield prisma_1.default.dogProfile.findMany({
            where: { ownerId },
            include: {
                images: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(dogs);
    }
    catch (error) {
        console.error('Error fetching user dogs:', error);
        res.status(500).json({ error: 'Failed to fetch your dog profiles' });
    }
}));
// GET a single dog by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const dog = yield prisma_1.default.dogProfile.findUnique({
            where: { id },
            include: {
                images: true,
                owner: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        if (!dog) {
            res.status(404).json({ error: 'Dog profile not found' });
            return;
        }
        res.status(200).json(dog);
    }
    catch (error) {
        console.error('Error fetching dog:', error);
        res.status(500).json({ error: 'Failed to fetch dog profile' });
    }
}));
// POST to create a new dog profile (protected)
router.post('/', auth_middleware_1.authenticate, upload_middleware_1.upload.array('photos', 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, breed, age, description } = req.body;
        const ownerId = req.user.userId;
        if (!name || !breed || !age || !description) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const files = req.files;
        const dogProfile = yield prisma_1.default.dogProfile.create({
            data: {
                name: String(name),
                breed: String(breed),
                age: parseInt(String(age), 10),
                description: String(description),
                ownerId,
                images: {
                    create: (files === null || files === void 0 ? void 0 : files.map(file => ({
                        url: file.location,
                    }))) || [],
                },
            },
            include: {
                images: true,
            },
        });
        res.status(201).json({ message: 'Dog profile created successfully', dogProfile });
    }
    catch (error) {
        console.error('Error creating dog profile:', error);
        res.status(500).json({ error: 'Failed to create dog profile' });
    }
}));
// PUT to update an existing dog profile (protected)
router.put('/:id', auth_middleware_1.authenticate, upload_middleware_1.upload.array('photos', 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { name, breed, age, description } = req.body;
        const userId = req.user.userId;
        const dog = yield prisma_1.default.dogProfile.findUnique({ where: { id } });
        if (!dog) {
            res.status(404).json({ error: 'Dog profile not found' });
            return;
        }
        if (dog.ownerId !== userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized to update this profile' });
            return;
        }
        const files = req.files;
        let newImagesData = {};
        if (files && files.length > 0) {
            newImagesData = {
                images: {
                    create: files.map(file => ({
                        url: file.location,
                    }))
                }
            };
        }
        const updatedDog = yield prisma_1.default.dogProfile.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: String(name) })), (breed && { breed: String(breed) })), (age && { age: parseInt(String(age), 10) })), (description && { description: String(description) })), newImagesData),
            include: {
                images: true,
            },
        });
        res.status(200).json({ message: 'Dog profile updated successfully', dogProfile: updatedDog });
    }
    catch (error) {
        console.error('Error updating dog profile:', error);
        res.status(500).json({ error: 'Failed to update dog profile' });
    }
}));
// DELETE a dog profile (protected)
router.delete('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const userId = req.user.userId;
        const dog = yield prisma_1.default.dogProfile.findUnique({ where: { id } });
        if (!dog) {
            res.status(404).json({ error: 'Dog profile not found' });
            return;
        }
        if (dog.ownerId !== userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized to delete this profile' });
            return;
        }
        yield prisma_1.default.image.deleteMany({
            where: { profileId: id }
        });
        yield prisma_1.default.dogProfile.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Dog profile deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting dog profile:', error);
        res.status(500).json({ error: 'Failed to delete dog profile' });
    }
}));
exports.default = router;
