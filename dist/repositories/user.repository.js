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
exports.UserRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class UserRepository {
    findAll(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, take, where, orderBy } = params;
            return prisma_1.default.user.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    roles: { include: { role: true } },
                    _count: { select: { dogsOwned: true, eventRegistrations: true } }
                }
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.count({ where });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { id },
                include: {
                    roles: { include: { role: true } },
                    dogsOwned: true,
                    eventRegistrations: { include: { event: true } }
                }
            });
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({ where: { email } });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.create({
                data,
                include: { roles: { include: { role: true } } }
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { id },
                data,
                include: { roles: { include: { role: true } } }
            });
        });
    }
    softDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { id },
                data: { deletedAt: new Date(), isActive: false }
            });
        });
    }
    restore(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { id },
                data: { deletedAt: null, isActive: true }
            });
        });
    }
    hardDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.delete({ where: { id } });
        });
    }
    bulkSoftDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.updateMany({
                where: { id: { in: ids } },
                data: { deletedAt: new Date(), isActive: false }
            });
        });
    }
    bulkUpdate(ids, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.updateMany({
                where: { id: { in: ids } },
                data
            });
        });
    }
}
exports.UserRepository = UserRepository;
