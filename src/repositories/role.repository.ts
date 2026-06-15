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
    const finalWhere: Prisma.RoleWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.role.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: orderBy || { priority: 'desc' },
      include: {
        _count: {
          select: { users: true }
        },
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async count(where?: Prisma.RoleWhereInput) {
    const finalWhere: Prisma.RoleWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.role.count({ where: finalWhere });
  }

  async findById(id: string) {
    return prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
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
