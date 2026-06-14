import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        roles: { include: { role: true } },
        _count: { select: { dogsOwned: true, eventRegistrations: true } }
      }
    });
  }

  async count(where?: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        dogsOwned: true,
        eventRegistrations: { include: { event: true } }
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { roles: { include: { role: true } } }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { role: true } } }
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }

  async restore(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: null, isActive: true }
    });
  }

  async hardDelete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async bulkSoftDelete(ids: string[]) {
    return prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date(), isActive: false }
    });
  }

  async bulkUpdate(ids: string[], data: Prisma.UserUpdateInput) {
    return prisma.user.updateMany({
      where: { id: { in: ids } },
      data
    });
  }
}
