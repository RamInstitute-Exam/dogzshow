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
exports.BlogRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class BlogRepository {
    findAll(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, take, where, orderBy } = params;
            const finalWhere = Object.assign({ deletedAt: null }, where);
            return prisma_1.default.blog.findMany({
                skip,
                take,
                where: finalWhere,
                orderBy: orderBy || { createdAt: 'desc' }
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalWhere = Object.assign({ deletedAt: null }, where);
            return prisma_1.default.blog.count({ where: finalWhere });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.findFirst({
                where: { id, deletedAt: null }
            });
        });
    }
    findBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.findFirst({
                where: { slug, deletedAt: null }
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.create({ data });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.update({
                where: { id },
                data: { deletedAt: new Date(), isActive: false }
            });
        });
    }
    bulkDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.blog.updateMany({
                where: { id: { in: ids } },
                data: { deletedAt: new Date(), isActive: false }
            });
        });
    }
}
exports.BlogRepository = BlogRepository;
