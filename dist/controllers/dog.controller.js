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
exports.uploadKciCertificate = exports.bulkDeleteDogs = exports.deleteDog = exports.updateDog = exports.getDogById = exports.getDogs = exports.createDog = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, breedId, gender, dob, color, markings, kciNumber, microchipNumber, micNumber, weight, height, isImported, countryOfOrigin, isChampion, pedigreeUrl, certificateFrontUrl, certificateBackUrl, owner, breeder, bloodline, medical } = req.body;
        const userOwnerId = req.user.id;
        // Prisma Transaction to ensure data integrity
        const newDog = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create Owner if owner details are provided
            let newOwner = null;
            if (owner && owner.name) {
                newOwner = yield tx.owner.create({
                    data: {
                        name: owner.name,
                        fatherName: owner.fatherName,
                        email: owner.email,
                        phone: owner.phone,
                        whatsapp: owner.whatsapp,
                        address: owner.address,
                        state: owner.state,
                        district: owner.district,
                        city: owner.city,
                        pincode: owner.pincode
                    }
                });
            }
            // 2. Create Breeder if breeder details are provided
            let newBreeder = null;
            if (breeder && breeder.name) {
                newBreeder = yield tx.breeder.create({
                    data: {
                        name: breeder.name,
                        kennelName: breeder.kennelName,
                        country: breeder.country,
                        address: breeder.address,
                        phone: breeder.phone
                    }
                });
            }
            // 3. Create the Dog
            return yield tx.dog.create({
                data: {
                    name,
                    breedId,
                    gender,
                    dob: dob ? new Date(dob) : null,
                    color,
                    markings,
                    kciNumber,
                    microchipNumber,
                    micNumber,
                    weight,
                    height,
                    isImported,
                    countryOfOrigin,
                    isChampion,
                    pedigreeUrl,
                    certificateFrontUrl,
                    certificateBackUrl,
                    bloodline,
                    medical,
                    ownerId: newOwner === null || newOwner === void 0 ? void 0 : newOwner.id,
                    breederId: newBreeder === null || newBreeder === void 0 ? void 0 : newBreeder.id,
                    userOwnerId
                }
            });
        }));
        res.status(201).json({ success: true, message: 'Dog profile created successfully', data: newDog });
    }
    catch (error) {
        console.error('Error creating dog:', error);
        res.status(500).json({ success: false, error: 'Failed to create dog profile' });
    }
});
exports.createDog = createDog;
const getDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        let whereClause = { deletedAt: null };
        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { kciNumber: { contains: search } },
                { microchipNumber: { contains: search } }
            ];
        }
        const [dogs, total] = yield Promise.all([
            prisma_1.default.dog.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    breed: true,
                    photos: true,
                    owner: true,
                    kciCertificate: true,
                    _count: { select: { eventRegistrations: true, winnerTags: true } }
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch dogs' });
    }
});
exports.getDogs = getDogs;
const getDogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const dog = yield prisma_1.default.dog.findUnique({
            where: { id },
            include: {
                breed: true,
                photos: true,
                owner: true,
                breeder: true,
                kciCertificate: true,
                winnerTags: true
            }
        });
        if (!dog || dog.deletedAt) {
            res.status(404).json({ error: 'Dog not found' });
            return;
        }
        res.status(200).json(dog);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dog' });
    }
});
exports.getDogById = getDogById;
const updateDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = req.body;
        const dog = yield prisma_1.default.dog.update({
            where: { id },
            data
        });
        res.status(200).json({ message: 'Dog updated', dog });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update dog' });
    }
});
exports.updateDog = updateDog;
const deleteDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield prisma_1.default.dog.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ success: true, message: 'Dog deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to delete dog' });
    }
});
exports.deleteDog = deleteDog;
const bulkDeleteDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.dog.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ success: true, message: 'Dogs bulk deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to bulk delete dogs' });
    }
});
exports.bulkDeleteDogs = bulkDeleteDogs;
const uploadKciCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = req.params.id; // Dog ID
        // Assume req.file contains the uploaded file details via multer
        const fileUrl = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.location) || ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        if (!fileUrl) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // Mock OCR Extraction for now
        const mockExtractedData = {
            name: "Mock Extracted Name",
            kciNumber: "KCI-12345",
            microchip: "MC-987654321",
            dob: "2020-01-01"
        };
        const cert = yield prisma_1.default.kCICertificate.upsert({
            where: { dogId: id },
            update: {
                url: fileUrl,
                ocrConfidence: 0.95,
                extractedData: mockExtractedData
            },
            create: {
                dogId: id,
                url: fileUrl,
                ocrConfidence: 0.95,
                extractedData: mockExtractedData
            }
        });
        res.status(200).json({ message: 'KCI Certificate uploaded and processed', cert });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process KCI certificate' });
    }
});
exports.uploadKciCertificate = uploadKciCertificate;
