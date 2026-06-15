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
exports.scoreMatch = exports.getMatches = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield prisma_1.default.competitionMatch.findMany({
            include: {
                dog: { include: { breed: true, owner: true } },
                round: { include: { event: true } },
                winners: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: matches });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch matches' });
    }
});
exports.getMatches = getMatches;
const scoreMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId, score, notes, isWinner, awardTitle } = req.body;
        // Update match score
        const match = yield prisma_1.default.competitionMatch.update({
            where: { id: matchId },
            data: { score, notes, status: isWinner ? 'ADVANCED' : 'ELIMINATED' },
            include: { dog: true, round: { include: { event: true } } }
        });
        // If marked as winner, create Winner and WinnerTag
        if (isWinner && awardTitle) {
            const winner = yield prisma_1.default.winner.create({
                data: {
                    matchId,
                    awardTitle,
                    eventName: match.round.event.name,
                    eventDate: match.round.event.startDate
                }
            });
            // Auto-tag the dog profile with Champion status if applicable
            if (awardTitle.toLowerCase().includes('champion')) {
                yield prisma_1.default.dog.update({
                    where: { id: match.dogId },
                    data: { isChampion: true }
                });
            }
            yield prisma_1.default.winnerTag.create({
                data: {
                    winnerId: winner.id,
                    dogId: match.dogId,
                    award: awardTitle,
                    eventName: match.round.event.name,
                    eventDate: match.round.event.startDate
                }
            });
        }
        res.status(200).json({ success: true, data: match });
    }
    catch (error) {
        console.error('Error scoring match:', error);
        res.status(500).json({ success: false, error: 'Failed to score match' });
    }
});
exports.scoreMatch = scoreMatch;
