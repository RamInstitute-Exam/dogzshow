import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
  EVENT_MANAGER = 'EVENT_MANAGER',
  JUDGE = 'JUDGE',
  USER = 'USER',
  PUBLIC = 'PUBLIC'
}

/**
 * Enterprise RBAC Middleware
 * Enforces API-level permissions by comparing the required roles against the user's assigned role.
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // In a production scenario, the user object is attached to the request by the AuthMiddleware
      // after verifying the JWT.
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const userRole: UserRole = user.role;

      if (!allowedRoles.includes(userRole)) {
        Logger.warn(`RBAC Violation: User ${user.id} (${userRole}) attempted to access restricted endpoint.`);
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden: You do not have the required permissions to perform this action.' 
        });
        return;
      }

      next();
    } catch (error) {
      Logger.error('RBAC Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error during authorization' });
    }
  };
};

/**
 * Modular Permission Checker
 * E.g., check if a user can edit an event (Event Managers can only edit their own, Admins can edit all).
 */
export const checkActionPermission = (user: any, resourceOwnerId: string): boolean => {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
    return true; // Unrestricted
  }
  
  if (user.role === UserRole.EVENT_MANAGER && user.id === resourceOwnerId) {
    return true; // Can manage own resources
  }

  return false;
};
