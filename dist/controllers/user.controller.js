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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status;
        const roleId = req.query.roleId;
        let whereClause = { deletedAt: null };
        if (search) {
            whereClause.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }
        if (status) {
            whereClause.isActive = status === 'ACTIVE';
        }
        if (roleId) {
            whereClause.roles = { some: { roleId } };
        }
        const [users, total] = yield Promise.all([
            prisma_1.default.user.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    roles: { include: { role: true } },
                    _count: { select: { dogsOwned: true, eventRegistrations: true } }
                }
            }),
            prisma_1.default.user.count({ where: whereClause })
        ]);
        res.status(200).json({
            success: true,
            data: users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            include: {
                roles: { include: { role: true } },
                dogsOwned: true,
                eventRegistrations: { include: { event: true } }
            }
        });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { email, password, firstName, lastName, phone, roleId } = _a, otherData = __rest(_a, ["email", "password", "firstName", "lastName", "phone", "roleId"]);
        const existing = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ success: false, error: 'Email already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password || 'JuzDog@2026', 10);
        const user = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({ email, password: hashedPassword, firstName,
                lastName,
                phone }, otherData), { roles: roleId ? { create: { roleId } } : undefined })
        });
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const _a = req.body, { roleId, password } = _a, updateData = __rest(_a, ["roleId", "password"]);
        const dataToUpdate = Object.assign({}, updateData);
        if (password) {
            dataToUpdate.password = yield bcrypt_1.default.hash(password, 10);
        }
        const user = yield prisma_1.default.user.update({
            where: { id },
            data: dataToUpdate
        });
        // Handle Role assignment if provided
        if (roleId) {
            // Remove old roles (simplified for now to enforce single primary role)
            yield prisma_1.default.userRole.deleteMany({ where: { userId: id } });
            yield prisma_1.default.userRole.create({ data: { userId: id, roleId } });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        // Soft delete
        yield prisma_1.default.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false }
        });
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
});
exports.deleteUser = deleteUser;
const bulkDeleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        yield prisma_1.default.user.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date(), isActive: false }
        });
        res.status(200).json({ success: true, message: 'Users bulk deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to bulk delete users' });
    }
});
exports.bulkDeleteUsers = bulkDeleteUsers;
