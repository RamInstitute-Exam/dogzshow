import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class BreedRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BreedWhereInput;
    orderBy?: Prisma.BreedOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.breed.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.BreedWhereInput) {
    return prisma.breed.count({ where });
  }

  async findById(id: string) {
    return prisma.breed.findUnique({ where: { id } });
  }

  async create(data: Prisma.BreedCreateInput | Prisma.BreedUncheckedCreateInput) {
    return prisma.breed.create({ data });
  }

  async update(id: string, data: Prisma.BreedUpdateInput | Prisma.BreedUncheckedUpdateInput) {
    return prisma.breed.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.breed as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.breed.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.breed as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.breed.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
