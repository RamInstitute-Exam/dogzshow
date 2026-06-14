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
exports.getPublicGallery = exports.uploadMedia = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const uploadMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { type, category } = req.body;
        const fileUrl = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.location) || ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        if (!fileUrl) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const media = yield prisma_1.default.mediaGallery.create({
            data: {
                url: fileUrl,
                type, // PHOTO or VIDEO
                category, // DOG_SHOW, PICS, POSTERS
                isPublic: true
            }
        });
        res.status(201).json({ message: 'Media uploaded successfully', media });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
});
exports.uploadMedia = uploadMedia;
const getPublicGallery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gallery = yield prisma_1.default.mediaGallery.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(gallery);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch public gallery' });
    }
});
exports.getPublicGallery = getPublicGallery;
