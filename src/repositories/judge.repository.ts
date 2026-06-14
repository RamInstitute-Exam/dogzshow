import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class JudgeRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.JudgeWhereInput;
    orderBy?: Prisma.JudgeOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.judge.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.JudgeWhereInput) {
    return prisma.judge.count({ where });
  }

  async findById(id: string) {
    return prisma.judge.findUnique({ where: { id } });
  }

  async create(data: Prisma.JudgeCreateInput | Prisma.JudgeUncheckedCreateInput) {
    return prisma.judge.create({ data });
  }

  async update(id: string, data: Prisma.JudgeUpdateInput | Prisma.JudgeUncheckedUpdateInput) {
    return prisma.judge.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.judge as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.judge.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.judge as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.judge.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
