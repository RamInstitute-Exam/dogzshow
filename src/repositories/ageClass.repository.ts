import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class AgeClassRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AgeClassWhereInput;
    orderBy?: Prisma.AgeClassOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.ageClass.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.AgeClassWhereInput) {
    return prisma.ageClass.count({ where });
  }

  async findById(id: string) {
    return prisma.ageClass.findUnique({ where: { id } });
  }

  async create(data: Prisma.AgeClassCreateInput | Prisma.AgeClassUncheckedCreateInput) {
    return prisma.ageClass.create({ data });
  }

  async update(id: string, data: Prisma.AgeClassUpdateInput | Prisma.AgeClassUncheckedUpdateInput) {
    return prisma.ageClass.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.ageClass as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.ageClass.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.ageClass as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.ageClass.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
