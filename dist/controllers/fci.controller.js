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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBreed = exports.updateBreed = exports.addBreed = exports.deleteFciGroup = exports.updateFciGroup = exports.createFciGroup = exports.getFciGroupDetail = exports.getFciGroups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFciGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groups = yield prisma.fCIGroup.findMany({
            include: {
                _count: {
                    select: { breeds: true }
                }
            },
            orderBy: { groupNumber: 'asc' }
        });
        res.status(200).json({ success: true, data: groups });
    }
    catch (error) {
        console.error('Error fetching FCI Groups:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getFciGroups = getFciGroups;
const getFciGroupDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const group = yield prisma.fCIGroup.findUnique({
            where: { id },
            include: {
                breeds: true,
                _count: { select: { breeds: true } }
            }
        });
        if (!group)
            return res.status(404).json({ success: false, message: 'Group not found' });
        res.status(200).json({ success: true, data: group });
    }
    catch (error) {
        console.error('Error fetching FCI Group Detail:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getFciGroupDetail = getFciGroupDetail;
const createFciGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupNumber, name, description, status } = req.body;
        const group = yield prisma.fCIGroup.create({
            data: { groupNumber: Number(groupNumber), name, description, status }
        });
        res.status(201).json({ success: true, data: group });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.createFciGroup = createFciGroup;
const updateFciGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { groupNumber, name, description, status } = req.body;
        const group = yield prisma.fCIGroup.update({
            where: { id },
            data: { groupNumber: Number(groupNumber), name, description, status }
        });
        res.status(200).json({ success: true, data: group });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.updateFciGroup = updateFciGroup;
const deleteFciGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.fCIGroup.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Group deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.deleteFciGroup = deleteFciGroup;
// Breed Controllers
const addBreed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: fciGroupId } = req.params;
        const { name } = req.body;
        const breed = yield prisma.breed.create({
            data: { name, fciGroupId }
        });
        res.status(201).json({ success: true, data: breed });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.addBreed = addBreed;
const updateBreed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { breedId } = req.params;
        const { name } = req.body;
        const breed = yield prisma.breed.update({
            where: { id: breedId },
            data: { name }
        });
        res.status(200).json({ success: true, data: breed });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.updateBreed = updateBreed;
const deleteBreed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { breedId } = req.params;
        yield prisma.breed.delete({ where: { id: breedId } });
        res.status(200).json({ success: true, message: 'Breed deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.deleteBreed = deleteBreed;
