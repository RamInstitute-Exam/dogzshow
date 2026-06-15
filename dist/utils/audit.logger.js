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
exports.AuditLogger = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AuditLogger {
    /**
     * Log an audit event to the database.
     */
    static log(req, action, entity, entityId, oldValue, newValue, details) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const userId = (user === null || user === void 0 ? void 0 : user.id) || null;
                const ipAddress = req.ip || req.socket.remoteAddress || null;
                const userAgent = req.headers['user-agent'] || '';
                // Basic browser and device detection
                let browser = 'Unknown Browser';
                let device = 'Unknown Device';
                if (userAgent.includes('Firefox'))
                    browser = 'Firefox';
                else if (userAgent.includes('Chrome'))
                    browser = 'Chrome';
                else if (userAgent.includes('Safari'))
                    browser = 'Safari';
                else if (userAgent.includes('Edge'))
                    browser = 'Edge';
                else if (userAgent.includes('Postman'))
                    browser = 'Postman';
                if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
                    device = 'Mobile';
                }
                else {
                    device = 'Desktop';
                }
                yield prisma_1.default.auditLog.create({
                    data: {
                        userId,
                        action,
                        entity,
                        entityId: entityId || null,
                        ipAddress,
                        browser,
                        device,
                        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
                        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
                        details: details ? JSON.parse(JSON.stringify(details)) : null
                    }
                });
            }
            catch (error) {
                console.error('AuditLogger Error:', error);
            }
        });
    }
}
exports.AuditLogger = AuditLogger;
