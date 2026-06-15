import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class OwnerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OwnerWhereInput;
    orderBy?: Prisma.OwnerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.owner.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        _count: {
          select: { dogs: true }
        }
      }
    });
  }

  async count(where?: Prisma.OwnerWhereInput) {
    return prisma.owner.count({ where });
  }

  async findById(id: string) {
    return prisma.owner.findUnique({
      where: { id },
      include: { dogs: true }
    });
  }

  async create(data: Prisma.OwnerCreateInput) {
    return prisma.owner.create({ data });
  }

  async update(id: string, data: Prisma.OwnerUpdateInput) {
    return prisma.owner.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.owner.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    return prisma.owner.deleteMany({
      where: { id: { in: ids } }
    });
  }
}
