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
exports.bulkDeleteClubs = exports.deleteClub = exports.updateClub = exports.createClub = exports.getClubById = exports.getClubs = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getClubs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        let whereClause = { deletedAt: null };
        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { secretary: { contains: search } },
                { president: { contains: search } }
            ];
        }
        const [clubs, total] = yield Promise.all([
            prisma_1.default.club.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { events: true } }
                }
            }),
            prisma_1.default.club.count({ where: whereClause })
        ]);
        res.status(200).json({
            success: true,
            data: clubs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        console.error('Failed to fetch clubs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch clubs' });
    }
});
exports.getClubs = getClubs;
const getClubById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const club = yield prisma_1.default.club.findUnique({
            where: { id: req.params.id },
            include: { events: true }
        });
        if (!club || club.deletedAt) {
            res.status(404).json({ success: false, error: 'Club not found' });
            return;
        }
        res.status(200).json({ success: true, data: club });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch club' });
    }
});
exports.getClubById = getClubById;
const createClub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const club = yield prisma_1.default.club.create({
            data: req.body
        });
        res.status(201).json({ success: true, data: club });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create club' });
    }
});
exports.createClub = createClub;
const updateClub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const club = yield prisma_1.default.club.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: club });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update club' });
    }
});
exports.updateClub = updateClub;
const deleteClub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.club.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), isActive: false }
        });
        res.status(200).json({ success: true, message: 'Club deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete club' });
    }
});
exports.deleteClub = deleteClub;
const bulkDeleteClubs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.club.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date(), isActive: false }
        });
        res.status(200).json({ success: true, message: 'Clubs bulk deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to bulk delete clubs' });
    }
});
exports.bulkDeleteClubs = bulkDeleteClubs;
