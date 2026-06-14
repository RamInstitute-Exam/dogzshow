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
exports.getAdminDogs = exports.getAdminUsers = exports.getAdminStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAdminStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalDogs, activeEvents, pendingPayments, totalRevenueAggr, recentActivity] = yield Promise.all([
            prisma_1.default.user.count({ where: { deletedAt: null } }),
            prisma_1.default.dog.count({ where: { deletedAt: null } }),
            prisma_1.default.event.count({ where: { status: 'ACTIVE' } }),
            // Mocking pending payments count for now if there is no Payment model yet
            // prisma.payment.count({ where: { status: 'PENDING' } })
            Promise.resolve(12),
            // Mocking total revenue sum
            // prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } })
            Promise.resolve(1450000),
            // Fetch 4 most recent events (as activity mock)
            prisma_1.default.event.findMany({
                take: 4,
                orderBy: { createdAt: 'desc' },
                select: { name: true, createdAt: true, status: true }
            })
        ]);
        // Construct formatted response
        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenueAggr, // Return exact number, frontend formats to ₹
                revenueTrend: '+14%', // Mocked trend
                activeEvents,
                eventsTrend: '+2',
                totalDogs,
                dogsTrend: '+18%',
                totalUsers,
                usersTrend: '+5%',
                recentActivity: recentActivity.map(a => ({
                    text: `New event created: ${a.name}`,
                    time: new Date(a.createdAt).toLocaleDateString(),
                    color: 'text-brand-orange',
                    bg: 'bg-orange-50'
                })),
                chartData: [31000, 40000, 28000, 51000, 42000, 109000, totalRevenueAggr / 10] // Mocked chart tailing with current data
            }
        });
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
    }
});
exports.getAdminStats = getAdminStats;
const getAdminUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const whereClause = search ? {
            OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } }
            ]
        } : {};
        const [users, total] = yield Promise.all([
            prisma_1.default.user.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    roles: { include: { role: true } }
                }
            }),
            prisma_1.default.user.count({ where: whereClause })
        ]);
        res.status(200).json({
            success: true,
            data: users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});
exports.getAdminUsers = getAdminUsers;
const getAdminDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const whereClause = search ? {
            OR: [
                { name: { contains: search } },
                { kciNumber: { contains: search } }
            ]
        } : {};
        const [dogs, total] = yield Promise.all([
            prisma_1.default.dog.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: true,
                    breed: true
                }
            }),
            prisma_1.default.dog.count({ where: whereClause })
        ]);
        res.status(200).json({
            success: true,
            data: dogs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dogs' });
    }
});
exports.getAdminDogs = getAdminDogs;
