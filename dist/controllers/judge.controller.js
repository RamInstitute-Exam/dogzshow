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
exports.bulkRemove = exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const audit_logger_1 = require("../utils/audit.logger");
const judge_service_1 = require("../services/judge.service");
const cache_1 = require("../utils/cache");
const service = new judge_service_1.JudgeService();
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        const cacheKey = `judge:all:${JSON.stringify(req.query)}`;
        const cached = cache_1.memoryCache.get(cacheKey);
        if (cached) {
            res.status(200).json(Object.assign({ success: true, message: 'Retrieved successfully' }, cached));
            return;
        }
        const result = yield service.getAll(req.query);
        cache_1.memoryCache.set(cacheKey, result);
        res.status(200).json(Object.assign({ success: true, message: 'Retrieved successfully' }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAll = getAll;
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getById(req.params.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
exports.getById = getById;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.create(req.body);
        cache_1.memoryCache.clear();
        yield audit_logger_1.AuditLogger.log(req, 'CREATE', 'JUDGE', data.id, null, data);
        res.status(201).json({ success: true, message: 'Created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.update(req.params.id, req.body);
        cache_1.memoryCache.clear();
        yield audit_logger_1.AuditLogger.log(req, 'UPDATE', 'JUDGE', data.id, null, data);
        res.status(200).json({ success: true, message: 'Updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.delete(req.params.id);
        cache_1.memoryCache.clear();
        yield audit_logger_1.AuditLogger.log(req, 'DELETE', 'JUDGE', req.params.id, null, null);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.remove = remove;
const bulkRemove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.bulkDelete(req.body.ids);
        cache_1.memoryCache.clear();
        yield audit_logger_1.AuditLogger.log(req, 'BULK_DELETE', 'JUDGE', null, null, { ids: req.body.ids });
        res.status(200).json({ success: true, message: 'Bulk deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkRemove = bulkRemove;
