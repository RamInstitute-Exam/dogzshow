import { AuditLogRepository } from '../repositories/auditLog.repository';
import { Prisma } from '@prisma/client';

export class AuditLogService {
  private repository: AuditLogRepository;

  constructor() {
    this.repository = new AuditLogRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';
    const userId = query.userId;
    const entity = query.entity;
    const action = query.action;
    const startDate = query.startDate;
    const endDate = query.endDate;

    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
        { ipAddress: { contains: search } },
        { browser: { contains: search } },
        { device: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { email: { contains: search } } }
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    if (entity) {
      where.entity = entity;
    }

    if (action) {
      where.action = action;
    }

    // Handle date filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Extend to end of the day if it's just a date string (YYYY-MM-DD)
        const end = new Date(endDate);
        if (endDate.length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
      }
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      this.repository.count(where)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(id: string) {
    const log = await this.repository.findById(id);
    if (!log) throw new Error('Audit log entry not found');
    return log;
  }
}
