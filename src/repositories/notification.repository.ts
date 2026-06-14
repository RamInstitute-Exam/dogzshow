import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class NotificationRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.notification.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.NotificationWhereInput) {
    return prisma.notification.count({ where });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  async create(data: Prisma.NotificationCreateInput | Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput | Prisma.NotificationUncheckedUpdateInput) {
    return prisma.notification.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.notification as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.notification.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.notification as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.notification.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
