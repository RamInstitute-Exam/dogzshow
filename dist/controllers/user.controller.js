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
exports.bulkUpdateUsers = exports.bulkDeleteUsers = exports.restoreUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.getAllUsers(req.query);
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
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
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield userService.getUserById(req.params.id);
        res.status(200).json({ success: true, message: 'User found', data });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        const data = yield userService.createUser(req.body, adminId);
        res.status(201).json({ success: true, message: 'User created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        const data = yield userService.updateUser(req.params.id, req.body, adminId);
        res.status(200).json({ success: true, message: 'User updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        yield userService.deleteUser(req.params.id, adminId);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteUser = deleteUser;
const restoreUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM';
        yield userService.restoreUser(req.params.id, adminId);
        res.status(200).json({ success: true, message: 'User restored successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.restoreUser = restoreUser;
const bulkDeleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
            return;
        }
        const result = yield userService.bulkDeleteUsers(ids, adminId);
        res.status(200).json({ success: true, message: `Successfully deleted ${result.count} users` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkDeleteUsers = bulkDeleteUsers;
const bulkUpdateUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { ids, data } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: 'Please provide an array of IDs' });
            return;
        }
        const result = yield userService.bulkUpdateUsers(ids, data, adminId);
        res.status(200).json({ success: true, message: `Successfully updated ${result.count} users` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkUpdateUsers = bulkUpdateUsers;
