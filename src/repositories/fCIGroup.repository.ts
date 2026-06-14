import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class FCIGroupRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FCIGroupWhereInput;
    orderBy?: Prisma.FCIGroupOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.fCIGroup.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.FCIGroupWhereInput) {
    return prisma.fCIGroup.count({ where });
  }

  async findById(id: string) {
    return prisma.fCIGroup.findUnique({ where: { id } });
  }

  async create(data: Prisma.FCIGroupCreateInput | Prisma.FCIGroupUncheckedCreateInput) {
    return prisma.fCIGroup.create({ data });
  }

  async update(id: string, data: Prisma.FCIGroupUpdateInput | Prisma.FCIGroupUncheckedUpdateInput) {
    return prisma.fCIGroup.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.fCIGroup as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.fCIGroup.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.fCIGroup as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.fCIGroup.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
