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
exports.auditLog = void 0;
const audit_logger_1 = require("../utils/audit.logger");
const auditLog = (action, entity) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // We hook into the response finish event to ensure we log what actually happened
        res.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Only log if response was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const entityId = req.params.id || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.id) || null;
                    const details = {
                        body: req.body,
                        params: req.params,
                        query: req.query,
                        statusCode: res.statusCode
                    };
                    yield audit_logger_1.AuditLogger.log(req, action, entity, entityId, null, // oldValue cannot be easily computed in middleware
                    req.body, // newValue
                    details);
                }
                catch (error) {
                    console.error('Failed to write audit log in middleware', error);
                }
            }
        }));
        next();
    });
};
exports.auditLog = auditLog;
