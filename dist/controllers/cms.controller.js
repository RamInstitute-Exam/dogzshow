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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalCms = exports.getEventDetailCms = exports.getEventsCms = exports.getHomepageCms = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// --------------------------------------------------------
// HOMEPAGE CMS APIS
// --------------------------------------------------------
const getHomepageCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield prisma.banner.findMany({
            where: { isActive: true, page: 'HOME' },
            orderBy: { sortOrder: 'asc' },
        });
        const about = yield prisma.cmsAbout.findFirst();
        const stats = yield prisma.dashboardMetric.findMany();
        res.status(200).json({
            success: true,
            data: {
                banners,
                about,
                stats,
            },
        });
    }
    catch (error) {
        console.error('Error fetching Home CMS:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getHomepageCms = getHomepageCms;
// --------------------------------------------------------
// EVENT CMS APIS
// --------------------------------------------------------
const getEventsCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield prisma.event.findMany({
            where: { status: { not: 'DRAFT' } },
            include: {
                club: true,
            },
            orderBy: { startDate: 'asc' },
        });
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        console.error('Error fetching Events CMS:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getEventsCms = getEventsCms;
const getEventDetailCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const event = yield prisma.event.findUnique({
            where: { slug: slug },
            include: {
                club: true,
                judgeAssignments: {
                    include: { judge: true }
                },
                mediaGallery: true,
            },
        });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    }
    catch (error) {
        console.error('Error fetching Event Detail CMS:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getEventDetailCms = getEventDetailCms;
// --------------------------------------------------------
// GLOBAL CMS APIS
// --------------------------------------------------------
const getGlobalCms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = yield prisma.cmsHeader.findFirst();
        const footer = yield prisma.cmsFooter.findFirst();
        const sponsors = yield prisma.sponsor.findMany({ where: { isActive: true } });
        // We cast to any in case prisma client is not generated yet
        const menus = yield prisma.menu.findMany({
            where: { visibility: true },
            orderBy: { displayOrder: 'asc' }
        }).catch(() => []);
        res.status(200).json({
            success: true,
            data: {
                header,
                footer,
                sponsors,
                menus
            },
        });
    }
    catch (error) {
        console.error('Error fetching Global CMS:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getGlobalCms = getGlobalCms;
