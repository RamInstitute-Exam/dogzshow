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
exports.DogRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class DogRepository {
    findAll(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, take, where, orderBy } = params;
            return prisma_1.default.dog.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    breed: true,
                    photos: true,
                    owner: true,
                    breeder: true,
                    kciCertificate: true,
                    _count: { select: { registrations: true, winnerTags: true } }
                }
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.count({ where });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.findUnique({
                where: { id },
                include: {
                    breed: true,
                    photos: true,
                    owner: true,
                    breeder: true,
                    kciCertificate: true,
                    winnerTags: true,
                    registrations: { include: { event: true, category: true } }
                }
            });
        });
    }
    findByKci(kciNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.findUnique({ where: { kciNumber } });
        });
    }
    findByMic(micNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.findUnique({ where: { micNumber } });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.create({
                data,
                include: { breed: true, owner: true, breeder: true }
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.update({
                where: { id },
                data,
                include: { breed: true, owner: true, breeder: true }
            });
        });
    }
    softDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        });
    }
    restore(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.update({
                where: { id },
                data: { deletedAt: null }
            });
        });
    }
    hardDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.delete({ where: { id } });
        });
    }
    bulkSoftDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.updateMany({
                where: { id: { in: ids } },
                data: { deletedAt: new Date() }
            });
        });
    }
    bulkUpdate(ids, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.dog.updateMany({
                where: { id: { in: ids } },
                data
            });
        });
    }
}
exports.DogRepository = DogRepository;
