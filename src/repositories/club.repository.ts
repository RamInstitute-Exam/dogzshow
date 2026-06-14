import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ClubRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.club.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.ClubWhereInput) {
    return prisma.club.count({ where });
  }

  async findById(id: string) {
    return prisma.club.findUnique({ where: { id } });
  }

  async create(data: Prisma.ClubCreateInput | Prisma.ClubUncheckedCreateInput) {
    return prisma.club.create({ data });
  }

  async update(id: string, data: Prisma.ClubUpdateInput | Prisma.ClubUncheckedUpdateInput) {
    return prisma.club.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.club as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.club.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.club as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.club.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
