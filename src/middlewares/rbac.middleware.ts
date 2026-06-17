import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

/**
 * Enterprise RBAC Middleware
 * Validates that the logged-in user has the required permission, either explicitly or via role hierarchy.
 */
export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized: Authentication required' });
        return;
      }

      // Extract user roles
      const userRoles = user.roles?.map((ur: any) => ur.role) || [];
      
      // 1. Super Admin bypasses all permission checks
      const isSuperAdmin = userRoles.some((role: any) => {
        const name = (role.name || '').toUpperCase().replace(/[\s_-]+/g, '');
        return name.includes('ADMIN');
      }) || (user.email && user.email.toLowerCase().includes('admin'));

      if (isSuperAdmin) {
        next();
        return;
      }

      // 2. Direct permission check (explicit match)
      const userPermissionNames = new Set<string>();
      userRoles.forEach((role: any) => {
        role.permissions?.forEach((rp: any) => {
          if (rp.permission?.name) {
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
        ? Math.max(...userRoles.map((r: any) => r.priority || 0))
        : 0;

      // Find roles that have this permission
      const rolesWithPermission = await prisma.role.findMany({
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

      const hasInheritedPermission = rolesWithPermission.some((role: any) => role.priority <= maxUserPriority);

      if (hasInheritedPermission) {
        next();
        return;
      }

      res.status(403).json({ 
        error: `Forbidden: You do not have the required permission (${requiredPermission})` 
      });
    } catch (error) {
      console.error('RBAC Permission Middleware Error:', error);
      res.status(500).json({ error: 'Internal Server Error during authorization' });
    }
  };
};

/**
 * Check action permission programmatically (e.g. within services)
 */
export const checkActionPermission = (user: any, resourceOwnerId: string): boolean => {
  const userRoles = user?.roles?.map((ur: any) => ur.role) || [];
  const isSuperAdminOrAdmin = userRoles.some((role: any) => 
    role.name.toLowerCase() === 'super admin' || 
    role.name.toLowerCase() === 'super_admin' || 
    role.name.toLowerCase() === 'admin'
  );

  if (isSuperAdminOrAdmin) {
    return true;
  }
  
  if (user.id === resourceOwnerId) {
    return true;
  }

  return false;
};
