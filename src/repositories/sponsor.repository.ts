import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class SponsorRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SponsorWhereInput;
    orderBy?: Prisma.SponsorOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.sponsor.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.SponsorWhereInput) {
    return prisma.sponsor.count({ where });
  }

  async findById(id: string) {
    return prisma.sponsor.findUnique({ where: { id } });
  }

  async create(data: Prisma.SponsorCreateInput | Prisma.SponsorUncheckedCreateInput) {
    return prisma.sponsor.create({ data });
  }

  async update(id: string, data: Prisma.SponsorUpdateInput | Prisma.SponsorUncheckedUpdateInput) {
    return prisma.sponsor.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.sponsor as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.sponsor.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.sponsor as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.sponsor.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
