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
exports.WinnerService = void 0;
const winner_repository_1 = require("../repositories/winner.repository");
class WinnerService {
    constructor() {
        this.repository = new winner_repository_1.WinnerRepository();
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            let where = {};
            if (query.search) {
                // basic fallback search implementation
                where.OR = [
                    { name: { contains: query.search } },
                    { title: { contains: query.search } }
                ].filter(x => Object.keys(x).length > 0);
            }
            try {
                const [data, total] = yield Promise.all([
                    this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
                    this.repository.count(where)
                ]);
                return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
            }
            catch (e) {
                // Fallback for models without name/title fields
                const [data, total] = yield Promise.all([
                    this.repository.findAll({ skip: (page - 1) * limit, take: limit }),
                    this.repository.count()
                ]);
                return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.repository.findById(id);
            if (!item)
                throw new Error('Winner not found');
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
exports.WinnerService = WinnerService;
