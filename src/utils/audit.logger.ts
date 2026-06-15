import { Request } from 'express';
import prisma from '../prisma';

export class AuditLogger {
  /**
   * Log an audit event to the database.
   */
  static async log(
    req: Request,
    action: string,
    entity: string,
    entityId?: string | null,
    oldValue?: any,
    newValue?: any,
    details?: any
  ) {
    try {
      const user = (req as any).user;
      const userId = user?.id || null;
      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || '';
      
      // Basic browser and device detection
      let browser = 'Unknown Browser';
      let device = 'Unknown Device';

      if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      else if (userAgent.includes('Postman')) browser = 'Postman';

      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        device = 'Mobile';
      } else {
        device = 'Desktop';
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId: entityId || null,
          ipAddress,
          browser,
          device,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
          details: details ? JSON.parse(JSON.stringify(details)) : null
        }
      });
    } catch (error) {
      console.error('AuditLogger Error:', error);
    }
  }
}
