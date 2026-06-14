import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class EventCategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventCategoryWhereInput;
    orderBy?: Prisma.EventCategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.eventCategory.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.EventCategoryWhereInput) {
    return prisma.eventCategory.count({ where });
  }

  async findById(id: string) {
    return prisma.eventCategory.findUnique({ where: { id } });
  }

  async create(data: Prisma.EventCategoryCreateInput | Prisma.EventCategoryUncheckedCreateInput) {
    return prisma.eventCategory.create({ data });
  }

  async update(id: string, data: Prisma.EventCategoryUpdateInput | Prisma.EventCategoryUncheckedUpdateInput) {
    return prisma.eventCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.eventCategory as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.eventCategory.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.eventCategory as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.eventCategory.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
