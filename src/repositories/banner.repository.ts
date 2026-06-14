import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class BannerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BannerWhereInput;
    orderBy?: Prisma.BannerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.banner.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.BannerWhereInput) {
    return prisma.banner.count({ where });
  }

  async findById(id: string) {
    return prisma.banner.findUnique({ where: { id } });
  }

  async create(data: Prisma.BannerCreateInput | Prisma.BannerUncheckedCreateInput) {
    return prisma.banner.create({ data });
  }

  async update(id: string, data: Prisma.BannerUpdateInput | Prisma.BannerUncheckedUpdateInput) {
    return prisma.banner.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.banner as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.banner.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.banner as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.banner.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
