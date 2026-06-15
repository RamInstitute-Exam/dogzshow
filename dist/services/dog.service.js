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
exports.DogService = void 0;
const dog_repository_1 = require("../repositories/dog.repository");
const prisma_1 = __importDefault(require("../prisma"));
class DogService {
    constructor() {
        this.repository = new dog_repository_1.DogRepository();
    }
    getAllDogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const search = query.search || '';
            let where = { deletedAt: null };
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { kciNumber: { contains: search } },
                    { microchipNumber: { contains: search } },
                    { micNumber: { contains: search } }
                ];
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
    getDogById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const dog = yield this.repository.findById(id);
            if (!dog || dog.deletedAt) {
                throw new Error('Dog not found or deleted');
            }
            return dog;
        });
    }
    createDog(data, userOwnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Duplicate validations
            if (data.kciNumber) {
                const existing = yield this.repository.findByKci(data.kciNumber);
                if (existing)
                    throw new Error('KCI Number already exists');
            }
            if (data.micNumber) {
                const existing = yield this.repository.findByMic(data.micNumber);
                if (existing)
                    throw new Error('MIC Number already exists');
            }
            // Prepare create payload using a transaction-like boundary handled safely by prisma relations
            // We will extract owner/breeder if passed
            let ownerConnectOrCreate = undefined;
            if (data.owner) {
                ownerConnectOrCreate = {
                    create: {
                        name: data.owner.name,
                        email: data.owner.email,
                        phone: data.owner.phone
                    }
                };
            }
            let breederConnectOrCreate = undefined;
            if (data.breeder) {
                breederConnectOrCreate = {
                    create: {
                        name: data.breeder.name,
                        kennelName: data.breeder.kennelName,
                        phone: data.breeder.phone
                    }
                };
            }
            const payload = {
                name: data.name,
                breed: { connect: { id: data.breedId } },
                gender: data.gender,
                dob: data.dob ? new Date(data.dob) : null,
                color: data.color,
                markings: data.markings,
                kciNumber: data.kciNumber,
                microchipNumber: data.microchipNumber,
                micNumber: data.micNumber,
                weight: data.weight ? parseFloat(data.weight) : null,
                height: data.height ? parseFloat(data.height) : null,
                isImported: data.isImported || false,
                countryOfOrigin: data.countryOfOrigin,
                isChampion: data.isChampion || false,
                ownerUser: { connect: { id: userOwnerId } }
            };
            if (ownerConnectOrCreate)
                payload.owner = ownerConnectOrCreate;
            if (breederConnectOrCreate)
                payload.breeder = breederConnectOrCreate;
            const newDog = yield this.repository.create(payload);
            // Audit Log Creation
            yield prisma_1.default.activityLog.create({
                data: {
                    userId: userOwnerId,
                    action: 'DOG_CREATED',
                    description: `Created dog profile for ${newDog.name}`
                }
            });
            return newDog;
        });
    }
    updateDog(id, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repository.findById(id);
            if (!existing)
                throw new Error('Dog not found');
            const updated = yield this.repository.update(id, data);
            // Audit Log
            yield prisma_1.default.auditLog.create({
                data: {
                    userId,
                    action: 'UPDATE_DOG',
                    entity: 'DOG',
                    entityId: id,
                    details: data
                }
            });
            return updated;
        });
    }
    deleteDog(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.repository.softDelete(id);
            yield prisma_1.default.activityLog.create({
                data: {
                    userId,
                    action: 'DOG_DELETED',
                    description: `Deleted dog profile with ID ${id}`
                }
            });
            return deleted;
        });
    }
    restoreDog(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const restored = yield this.repository.restore(id);
            yield prisma_1.default.activityLog.create({
                data: { userId, action: 'DOG_RESTORED', description: `Restored dog profile with ID ${id}` }
            });
            return restored;
        });
    }
    bulkDeleteDogs(ids, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repository.bulkSoftDelete(ids);
            yield prisma_1.default.activityLog.create({
                data: { userId, action: 'DOG_BULK_DELETED', description: `Bulk deleted dogs: ${ids.join(', ')}` }
            });
            return result;
        });
    }
    bulkUpdateDogs(ids, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repository.bulkUpdate(ids, data);
            yield prisma_1.default.activityLog.create({
                data: { userId, action: 'DOG_BULK_UPDATED', description: `Bulk updated dogs: ${ids.join(', ')}` }
            });
            return result;
        });
    }
}
exports.DogService = DogService;
