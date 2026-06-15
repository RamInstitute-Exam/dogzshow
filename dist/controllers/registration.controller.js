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
exports.bulkDeleteRegistrations = exports.updateRegistrationStatus = exports.createRegistration = exports.getRegistrations = exports.validateRegistration = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const audit_logger_1 = require("../utils/audit.logger");
const ageCalculator_1 = require("../utils/ageCalculator");
const validateRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, dogId } = req.body;
        if (!eventId || !dogId) {
            res.status(400).json({ success: false, message: 'eventId and dogId are required' });
            return;
        }
        // Fetch Event details
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
            include: { categories: true }
        });
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        // 1. Check Registration Window Status
        const now = new Date();
        if (event.registrationWindowStart && now < new Date(event.registrationWindowStart)) {
            res.status(400).json({ success: false, eligible: false, message: 'Registration has not opened yet' });
            return;
        }
        if (event.registrationWindowEnd && now > new Date(event.registrationWindowEnd)) {
            res.status(400).json({ success: false, eligible: false, message: 'Registration has already closed' });
            return;
        }
        if (event.status !== 'REGISTRATION_OPEN' && event.status !== 'ACTIVE') { // Handle legacy states
            // Relaxing this to just rely on dates if status is weird, but usually you check status
            if (event.status === 'COMPLETED' || event.status === 'DRAFT') {
                res.status(400).json({ success: false, eligible: false, message: `Event is currently in ${event.status} state` });
                return;
            }
        }
        // Fetch Dog details
        const dog = yield prisma_1.default.dog.findUnique({
            where: { id: dogId },
            include: { breed: { include: { fciGroup: true } } }
        });
        if (!dog || !dog.dob) {
            res.status(400).json({ success: false, eligible: false, message: 'Dog not found or missing Date of Birth' });
            return;
        }
        // 2. Calculate Exact Age relative to Event Start Date
        const ageResult = (0, ageCalculator_1.calculateAge)(new Date(dog.dob), new Date(event.startDate));
        // Fetch all globally active AgeClasses
        const allAgeClasses = yield prisma_1.default.ageClass.findMany({ where: { status: 'ACTIVE' } });
        // Filter to find which classes the dog's totalMonths fits into
        let eligibleClasses = (0, ageCalculator_1.getEligibleAgeClass)(ageResult.totalMonths, allAgeClasses);
        // 3. Enforce Champion Rules
        if (dog.isChampion) {
            // If dog is a champion, maybe they ONLY qualify for Champion class, 
            // or at least Champion class is available to them. 
            // This depends on the specific event rules, but generally:
            eligibleClasses = eligibleClasses.filter(c => { var _a; return c.name === 'Champion' || !((_a = c.specialRequirements) === null || _a === void 0 ? void 0 : _a.includes('Champion Only')); });
            // Ensure Champion class is added if available and not already in list
            const championClass = allAgeClasses.find(c => { var _a; return (_a = c.specialRequirements) === null || _a === void 0 ? void 0 : _a.includes('Champion'); });
            if (championClass && !eligibleClasses.find(c => c.id === championClass.id)) {
                eligibleClasses.push(championClass);
            }
        }
        else {
            // Non-champions cannot enter Champion Only classes
            eligibleClasses = eligibleClasses.filter(c => { var _a; return !((_a = c.specialRequirements) === null || _a === void 0 ? void 0 : _a.includes('Champion')); });
        }
        // 4. Validate against Event's specific allowed categories (if event restricts them)
        // If event.categories is populated, it means the event only allows those specific age classes
        if (event.categories && event.categories.length > 0) {
            // Map event categories by name
            const eventCategoryNames = event.categories.map(c => c.name);
            eligibleClasses = eligibleClasses.filter(c => eventCategoryNames.includes(c.name));
        }
        if (eligibleClasses.length === 0) {
            res.status(200).json({
                success: true,
                eligible: false,
                message: `Dog is not eligible for any classes in this event. Age: ${ageResult.totalMonths.toFixed(1)} months.`,
                ageData: ageResult
            });
            return;
        }
        res.status(200).json({
            success: true,
            eligible: true,
            message: 'Dog is eligible',
            eligibleClasses,
            ageData: ageResult
        });
    }
    catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate registration' });
    }
});
exports.validateRegistration = validateRegistration;
const getRegistrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        // Search can apply to registration id, or we could join dog/user. Let's do simple search for now
        let whereClause = {};
        const [registrations, total] = yield Promise.all([
            prisma_1.default.eventRegistration.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    dog: true,
                    user: true,
                    event: true,
                    category: true
                }
            }),
            prisma_1.default.eventRegistration.count({ where: whereClause })
        ]);
        res.status(200).json({
            success: true,
            data: registrations,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
    }
});
exports.getRegistrations = getRegistrations;
const createRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, dogId, userId, categoryId } = req.body;
        const reg = yield prisma_1.default.eventRegistration.create({
            data: {
                eventId,
                dogId,
                userId,
                categoryId: categoryId,
                serialNumber: `JZ-${Date.now()}`,
                status: 'PENDING'
            }
        });
        yield audit_logger_1.AuditLogger.log(req, 'CREATE', 'REGISTRATION', reg.id, null, reg);
        res.status(201).json({ success: true, data: reg });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create registration' });
    }
});
exports.createRegistration = createRegistration;
const updateRegistrationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, paymentStatus } = req.body;
        let dataToUpdate = {};
        if (status)
            dataToUpdate.status = status;
        if (paymentStatus)
            dataToUpdate.paymentStatus = paymentStatus;
        const reg = yield prisma_1.default.eventRegistration.update({
            where: { id: req.params.id },
            data: dataToUpdate
        });
        yield audit_logger_1.AuditLogger.log(req, 'UPDATE', 'REGISTRATION', reg.id, null, reg);
        res.status(200).json({ success: true, data: reg });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update registration' });
    }
});
exports.updateRegistrationStatus = updateRegistrationStatus;
const bulkDeleteRegistrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.eventRegistration.deleteMany({
            where: { id: { in: ids } }
        });
        yield audit_logger_1.AuditLogger.log(req, 'BULK_DELETE', 'REGISTRATION', null, null, { ids });
        res.status(200).json({ success: true, message: 'Registrations deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete registrations' });
    }
});
exports.bulkDeleteRegistrations = bulkDeleteRegistrations;
