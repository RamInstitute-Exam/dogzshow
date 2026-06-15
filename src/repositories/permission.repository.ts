import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PermissionRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PermissionWhereInput;
    orderBy?: Prisma.PermissionOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const finalWhere: Prisma.PermissionWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.permission.findMany({
      skip, take, where: finalWhere, orderBy
    });
  }

  async count(where?: Prisma.PermissionWhereInput) {
    const finalWhere: Prisma.PermissionWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.permission.count({ where: finalWhere });
  }

  async findById(id: string) {
    return prisma.permission.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async create(data: Prisma.PermissionCreateInput | Prisma.PermissionUncheckedCreateInput) {
    return prisma.permission.create({ data });
  }

  async update(id: string, data: Prisma.PermissionUpdateInput | Prisma.PermissionUncheckedUpdateInput) {
    return prisma.permission.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.permission as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.permission.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.permission as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.permission.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
