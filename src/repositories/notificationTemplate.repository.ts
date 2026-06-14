import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class NotificationTemplateRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationTemplateWhereInput;
    orderBy?: Prisma.NotificationTemplateOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.notificationTemplate.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.NotificationTemplateWhereInput) {
    return prisma.notificationTemplate.count({ where });
  }

  async findById(id: string) {
    return prisma.notificationTemplate.findUnique({ where: { id } });
  }

  async create(data: Prisma.NotificationTemplateCreateInput | Prisma.NotificationTemplateUncheckedCreateInput) {
    return prisma.notificationTemplate.create({ data });
  }

  async update(id: string, data: Prisma.NotificationTemplateUpdateInput | Prisma.NotificationTemplateUncheckedUpdateInput) {
    return prisma.notificationTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.notificationTemplate as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.notificationTemplate.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.notificationTemplate as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.notificationTemplate.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
