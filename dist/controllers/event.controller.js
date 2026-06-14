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
exports.assignJudge = exports.createJudge = exports.getJudges = exports.bulkDeleteEvents = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getAdminEvents = exports.getPastEvents = exports.getUserRegistrations = exports.getUpcomingEvents = exports.getEvents = exports.createEvent = exports.getClubs = exports.createClub = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createClub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, contactInfo } = req.body;
        const club = yield prisma_1.default.club.create({
            data: { name, description, contactInfo }
        });
        res.status(201).json(club);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Club' });
    }
});
exports.createClub = createClub;
const getClubs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubs = yield prisma_1.default.club.findMany({
            where: { deletedAt: null },
            include: { events: true }
        });
        res.status(200).json(clubs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Clubs' });
    }
});
exports.getClubs = getClubs;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, name, type, startDate, endDate, venue, entryFee, capacity, registrationWindowStart, registrationWindowEnd, categories, fciGroups } = req.body;
        const event = yield prisma_1.default.event.create({
            data: {
                clubId,
                name,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                venue,
                entryFee,
                capacity,
                registrationWindowStart: registrationWindowStart ? new Date(registrationWindowStart) : null,
                registrationWindowEnd: registrationWindowEnd ? new Date(registrationWindowEnd) : null,
                categories: {
                    create: (categories === null || categories === void 0 ? void 0 : categories.map((catName) => ({ name: catName }))) || []
                },
                fciGroups: {
                    create: (fciGroups === null || fciGroups === void 0 ? void 0 : fciGroups.map((groupId) => ({ fciGroupId: groupId }))) || []
                }
            }
        });
        res.status(201).json({ message: 'Event created successfully', event });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Event' });
    }
});
exports.createEvent = createEvent;
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield prisma_1.default.event.findMany({
            where: {
                deletedAt: null,
                status: { not: 'DRAFT' } // Only fetch non-draft events
            },
            include: {
                club: true,
                categories: true,
                fciGroups: { include: { fciGroup: true } },
                judgeAssignments: { include: { judge: true } }
            },
            orderBy: [
                { isFeatured: 'desc' },
                { startDate: 'asc' }
            ]
        });
        res.status(200).json(events);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Events' });
    }
});
exports.getEvents = getEvents;
const getUpcomingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield prisma_1.default.event.findMany({
            where: {
                deletedAt: null,
                status: { in: ['ACTIVE', 'REGISTRATION_OPEN'] },
                startDate: { gte: new Date() }
            },
            include: { club: true, categories: true },
            orderBy: { startDate: 'asc' }
        });
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch upcoming events' });
    }
});
exports.getUpcomingEvents = getUpcomingEvents;
const getUserRegistrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const registrations = yield prisma_1.default.eventRegistration.findMany({
            where: { userId },
            include: {
                event: { include: { club: true } },
                dog: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: registrations });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
    }
});
exports.getUserRegistrations = getUserRegistrations;
const getPastEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield prisma_1.default.event.findMany({
            where: {
                deletedAt: null,
                endDate: { lt: new Date() }
            },
            include: { club: true },
            orderBy: { endDate: 'desc' }
        });
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch past events' });
    }
});
exports.getPastEvents = getPastEvents;
const getAdminEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const whereClause = search ? { name: { contains: search } } : { deletedAt: null };
        const [events, total] = yield Promise.all([
            prisma_1.default.event.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { startDate: 'desc' },
                include: { club: true }
            }),
            prisma_1.default.event.count({ where: whereClause })
        ]);
        res.status(200).json({ success: true, data: events, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch admin events' });
    }
});
exports.getAdminEvents = getAdminEvents;
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield prisma_1.default.event.findUnique({
            where: { id: req.params.id },
            include: {
                club: true,
                categories: true,
                fciGroups: { include: { fciGroup: true } },
                judgeAssignments: { include: { judge: true } }
            }
        });
        if (!event || event.deletedAt) {
            res.status(404).json({ success: false, error: 'Event not found' });
            return;
        }
        res.status(200).json({ success: true, data: event });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
});
exports.getEventById = getEventById;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // simplified update logic for the enormous payload
        const event = yield prisma_1.default.event.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: event });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update event' });
    }
});
exports.updateEvent = updateEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.event.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
});
exports.deleteEvent = deleteEvent;
const bulkDeleteEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.event.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ success: true, message: 'Events bulk deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to bulk delete events' });
    }
});
exports.bulkDeleteEvents = bulkDeleteEvents;
const getJudges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judges = yield prisma_1.default.judge.findMany({
            where: { status: 'ACTIVE' },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        });
        res.status(200).json(judges);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Judges' });
    }
});
exports.getJudges = getJudges;
const createJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, bio, photoUrl, credentials } = req.body;
        const judge = yield prisma_1.default.judge.create({
            data: { name, bio, photoUrl, credentials }
        });
        res.status(201).json(judge);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Judge' });
    }
});
exports.createJudge = createJudge;
const assignJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, judgeId, assignedGroups } = req.body;
        const assignment = yield prisma_1.default.judgeAssignment.create({
            data: {
                eventId,
                judgeId,
                assignedGroups
            }
        });
        res.status(201).json({ message: 'Judge assigned to event', assignment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign Judge' });
    }
});
exports.assignJudge = assignJudge;
