import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class RoleRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.role.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.RoleWhereInput) {
    return prisma.role.count({ where });
  }

  async findById(id: string) {
    return prisma.role.findUnique({ where: { id } });
  }

  async create(data: Prisma.RoleCreateInput | Prisma.RoleUncheckedCreateInput) {
    return prisma.role.create({ data });
  }

  async update(id: string, data: Prisma.RoleUpdateInput | Prisma.RoleUncheckedUpdateInput) {
    return prisma.role.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.role as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.role.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.role as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.role.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
