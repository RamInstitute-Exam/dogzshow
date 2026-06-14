import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class HomepageBannerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HomepageBannerWhereInput;
    orderBy?: Prisma.HomepageBannerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.homepageBanner.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.HomepageBannerWhereInput) {
    return prisma.homepageBanner.count({ where });
  }

  async findById(id: string) {
    return prisma.homepageBanner.findUnique({ where: { id } });
  }

  async create(data: Prisma.HomepageBannerCreateInput | Prisma.HomepageBannerUncheckedCreateInput) {
    return prisma.homepageBanner.create({ data });
  }

  async update(id: string, data: Prisma.HomepageBannerUpdateInput | Prisma.HomepageBannerUncheckedUpdateInput) {
    return prisma.homepageBanner.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.homepageBanner as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.homepageBanner.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.homepageBanner as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.homepageBanner.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
