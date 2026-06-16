import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class JudgeCategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.JudgeCategoryWhereInput;
    orderBy?: Prisma.JudgeCategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.judgeCategory.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.JudgeCategoryWhereInput) {
    return prisma.judgeCategory.count({ where });
  }

  async findById(id: string) {
    return prisma.judgeCategory.findUnique({ where: { id } });
  }

  async create(data: Prisma.JudgeCategoryCreateInput | Prisma.JudgeCategoryUncheckedCreateInput) {
    return prisma.judgeCategory.create({ data });
  }

  async update(id: string, data: Prisma.JudgeCategoryUpdateInput | Prisma.JudgeCategoryUncheckedUpdateInput) {
    return prisma.judgeCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    try {
      return await (prisma.judgeCategory as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.judgeCategory.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.judgeCategory as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.judgeCategory.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
