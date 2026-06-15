import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from '../utils/audit.logger';

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // We hook into the response finish event to ensure we log what actually happened
    res.on('finish', async () => {
      // Only log if response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const entityId = (req.params.id as string) || (req.body?.id as string) || null;
          const details = {
            body: req.body,
            params: req.params,
            query: req.query,
            statusCode: res.statusCode
          };
          
          await AuditLogger.log(
            req,
            action,
            entity,
            entityId,
            null, // oldValue cannot be easily computed in middleware
            req.body, // newValue
            details
          );
        } catch (error) {
          console.error('Failed to write audit log in middleware', error);
        }
      }
    });

    next();
  };
};
