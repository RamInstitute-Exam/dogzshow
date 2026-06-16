import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class VideoCategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.VideoCategoryWhereInput;
    orderBy?: Prisma.VideoCategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.videoCategory.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.VideoCategoryWhereInput) {
    return prisma.videoCategory.count({ where });
  }

  async findById(id: string) {
    return prisma.videoCategory.findUnique({ where: { id } });
  }

  async create(data: Prisma.VideoCategoryCreateInput | Prisma.VideoCategoryUncheckedCreateInput) {
    return prisma.videoCategory.create({ data });
  }

  async update(id: string, data: Prisma.VideoCategoryUpdateInput | Prisma.VideoCategoryUncheckedUpdateInput) {
    return prisma.videoCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    try {
      return await (prisma.videoCategory as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.videoCategory.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.videoCategory as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.videoCategory.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
