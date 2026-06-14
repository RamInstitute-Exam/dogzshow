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
exports.getUserStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Run aggregations in parallel
        const [totalDogs, upcomingEvents, pendingRegistrations, certificates] = yield Promise.all([
            prisma_1.default.dog.count({ where: { userOwnerId: userId, deletedAt: null } }),
            prisma_1.default.eventRegistration.count({
                where: {
                    userId,
                    status: 'CONFIRMED',
                    event: { startDate: { gte: new Date() } }
                }
            }),
            prisma_1.default.eventRegistration.count({
                where: { userId, status: 'PENDING' }
            }),
            prisma_1.default.kCICertificate.count({
                where: { dog: { userOwnerId: userId } }
            })
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalDogs,
                upcomingEvents,
                pendingRegistrations,
                certificates
            }
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});
exports.getUserStats = getUserStats;
