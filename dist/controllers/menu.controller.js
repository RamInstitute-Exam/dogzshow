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
exports.reorderMenus = exports.deleteMenu = exports.updateMenu = exports.createMenu = exports.getAllMenusForAdmin = exports.getMenus = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// ─── Helpers ───────────────────────────────────────────────────────────────
/** Build a nested tree from a flat list of menus */
function buildTree(menus) {
    const roots = menus.filter(m => !m.parentId);
    const childrenOf = (parentId) => menus
        .filter(m => m.parentId === parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(m => (Object.assign(Object.assign({}, m), { children: childrenOf(m.id) })));
    return roots
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(m => (Object.assign(Object.assign({}, m), { children: childrenOf(m.id) })));
}
// ─── Controllers ───────────────────────────────────────────────────────────
/**
 * GET /menus
 * Filters by position, visibility, and optionally by role permissions.
 * Query params:
 *   - position  (default: NAVBAR)
 *   - role      (optional) user role name — e.g. "Guest", "User", "Admin"
 */
const getMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { position = 'NAVBAR', role } = req.query;
        // Base filter: correct position and visible
        const where = {
            position: String(position),
            visibility: true,
        };
        // RBAC: filter by role visibility flags
        if (role === 'Guest' || !role) {
            where.onlyLoggedUser = false;
            where.onlyAdmin = false;
        }
        else if (role === 'Admin' || role === 'Super Admin') {
            // Admin can see everything — no extra filter
        }
        // "User", "Judge", "Organizer" etc. can see everything except onlyAdmin
        if (role && role !== 'Admin' && role !== 'Super Admin') {
            where.onlyGuest = false;
            where.onlyAdmin = false;
        }
        const menus = yield prisma_1.default.menu.findMany({
            where,
            include: {
                permissions: {
                    include: { role: true }
                }
            },
            orderBy: { displayOrder: 'asc' },
        });
        // If a role is specified and a menu has explicit permissions configured,
        // filter to only those menus whose permissions include the requested role.
        let filtered = menus;
        if (role) {
            filtered = menus.filter(m => {
                // No explicit permissions = visible to everyone (respecting the flag filters above)
                if (!m.permissions || m.permissions.length === 0)
                    return true;
                // Has permissions = only show if role matches
                return m.permissions.some((p) => { var _a; return ((_a = p.role) === null || _a === void 0 ? void 0 : _a.name) === role; });
            });
        }
        const tree = buildTree(filtered);
        res.status(200).json({ success: true, data: tree });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getMenus = getMenus;
/**
 * GET /menus/all
 * Admin-only: returns ALL menus regardless of visibility/role, for management.
 */
const getAllMenusForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { position } = req.query;
        const where = {};
        if (position)
            where.position = String(position);
        const menus = yield prisma_1.default.menu.findMany({
            where,
            include: {
                permissions: { include: { role: true } }
            },
            orderBy: [{ position: 'asc' }, { displayOrder: 'asc' }],
        });
        const tree = buildTree(menus);
        res.status(200).json({ success: true, data: tree });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllMenusForAdmin = getAllMenusForAdmin;
const createMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, url, icon, position = 'NAVBAR', parentId, displayOrder = 0, visibility = true, openNewTab = false, badge, color, onlyLoggedUser = false, onlyGuest = false, onlyAdmin = false, roleIds = [] } = req.body;
        const menu = yield prisma_1.default.menu.create({
            data: {
                name, url, icon, position,
                parentId: parentId || null,
                displayOrder: Number(displayOrder),
                visibility, openNewTab, badge, color,
                onlyLoggedUser, onlyGuest, onlyAdmin,
            },
        });
        // Attach role permissions if provided
        if (roleIds.length > 0) {
            yield prisma_1.default.menuPermission.createMany({
                data: roleIds.map((roleId) => ({ menuId: menu.id, roleId })),
                skipDuplicates: true,
            });
        }
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
        const { name, url, icon, position, parentId, displayOrder, visibility, openNewTab, badge, color, onlyLoggedUser, onlyGuest, onlyAdmin, roleIds } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (url !== undefined)
            updateData.url = url;
        if (icon !== undefined)
            updateData.icon = icon;
        if (position !== undefined)
            updateData.position = position;
        if (parentId !== undefined)
            updateData.parentId = parentId || null;
        if (displayOrder !== undefined)
            updateData.displayOrder = Number(displayOrder);
        if (visibility !== undefined)
            updateData.visibility = visibility;
        if (openNewTab !== undefined)
            updateData.openNewTab = openNewTab;
        if (badge !== undefined)
            updateData.badge = badge;
        if (color !== undefined)
            updateData.color = color;
        if (onlyLoggedUser !== undefined)
            updateData.onlyLoggedUser = onlyLoggedUser;
        if (onlyGuest !== undefined)
            updateData.onlyGuest = onlyGuest;
        if (onlyAdmin !== undefined)
            updateData.onlyAdmin = onlyAdmin;
        const menu = yield prisma_1.default.menu.update({ where: { id: String(id) }, data: updateData });
        // Update permissions if provided
        if (roleIds !== undefined) {
            yield prisma_1.default.menuPermission.deleteMany({ where: { menuId: String(id) } });
            if (roleIds.length > 0) {
                yield prisma_1.default.menuPermission.createMany({
                    data: roleIds.map((roleId) => ({ menuId: String(id), roleId })),
                    skipDuplicates: true,
                });
            }
        }
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
        // Cascade: delete children first (permissions deleted via Cascade on schema)
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
        const { items } = req.body; // Array of { id, displayOrder, parentId? }
        yield Promise.all(items.map((item) => prisma_1.default.menu.update({
            where: { id: String(item.id) },
            data: {
                displayOrder: Number(item.displayOrder),
                parentId: item.parentId ? String(item.parentId) : null,
            },
        })));
        res.status(200).json({ success: true, message: 'Menus reordered' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.reorderMenus = reorderMenus;
