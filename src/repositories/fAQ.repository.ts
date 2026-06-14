import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class FAQRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FAQWhereInput;
    orderBy?: Prisma.FAQOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.fAQ.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.FAQWhereInput) {
    return prisma.fAQ.count({ where });
  }

  async findById(id: string) {
    return prisma.fAQ.findUnique({ where: { id } });
  }

  async create(data: Prisma.FAQCreateInput | Prisma.FAQUncheckedCreateInput) {
    return prisma.fAQ.create({ data });
  }

  async update(id: string, data: Prisma.FAQUpdateInput | Prisma.FAQUncheckedUpdateInput) {
    return prisma.fAQ.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.fAQ as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.fAQ.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.fAQ as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.fAQ.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
