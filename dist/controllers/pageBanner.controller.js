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
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getAllBanners = exports.getBannerBySlug = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// Get Banner by Slug (Public)
const getBannerBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const banner = yield prisma_1.default.pageBanner.findUnique({
            where: { pageSlug: slug },
        });
        if (!banner || !banner.isActive) {
            // Return a default empty response to fallback on frontend gracefully
            return res.status(200).json({
                success: true,
                data: null
            });
        }
        res.status(200).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch banner' });
    }
});
exports.getBannerBySlug = getBannerBySlug;
// Get All Banners (Admin)
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield prisma_1.default.pageBanner.findMany({
            orderBy: { displayOrder: 'asc' },
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
        const banner = yield prisma_1.default.pageBanner.create({
            data: req.body,
        });
        res.status(201).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create banner' });
    }
});
exports.createBanner = createBanner;
// Update Banner (Admin)
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const banner = yield prisma_1.default.pageBanner.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update banner' });
    }
});
exports.updateBanner = updateBanner;
// Delete Banner (Admin)
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield prisma_1.default.pageBanner.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to delete banner' });
    }
});
exports.deleteBanner = deleteBanner;
