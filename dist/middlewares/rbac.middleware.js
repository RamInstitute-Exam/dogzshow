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
exports.checkActionPermission = exports.requirePermission = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Enterprise RBAC Middleware
 * Validates that the logged-in user has the required permission, either explicitly or via role hierarchy.
 */
const requirePermission = (requiredPermission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Unauthorized: Authentication required' });
                return;
            }
            // Extract user roles
            const userRoles = ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.map((ur) => ur.role)) || [];
            // 1. Super Admin bypasses all permission checks
            const isSuperAdmin = userRoles.some((role) => role.name.toLowerCase() === 'super admin' || role.name.toLowerCase() === 'super_admin');
            if (isSuperAdmin) {
                next();
                return;
            }
            // 2. Direct permission check (explicit match)
            const userPermissionNames = new Set();
            userRoles.forEach((role) => {
                var _a;
                (_a = role.permissions) === null || _a === void 0 ? void 0 : _a.forEach((rp) => {
                    var _a;
                    if ((_a = rp.permission) === null || _a === void 0 ? void 0 : _a.name) {
                        userPermissionNames.add(rp.permission.name);
                    }
                });
            });
            if (userPermissionNames.has(requiredPermission)) {
                next();
                return;
            }
            // 3. Hierarchical inheritance check based on role priority
            const maxUserPriority = userRoles.length > 0
                ? Math.max(...userRoles.map((r) => r.priority || 0))
                : 0;
            // Find roles that have this permission
            const rolesWithPermission = yield prisma_1.default.role.findMany({
                where: {
                    permissions: {
                        some: {
                            permission: {
                                name: requiredPermission
                            }
                        }
                    }
                }
            });
            const hasInheritedPermission = rolesWithPermission.some((role) => role.priority <= maxUserPriority);
            if (hasInheritedPermission) {
                next();
                return;
            }
            res.status(403).json({
                error: `Forbidden: You do not have the required permission (${requiredPermission})`
            });
        }
        catch (error) {
            console.error('RBAC Permission Middleware Error:', error);
            res.status(500).json({ error: 'Internal Server Error during authorization' });
        }
    });
};
exports.requirePermission = requirePermission;
/**
 * Check action permission programmatically (e.g. within services)
 */
const checkActionPermission = (user, resourceOwnerId) => {
    var _a;
    const userRoles = ((_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.map((ur) => ur.role)) || [];
    const isSuperAdminOrAdmin = userRoles.some((role) => role.name.toLowerCase() === 'super admin' ||
        role.name.toLowerCase() === 'super_admin' ||
        role.name.toLowerCase() === 'admin');
    if (isSuperAdminOrAdmin) {
        return true;
    }
    if (user.id === resourceOwnerId) {
        return true;
    }
    return false;
};
exports.checkActionPermission = checkActionPermission;
