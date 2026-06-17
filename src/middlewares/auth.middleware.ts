import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Token missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Unauthorized: Invalid user' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRoles = req.user.roles?.map((ur: any) => ur.role?.name || '') || [];
    
    // Normalize role string (uppercase, remove spaces, underscores, and dashes)
    const normalize = (role: string) => (role || '').toUpperCase().replace(/[\s_-]+/g, '');
    
    const normalizedUserRoles = userRoles.map(normalize);

    // SUPER_ADMIN automatically has full access and bypasses authorization checks
    // Robust check: any admin role or admin email bypasses
    const isAdmin = normalizedUserRoles.some((r: string) => r.includes('ADMIN')) || 
                    (req.user.email && req.user.email.toLowerCase().includes('admin'));

    if (isAdmin) {
      next();
      return;
    }

    const normalizedAllowedRoles = allowedRoles.map(normalize);
    const hasRole = normalizedUserRoles.some((role: string) => normalizedAllowedRoles.includes(role));

    if (!hasRole) {
      console.log(`[RBAC] Forbidden: User roles: ${normalizedUserRoles.join(', ')} | Allowed: ${normalizedAllowedRoles.join(', ')}`);
      res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions',
        debug: {
          userRoles: normalizedUserRoles,
          allowedRoles: normalizedAllowedRoles
        }
      });
      return;
    }

    next();
  };
};
