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
exports.auditLog = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const auditLog = (action, entity) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // We hook into the response finish event to ensure we log what actually happened
        res.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const details = {
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    statusCode: res.statusCode
                };
                yield prisma_1.default.auditLog.create({
                    data: {
                        userId,
                        action,
                        entity,
                        entityId: req.params.id || null,
                        details,
                        ipAddress: req.ip
                    }
                });
            }
            catch (error) {
                console.error('Failed to write audit log', error);
            }
        }));
        next();
    });
};
exports.auditLog = auditLog;
