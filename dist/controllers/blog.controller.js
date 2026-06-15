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
exports.bulkRemove = exports.remove = exports.update = exports.create = exports.getBySlug = exports.getById = exports.getAll = void 0;
const blog_service_1 = require("../services/blog.service");
const service = new blog_service_1.BlogService();
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getAll(req.query);
        res.status(200).json(Object.assign({ success: true, message: 'Blogs retrieved successfully' }, result));
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
const getBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getBySlug(req.params.slug);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
exports.getBySlug = getBySlug;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.create(req.body);
        res.status(201).json({ success: true, message: 'Blog created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Blog updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.remove = remove;
const bulkRemove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.bulkDelete(req.body.ids);
        res.status(200).json({ success: true, message: 'Blogs bulk deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.bulkRemove = bulkRemove;
