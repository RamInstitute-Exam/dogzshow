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
exports.reorderMenus = exports.deleteMenu = exports.updateMenu = exports.createMenu = exports.getMenus = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { position = 'NAVBAR' } = req.query;
        const menus = yield prisma_1.default.menu.findMany({
            where: { position: String(position) },
            orderBy: { displayOrder: 'asc' }
        });
        // Build hierarchical structure
        const menuTree = menus.filter(m => !m.parentId).map(parent => (Object.assign(Object.assign({}, parent), { children: menus.filter(child => child.parentId === parent.id).sort((a, b) => a.displayOrder - b.displayOrder) })));
        res.status(200).json({ success: true, data: menuTree });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getMenus = getMenus;
const createMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const menu = yield prisma_1.default.menu.create({ data });
        res.status(201).json({ success: true, message: 'Menu created', data: menu });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createMenu = createMenu;
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const menu = yield prisma_1.default.menu.update({ where: { id: String(id) }, data });
        res.status(200).json({ success: true, message: 'Menu updated', data: menu });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateMenu = updateMenu;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Also delete children
        yield prisma_1.default.menu.deleteMany({ where: { parentId: String(id) } });
        yield prisma_1.default.menu.delete({ where: { id: String(id) } });
        res.status(200).json({ success: true, message: 'Menu deleted' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteMenu = deleteMenu;
const reorderMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items } = req.body; // Array of { id, displayOrder, parentId }
        for (const item of items) {
            yield prisma_1.default.menu.update({
                where: { id: String(item.id) },
                data: { displayOrder: Number(item.displayOrder), parentId: item.parentId ? String(item.parentId) : null }
            });
        }
        res.status(200).json({ success: true, message: 'Menus reordered' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.reorderMenus = reorderMenus;
