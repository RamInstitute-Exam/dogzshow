import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PhotoCategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PhotoCategoryWhereInput;
    orderBy?: Prisma.PhotoCategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.photoCategory.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.PhotoCategoryWhereInput) {
    return prisma.photoCategory.count({ where });
  }

  async findById(id: string) {
    return prisma.photoCategory.findUnique({ where: { id } });
  }

  async create(data: Prisma.PhotoCategoryCreateInput | Prisma.PhotoCategoryUncheckedCreateInput) {
    return prisma.photoCategory.create({ data });
  }

  async update(id: string, data: Prisma.PhotoCategoryUpdateInput | Prisma.PhotoCategoryUncheckedUpdateInput) {
    return prisma.photoCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    try {
      return await (prisma.photoCategory as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.photoCategory.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.photoCategory as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.photoCategory.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
