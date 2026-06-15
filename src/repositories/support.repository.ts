import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class SupportRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SupportTicketWhereInput;
    orderBy?: Prisma.SupportTicketOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const finalWhere: Prisma.SupportTicketWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.supportTicket.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async count(where?: Prisma.SupportTicketWhereInput) {
    const finalWhere: Prisma.SupportTicketWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.supportTicket.count({ where: finalWhere });
  }

  async findById(id: string) {
    return prisma.supportTicket.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async create(data: Prisma.SupportTicketUncheckedCreateInput | Prisma.SupportTicketCreateInput) {
    return prisma.supportTicket.create({ data });
  }

  async update(id: string, data: Prisma.SupportTicketUpdateInput | Prisma.SupportTicketUncheckedUpdateInput) {
    return prisma.supportTicket.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.supportTicket.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async bulkDelete(ids: string[]) {
    return prisma.supportTicket.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
  }
}
