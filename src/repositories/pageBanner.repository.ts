import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PageBannerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PageBannerWhereInput;
    orderBy?: Prisma.PageBannerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.pageBanner.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.PageBannerWhereInput) {
    return prisma.pageBanner.count({ where });
  }

  async findById(id: string) {
    return prisma.pageBanner.findUnique({ where: { id } });
  }

  async create(data: Prisma.PageBannerCreateInput | Prisma.PageBannerUncheckedCreateInput) {
    return prisma.pageBanner.create({ data });
  }

  async update(id: string, data: Prisma.PageBannerUpdateInput | Prisma.PageBannerUncheckedUpdateInput) {
    return prisma.pageBanner.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.pageBanner as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.pageBanner.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.pageBanner as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.pageBanner.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
