import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class JudgeRequestRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.JudgeRequestWhereInput;
    orderBy?: Prisma.JudgeRequestOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.judgeRequest.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.JudgeRequestWhereInput) {
    return prisma.judgeRequest.count({ where });
  }

  async findById(id: string) {
    return prisma.judgeRequest.findUnique({ where: { id } });
  }

  async create(data: Prisma.JudgeRequestCreateInput | Prisma.JudgeRequestUncheckedCreateInput) {
    return prisma.judgeRequest.create({ data });
  }

  async update(id: string, data: Prisma.JudgeRequestUpdateInput | Prisma.JudgeRequestUncheckedUpdateInput) {
    return prisma.judgeRequest.update({ where: { id }, data });
  }

  async delete(id: string) {
    try {
      return await (prisma.judgeRequest as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.judgeRequest.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.judgeRequest as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.judgeRequest.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
