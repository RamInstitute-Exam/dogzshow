import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class BreederRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BreederWhereInput;
    orderBy?: Prisma.BreederOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.breeder.findMany({
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

  async count(where?: Prisma.BreederWhereInput) {
    return prisma.breeder.count({ where });
  }

  async findById(id: string) {
    return prisma.breeder.findUnique({
      where: { id },
      include: { dogs: true }
    });
  }

  async create(data: Prisma.BreederCreateInput) {
    return prisma.breeder.create({ data });
  }

  async update(id: string, data: Prisma.BreederUpdateInput) {
    return prisma.breeder.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.breeder.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    return prisma.breeder.deleteMany({
      where: { id: { in: ids } }
    });
  }
}
