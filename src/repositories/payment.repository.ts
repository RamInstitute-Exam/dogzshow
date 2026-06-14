import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PaymentRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.payment.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.PaymentWhereInput) {
    return prisma.payment.count({ where });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  }

  async create(data: Prisma.PaymentCreateInput | Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({ data });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput | Prisma.PaymentUncheckedUpdateInput) {
    return prisma.payment.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.payment as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.payment.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.payment as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.payment.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
