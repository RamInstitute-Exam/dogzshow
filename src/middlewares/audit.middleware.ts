import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // We hook into the response finish event to ensure we log what actually happened
    res.on('finish', async () => {
      try {
        const userId = (req as any).user?.id;
        const details = {
          body: req.body,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode
        };

        await prisma.auditLog.create({
          data: {
            userId,
            action,
            entity,
            entityId: (req.params.id as string) || null,
            details,
            ipAddress: req.ip
          }
        });
      } catch (error) {
        console.error('Failed to write audit log', error);
      }
    });

    next();
  };
};
