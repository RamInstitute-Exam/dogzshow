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
exports.bulkUpdateDogs = exports.bulkDeleteDogs = exports.restoreDog = exports.deleteDog = exports.updateDog = exports.createDog = exports.getDogById = exports.getDogs = void 0;
const dog_service_1 = require("../services/dog.service");
const dogService = new dog_service_1.DogService();
const getDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dogService.getAllDogs(req.query);
        res.status(200).json({
            success: true,
            message: 'Dogs retrieved successfully',
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getDogs = getDogs;
const getDogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield dogService.getDogById(req.params.id);
        res.status(200).json({ success: true, message: 'Dog found', data });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getDogById = getDogById;
const createDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        const data = yield dogService.createDog(req.body, userId);
        res.status(201).json({ success: true, message: 'Dog created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createDog = createDog;
const updateDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        const data = yield dogService.updateDog(req.params.id, req.body, userId);
        res.status(200).json({ success: true, message: 'Dog updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateDog = updateDog;
const deleteDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        yield dogService.deleteDog(req.params.id, userId);
        res.status(200).json({ success: true, message: 'Dog deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteDog = deleteDog;
const restoreDog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        yield dogService.restoreDog(req.params.id, userId);
        res.status(200).json({ success: true, message: 'Dog restored successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.restoreDog = restoreDog;
const bulkDeleteDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
            return;
        }
        const result = yield dogService.bulkDeleteDogs(ids, userId);
        res.status(200).json({ success: true, message: `Successfully deleted ${result.count} dogs` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkDeleteDogs = bulkDeleteDogs;
const bulkUpdateDogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { ids, data } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
            return;
        }
        const result = yield dogService.bulkUpdateDogs(ids, data, userId);
        res.status(200).json({ success: true, message: `Successfully updated ${result.count} dogs` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkUpdateDogs = bulkUpdateDogs;
