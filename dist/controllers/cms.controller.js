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
exports.getAllPages = exports.updatePage = exports.getPageBySlug = exports.getEventsCms = exports.getHomeCms = exports.updateGlobal = exports.getGlobal = void 0;
const cms_service_1 = require("../services/cms.service");
const prisma_1 = __importDefault(require("../prisma"));
const cache_1 = require("../utils/cache");
const service = new cms_service_1.CmsService();
const getGlobal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = 'cms:global';
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        const data = yield service.getGlobal();
        cache_1.memoryCache.set(cacheKey, data);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getGlobal = getGlobal;
const updateGlobal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updateGlobal(req.body);
        cache_1.memoryCache.clear();
        res.status(200).json({ success: true, message: 'Global CMS updated', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateGlobal = updateGlobal;
const getHomeCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = 'cms:home';
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        // Stats for StatsCounter
        const stats = yield prisma_1.default.dashboardMetric.findMany();
        // Default seed if empty
        if (!stats.length) {
            yield prisma_1.default.dashboardMetric.createMany({
                data: [
                    { metricKey: 'registered_dogs', metricValue: 15000 },
                    { metricKey: 'dog_shows', metricValue: 250 },
                    { metricKey: 'verified_judges', metricValue: 500 },
                    { metricKey: 'active_users', metricValue: 12000 },
                    { metricKey: 'breeds_supported', metricValue: 350 }
                ]
            });
        }
        const finalStats = yield prisma_1.default.dashboardMetric.findMany();
        // Page data for About Section
        const about = yield service.getPageBySlug('about');
        const resultData = { stats: finalStats, about };
        cache_1.memoryCache.set(cacheKey, resultData);
        res.status(200).json({ success: true, data: resultData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getHomeCms = getHomeCms;
const getEventsCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = 'cms:events';
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        const events = yield prisma_1.default.event.findMany({
            where: { status: { not: 'DRAFT' } },
            orderBy: { startDate: 'asc' },
            take: 10,
            include: { club: true }
        });
        cache_1.memoryCache.set(cacheKey, events);
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getEventsCms = getEventsCms;
const getPageBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = `cms:page:${req.params.slug}`;
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        const data = yield service.getPageBySlug(req.params.slug);
        cache_1.memoryCache.set(cacheKey, data);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
exports.getPageBySlug = getPageBySlug;
const updatePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updatePage(req.params.slug, req.body);
        cache_1.memoryCache.clear();
        res.status(200).json({ success: true, message: 'Page CMS updated', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updatePage = updatePage;
const getAllPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = 'cms:pages';
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        const data = yield service.getAllPages();
        cache_1.memoryCache.set(cacheKey, data);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllPages = getAllPages;
