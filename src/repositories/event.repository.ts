import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class EventRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.event.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.EventWhereInput) {
    return prisma.event.count({ where });
  }

  async findById(id: string) {
    return prisma.event.findUnique({ where: { id } });
  }

  async create(data: Prisma.EventCreateInput | Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({ data });
  }

  async update(id: string, data: Prisma.EventUpdateInput | Prisma.EventUncheckedUpdateInput) {
    return prisma.event.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.event as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.event.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.event as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.event.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
