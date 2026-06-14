import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class WinnerTagRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WinnerTagWhereInput;
    orderBy?: Prisma.WinnerTagOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.winnerTag.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.WinnerTagWhereInput) {
    return prisma.winnerTag.count({ where });
  }

  async findById(id: string) {
    return prisma.winnerTag.findUnique({ where: { id } });
  }

  async create(data: Prisma.WinnerTagCreateInput | Prisma.WinnerTagUncheckedCreateInput) {
    return prisma.winnerTag.create({ data });
  }

  async update(id: string, data: Prisma.WinnerTagUpdateInput | Prisma.WinnerTagUncheckedUpdateInput) {
    return prisma.winnerTag.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.winnerTag as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.winnerTag.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.winnerTag as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.winnerTag.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
