"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActionPermission = exports.requireRoles = exports.UserRole = void 0;
const logger_1 = require("../utils/logger");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUB_ADMIN"] = "SUB_ADMIN";
    UserRole["EVENT_MANAGER"] = "EVENT_MANAGER";
    UserRole["JUDGE"] = "JUDGE";
    UserRole["USER"] = "USER";
    UserRole["PUBLIC"] = "PUBLIC";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Enterprise RBAC Middleware
 * Enforces API-level permissions by comparing the required roles against the user's assigned role.
 */
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // In a production scenario, the user object is attached to the request by the AuthMiddleware
            // after verifying the JWT.
            const user = req.user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }
            const userRole = user.role;
            if (!allowedRoles.includes(userRole)) {
                logger_1.Logger.warn(`RBAC Violation: User ${user.id} (${userRole}) attempted to access restricted endpoint.`);
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have the required permissions to perform this action.'
                });
                return;
            }
            next();
        }
        catch (error) {
            logger_1.Logger.error('RBAC Middleware Error:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error during authorization' });
        }
    };
};
exports.requireRoles = requireRoles;
/**
 * Modular Permission Checker
 * E.g., check if a user can edit an event (Event Managers can only edit their own, Admins can edit all).
 */
const checkActionPermission = (user, resourceOwnerId) => {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        return true; // Unrestricted
    }
    if (user.role === UserRole.EVENT_MANAGER && user.id === resourceOwnerId) {
        return true; // Can manage own resources
    }
    return false;
};
exports.checkActionPermission = checkActionPermission;
