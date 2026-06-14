import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class WinnerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WinnerWhereInput;
    orderBy?: Prisma.WinnerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.winner.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.WinnerWhereInput) {
    return prisma.winner.count({ where });
  }

  async findById(id: string) {
    return prisma.winner.findUnique({ where: { id } });
  }

  async create(data: Prisma.WinnerCreateInput | Prisma.WinnerUncheckedCreateInput) {
    return prisma.winner.create({ data });
  }

  async update(id: string, data: Prisma.WinnerUpdateInput | Prisma.WinnerUncheckedUpdateInput) {
    return prisma.winner.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.winner as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.winner.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.winner as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.winner.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
