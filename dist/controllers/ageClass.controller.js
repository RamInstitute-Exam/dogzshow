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
exports.deleteAgeClass = exports.updateAgeClass = exports.createAgeClass = exports.getAgeClasses = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAgeClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classes = yield prisma_1.default.ageClass.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        res.status(200).json({ success: true, data: classes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch age classes' });
    }
});
exports.getAgeClasses = getAgeClasses;
const createAgeClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ageClass = yield prisma_1.default.ageClass.create({
            data: req.body
        });
        res.status(201).json({ success: true, data: ageClass });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create age class' });
    }
});
exports.createAgeClass = createAgeClass;
const updateAgeClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ageClass = yield prisma_1.default.ageClass.update({
            where: { id: id },
            data: req.body
        });
        res.status(200).json({ success: true, data: ageClass });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update age class' });
    }
});
exports.updateAgeClass = updateAgeClass;
const deleteAgeClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.ageClass.delete({
            where: { id: id }
        });
        res.status(200).json({ success: true, message: 'Age class deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete age class' });
    }
});
exports.deleteAgeClass = deleteAgeClass;
