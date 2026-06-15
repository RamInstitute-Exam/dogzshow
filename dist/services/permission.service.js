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
exports.PermissionService = void 0;
const permission_repository_1 = require("../repositories/permission.repository");
const prisma_1 = __importDefault(require("../prisma"));
class PermissionService {
    constructor() {
        this.repository = new permission_repository_1.PermissionRepository();
    }
    ensurePermissionsSeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.repository.count();
            if (count === 0) {
                const modules = [
                    'users', 'roles', 'permissions', 'dogs', 'owners', 'breeds', 'fci-groups',
                    'show-classes', 'clubs', 'judges', 'events', 'registrations', 'payments',
                    'winners', 'banners', 'cms', 'gallery', 'videos', 'faqs', 'blogs',
                    'notifications', 'reports', 'support-tickets', 'downloads', 'settings'
                ];
                const actions = ['view', 'create', 'edit', 'delete', 'export', 'approve'];
                const dataToCreate = [];
                for (const mod of modules) {
                    for (const act of actions) {
                        dataToCreate.push({
                            name: `${mod}:${act}`,
                            description: `Can ${act} ${mod}`
                        });
                    }
                }
                yield prisma_1.default.permission.createMany({
                    data: dataToCreate
                });
            }
        });
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensurePermissionsSeeded();
            let where = { deletedAt: null };
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search } },
                    { description: { contains: query.search } }
                ];
            }
            if (query.all === 'true' || query.limit === 'all') {
                const data = yield this.repository.findAll({ where });
                return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
            }
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
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
                throw new Error('Permission not found');
            return item;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.update(id, data);
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
exports.PermissionService = PermissionService;
