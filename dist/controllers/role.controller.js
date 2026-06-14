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
exports.getSubAdmins = exports.createRole = exports.getPermissions = exports.getRoles = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield prisma_1.default.role.findMany({
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } }
            }
        });
        res.status(200).json({ success: true, data: roles });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch roles' });
    }
});
exports.getRoles = getRoles;
const getPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = yield prisma_1.default.permission.findMany();
        res.status(200).json({ success: true, data: permissions });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch permissions' });
    }
});
exports.getPermissions = getPermissions;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, permissionIds } = req.body;
        const role = yield prisma_1.default.role.create({
            data: {
                name,
                description,
                permissions: {
                    create: permissionIds.map((id) => ({ permissionId: id }))
                }
            }
        });
        res.status(201).json({ success: true, data: role });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create role' });
    }
});
exports.createRole = createRole;
const getSubAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the SUB_ADMIN role
        const subAdminRole = yield prisma_1.default.role.findUnique({
            where: { name: 'SUB_ADMIN' }
        });
        if (!subAdminRole) {
            res.status(200).json({ success: true, data: [] });
            return;
        }
        const subAdmins = yield prisma_1.default.user.findMany({
            where: {
                roles: { some: { roleId: subAdminRole.id } },
                deletedAt: null
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
                createdAt: true
            }
        });
        res.status(200).json({ success: true, data: subAdmins });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch sub-admins' });
    }
});
exports.getSubAdmins = getSubAdmins;
