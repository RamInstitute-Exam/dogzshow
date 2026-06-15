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
exports.AuditLogService = void 0;
const auditLog_repository_1 = require("../repositories/auditLog.repository");
class AuditLogService {
    constructor() {
        this.repository = new auditLog_repository_1.AuditLogRepository();
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const search = query.search || '';
            const userId = query.userId;
            const entity = query.entity;
            const action = query.action;
            const startDate = query.startDate;
            const endDate = query.endDate;
            const where = {};
            if (search) {
                where.OR = [
                    { action: { contains: search } },
                    { entity: { contains: search } },
                    { ipAddress: { contains: search } },
                    { browser: { contains: search } },
                    { device: { contains: search } },
                    { user: { firstName: { contains: search } } },
                    { user: { lastName: { contains: search } } },
                    { user: { email: { contains: search } } }
                ];
            }
            if (userId) {
                where.userId = userId;
            }
            if (entity) {
                where.entity = entity;
            }
            if (action) {
                where.action = action;
            }
            // Handle date filtering
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate);
                }
                if (endDate) {
                    // Extend to end of the day if it's just a date string (YYYY-MM-DD)
                    const end = new Date(endDate);
                    if (endDate.length === 10) {
                        end.setHours(23, 59, 59, 999);
                    }
                    where.createdAt.lte = end;
                }
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
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.repository.findById(id);
            if (!log)
                throw new Error('Audit log entry not found');
            return log;
        });
    }
}
exports.AuditLogService = AuditLogService;
