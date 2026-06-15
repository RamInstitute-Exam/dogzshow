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
exports.CompetitionRoundRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class CompetitionRoundRepository {
    findAll(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, take, where, orderBy } = params;
            return prisma_1.default.competitionRound.findMany({
                skip, take, where, orderBy
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.competitionRound.count({ where });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.competitionRound.findUnique({ where: { id } });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.competitionRound.create({ data });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.competitionRound.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Checking if deletedAt exists on schema, falling back to hard delete if not
            try {
                return yield prisma_1.default.competitionRound.update({
                    where: { id },
                    data: { deletedAt: new Date() }
                });
            }
            catch (e) {
                return prisma_1.default.competitionRound.delete({ where: { id } });
            }
        });
    }
    bulkDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_1.default.competitionRound.updateMany({
                    where: { id: { in: ids } },
                    data: { deletedAt: new Date() }
                });
            }
            catch (e) {
                return prisma_1.default.competitionRound.deleteMany({
                    where: { id: { in: ids } }
                });
            }
        });
    }
}
exports.CompetitionRoundRepository = CompetitionRoundRepository;
