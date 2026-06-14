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
exports.getFciGroupBreeds = exports.getFciGroupDetail = exports.getFciGroups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFciGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cast to any in case Prisma client generation failed temporarily
        const groups = yield prisma.fCIGroup.findMany({
            where: { status: 'ACTIVE' },
            include: {
                _count: {
                    select: { breeds: true }
                }
            },
            orderBy: { displayOrder: 'asc' }
        }).catch(() => []);
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
        const { slug } = req.params;
        const group = yield prisma.fCIGroup.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { breeds: true }
                }
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
const getFciGroupBreeds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const group = yield prisma.fCIGroup.findUnique({
            where: { slug },
            include: { breeds: true }
        });
        if (!group)
            return res.status(404).json({ success: false, message: 'Group not found' });
        res.status(200).json({ success: true, data: group.breeds });
    }
    catch (error) {
        console.error('Error fetching Group Breeds:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.getFciGroupBreeds = getFciGroupBreeds;
