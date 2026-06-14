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
exports.reorderBanners = exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getAllBanners = exports.getActiveBanners = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// Get Active Banners (Public)
const getActiveBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const banners = yield prisma_1.default.homepageBanner.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { startDate: null, endDate: null },
                    { startDate: { lte: now }, endDate: null },
                    { startDate: null, endDate: { gte: now } },
                    { startDate: { lte: now }, endDate: { gte: now } }
                ]
            },
            orderBy: { sortOrder: 'asc' },
        });
        res.status(200).json({
            success: true,
            data: banners,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch homepage banners' });
    }
});
exports.getActiveBanners = getActiveBanners;
// Get All Banners (Admin)
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield prisma_1.default.homepageBanner.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.status(200).json({
            success: true,
            data: banners,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch banners' });
    }
});
exports.getAllBanners = getAllBanners;
// Create Banner (Admin)
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banner = yield prisma_1.default.homepageBanner.create({
            data: req.body,
        });
        res.status(201).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create banner' });
    }
});
exports.createBanner = createBanner;
// Update Banner (Admin)
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const banner = yield prisma_1.default.homepageBanner.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update banner' });
    }
});
exports.updateBanner = updateBanner;
// Delete Banner (Admin)
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield prisma_1.default.homepageBanner.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete banner' });
    }
});
exports.deleteBanner = deleteBanner;
// Reorder Banners (Admin)
const reorderBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items } = req.body; // Expecting array of { id: string, sortOrder: number }
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }
        const updatePromises = items.map((item) => prisma_1.default.homepageBanner.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder }
        }));
        yield Promise.all(updatePromises);
        res.status(200).json({
            success: true,
            message: 'Banners reordered successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reorder banners' });
    }
});
exports.reorderBanners = reorderBanners;
