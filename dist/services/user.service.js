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
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
class UserService {
    constructor() {
        this.repository = new user_repository_1.UserRepository();
    }
    getAllUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const search = query.search || '';
            const status = query.status;
            const roleId = query.roleId;
            let where = { deletedAt: null };
            if (search) {
                where.OR = [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } }
                ];
            }
            if (status) {
                where.isActive = status === 'ACTIVE';
            }
            if (roleId) {
                where.roles = { some: { roleId } };
            }
            const [data, total] = yield Promise.all([
                this.repository.findAll({
                    skip: (page - 1) * limit,
                    take: limit,
                    where,
                    orderBy: { createdAt: 'desc' }
                }),
                this.repository.count(where)
            ]);
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.findById(id);
            if (!user || user.deletedAt) {
                throw new Error('User not found or deleted');
            }
            return user;
        });
    }
    createUser(data, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, firstName, lastName, phone, roleId, roleIds } = data, otherData = __rest(data, ["email", "password", "firstName", "lastName", "phone", "roleId", "roleIds"]);
            if (email) {
                const existing = yield this.repository.findByEmail(email);
                if (existing)
                    throw new Error('Email already exists');
            }
            const hashedPassword = yield bcrypt_1.default.hash(password || 'JuzDog@2026', 10);
            const payload = Object.assign({ email, password: hashedPassword, firstName,
                lastName,
                phone }, otherData);
            const newUser = yield this.repository.create(payload);
            if (roleIds && Array.isArray(roleIds)) {
                if (roleIds.length > 0) {
                    yield prisma_1.default.userRole.createMany({
                        data: roleIds.map((rid) => ({ userId: newUser.id, roleId: rid }))
                    });
                }
            }
            else if (roleId) {
                yield prisma_1.default.userRole.create({ data: { userId: newUser.id, roleId } });
            }
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'CREATE_USER', entity: 'USER', entityId: newUser.id, details: { email } }
                });
            }
            return newUser;
        });
    }
    updateUser(id, data, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repository.findById(id);
            if (!existing)
                throw new Error('User not found');
            const { roleId, roleIds, password } = data, updateData = __rest(data, ["roleId", "roleIds", "password"]);
            const payload = Object.assign({}, updateData);
            if (password) {
                payload.password = yield bcrypt_1.default.hash(password, 10);
            }
            // Since we are overriding completely, handle role update separately
            if (roleIds && Array.isArray(roleIds)) {
                yield prisma_1.default.userRole.deleteMany({ where: { userId: id } });
                if (roleIds.length > 0) {
                    yield prisma_1.default.userRole.createMany({
                        data: roleIds.map((rid) => ({ userId: id, roleId: rid }))
                    });
                }
            }
            else if (roleId) {
                yield prisma_1.default.userRole.deleteMany({ where: { userId: id } });
                yield prisma_1.default.userRole.create({ data: { userId: id, roleId } });
            }
            const updated = yield this.repository.update(id, payload);
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'UPDATE_USER', entity: 'USER', entityId: id, details: updateData }
                });
            }
            return updated;
        });
    }
    deleteUser(id, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.repository.softDelete(id);
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'DELETE_USER', entity: 'USER', entityId: id }
                });
            }
            return deleted;
        });
    }
    restoreUser(id, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const restored = yield this.repository.restore(id);
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'RESTORE_USER', entity: 'USER', entityId: id }
                });
            }
            return restored;
        });
    }
    bulkDeleteUsers(ids, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repository.bulkSoftDelete(ids);
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'BULK_DELETE_USER', entity: 'USER', details: { ids } }
                });
            }
            return result;
        });
    }
    bulkUpdateUsers(ids, data, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repository.bulkUpdate(ids, data);
            if (adminId) {
                yield prisma_1.default.auditLog.create({
                    data: { userId: adminId, action: 'BULK_UPDATE_USER', entity: 'USER', details: { ids, data } }
                });
            }
            return result;
        });
    }
}
exports.UserService = UserService;
