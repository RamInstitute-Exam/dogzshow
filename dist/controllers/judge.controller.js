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
exports.bulkDeleteJudges = exports.deleteJudge = exports.updateJudge = exports.getJudgeById = exports.assignJudgeToEvent = exports.getJudgeAssignments = exports.createJudge = exports.getJudges = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getJudges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const whereClause = search ? { name: { contains: search } } : {};
        const [judges, total] = yield Promise.all([
            prisma_1.default.judge.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: { assignments: { include: { event: true } } }
            }),
            prisma_1.default.judge.count({ where: whereClause })
        ]);
        res.status(200).json({ success: true, data: judges, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch judges' });
    }
});
exports.getJudges = getJudges;
const createJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, country, experience, bio, photoUrl, groups } = req.body;
        const judge = yield prisma_1.default.judge.create({
            data: { name, country, experience, bio, photoUrl, groups }
        });
        res.status(201).json({ success: true, data: judge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create judge' });
    }
});
exports.createJudge = createJudge;
const getJudgeAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assignments = yield prisma_1.default.judgeAssignment.findMany({
            include: {
                judge: true,
                event: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: assignments });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
    }
});
exports.getJudgeAssignments = getJudgeAssignments;
const assignJudgeToEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, judgeId, assignedGroups } = req.body;
        const assignment = yield prisma_1.default.judgeAssignment.create({
            data: { eventId, judgeId, assignedGroups }
        });
        res.status(201).json({ success: true, data: assignment });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to assign judge' });
    }
});
exports.assignJudgeToEvent = assignJudgeToEvent;
const getJudgeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judge = yield prisma_1.default.judge.findUnique({
            where: { id: req.params.id },
            include: { assignments: { include: { event: true } } }
        });
        if (!judge) {
            res.status(404).json({ success: false, error: 'Judge not found' });
            return;
        }
        res.status(200).json({ success: true, data: judge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch judge' });
    }
});
exports.getJudgeById = getJudgeById;
const updateJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judge = yield prisma_1.default.judge.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: judge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update judge' });
    }
});
exports.updateJudge = updateJudge;
const deleteJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Actually deleting or soft deleting if possible
        // Wait, does Judge have deletedAt? Let's check schema. If not, delete directly.
        yield prisma_1.default.judge.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, message: 'Judge deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete judge' });
    }
});
exports.deleteJudge = deleteJudge;
const bulkDeleteJudges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.judge.deleteMany({
            where: { id: { in: ids } }
        });
        res.status(200).json({ success: true, message: 'Judges bulk deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to bulk delete judges' });
    }
});
exports.bulkDeleteJudges = bulkDeleteJudges;
