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
exports.RoleService = void 0;
const role_repository_1 = require("../repositories/role.repository");
const prisma_1 = __importDefault(require("../prisma"));
class RoleService {
    constructor() {
        this.repository = new role_repository_1.RoleRepository();
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            let where = {};
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search } },
                    { displayName: { contains: query.search } },
                    { description: { contains: query.search } }
                ];
            }
            const [data, total] = yield Promise.all([
                this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
                this.repository.count(where)
            ]);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.repository.findById(id);
            if (!item)
                throw new Error('Role not found');
            return item;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { permissions } = data, roleData = __rest(data, ["permissions"]);
            const role = yield this.repository.create(roleData);
            if (permissions && Array.isArray(permissions) && permissions.length > 0) {
                yield prisma_1.default.rolePermission.createMany({
                    data: permissions.map((permId) => ({
                        roleId: role.id,
                        permissionId: permId
                    }))
                });
            }
            return this.getById(role.id);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { permissions } = data, roleData = __rest(data, ["permissions"]);
            const role = yield this.repository.update(id, roleData);
            if (permissions && Array.isArray(permissions)) {
                yield prisma_1.default.rolePermission.deleteMany({
                    where: { roleId: id }
                });
                if (permissions.length > 0) {
                    yield prisma_1.default.rolePermission.createMany({
                        data: permissions.map((permId) => ({
                            roleId: id,
                            permissionId: permId
                        }))
                    });
                }
            }
            return this.getById(id);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.delete(id);
        });
    }
    bulkDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.bulkDelete(ids);
        });
    }
}
exports.RoleService = RoleService;
