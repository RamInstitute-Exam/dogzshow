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
exports.getBreeds = exports.createBreed = exports.getFciGroups = exports.createFciGroup = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createFciGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupNumber, name, description } = req.body;
        const fciGroup = yield prisma_1.default.fCIGroup.create({
            data: { groupNumber, name, description }
        });
        res.status(201).json(fciGroup);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create FCI Group' });
    }
});
exports.createFciGroup = createFciGroup;
const getFciGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groups = yield prisma_1.default.fCIGroup.findMany({ include: { breeds: true } });
        res.status(200).json(groups);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch FCI Groups' });
    }
});
exports.getFciGroups = getFciGroups;
const createBreed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, fciGroupId } = req.body;
        const breed = yield prisma_1.default.breed.create({
            data: { name, fciGroupId }
        });
        res.status(201).json(breed);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Breed' });
    }
});
exports.createBreed = createBreed;
const getBreeds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const breeds = yield prisma_1.default.breed.findMany({ include: { fciGroup: true } });
        res.status(200).json(breeds);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Breeds' });
    }
});
exports.getBreeds = getBreeds;
