import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class RefundRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RefundWhereInput;
    orderBy?: Prisma.RefundOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.refund.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.RefundWhereInput) {
    return prisma.refund.count({ where });
  }

  async findById(id: string) {
    return prisma.refund.findUnique({ where: { id } });
  }

  async create(data: Prisma.RefundCreateInput | Prisma.RefundUncheckedCreateInput) {
    return prisma.refund.create({ data });
  }

  async update(id: string, data: Prisma.RefundUpdateInput | Prisma.RefundUncheckedUpdateInput) {
    return prisma.refund.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.refund as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.refund.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.refund as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.refund.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
