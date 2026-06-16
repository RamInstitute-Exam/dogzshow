import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class HeroBannerRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HeroBannerWhereInput;
    orderBy?: Prisma.HeroBannerOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.heroBanner.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async count(where?: Prisma.HeroBannerWhereInput) {
    return prisma.heroBanner.count({ where });
  }

  async findById(id: string) {
    return prisma.heroBanner.findUnique({ where: { id } });
  }

  async create(data: Prisma.HeroBannerCreateInput | Prisma.HeroBannerUncheckedCreateInput) {
    return prisma.heroBanner.create({ data });
  }

  async update(id: string, data: Prisma.HeroBannerUpdateInput | Prisma.HeroBannerUncheckedUpdateInput) {
    return prisma.heroBanner.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.heroBanner.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    return prisma.heroBanner.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
