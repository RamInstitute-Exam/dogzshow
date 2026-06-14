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
exports.getPublicWinners = exports.bulkDeleteWinners = exports.getWinners = exports.getDogWinnerTags = exports.issueWinnerTag = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const issueWinnerTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { winnerId } = req.body;
        const winner = yield prisma_1.default.winner.findUnique({
            where: { id: winnerId },
            include: {
                match: {
                    include: { dog: true, round: { include: { event: true } } }
                }
            }
        });
        if (!winner) {
            res.status(404).json({ error: 'Winner record not found' });
            return;
        }
        const { dog, round } = winner.match;
        const { event } = round;
        const winnerTag = yield prisma_1.default.winnerTag.create({
            data: {
                winnerId,
                dogId: dog.id,
                award: winner.awardTitle,
                eventName: event.name,
                eventDate: event.endDate
            }
        });
        res.status(201).json({ message: 'Winner Tag issued to Dog Profile', winnerTag });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to issue winner tag' });
    }
});
exports.issueWinnerTag = issueWinnerTag;
const getDogWinnerTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dogId = req.params.dogId;
        const tags = yield prisma_1.default.winnerTag.findMany({ where: { dogId } });
        res.status(200).json(tags);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch winner tags' });
    }
});
exports.getDogWinnerTags = getDogWinnerTags;
const getWinners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Fetch Winners (from Competition engine) along with their related tags
        const [winners, total] = yield Promise.all([
            prisma_1.default.winner.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    match: {
                        include: {
                            dog: { include: { owner: true, breed: true } },
                            round: { include: { event: true, judgeAssignment: { include: { judge: true } } } }
                        }
                    }
                }
            }),
            prisma_1.default.winner.count()
        ]);
        res.status(200).json({
            success: true,
            data: winners,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch winners' });
    }
});
exports.getWinners = getWinners;
const bulkDeleteWinners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.winner.deleteMany({
            where: { id: { in: ids } }
        });
        res.status(200).json({ success: true, message: 'Winners deleted successfully' });
    }
    catch (error) {
        console.error('Error bulk deleting winners:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.bulkDeleteWinners = bulkDeleteWinners;
const getPublicWinners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const winners = yield prisma_1.default.winner.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                match: {
                    include: {
                        dog: {
                            include: {
                                ownerUser: true,
                                owner: true
                            }
                        },
                        round: {
                            include: {
                                event: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({ success: true, data: winners });
    }
    catch (error) {
        console.error('Error fetching public winners:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getPublicWinners = getPublicWinners;
