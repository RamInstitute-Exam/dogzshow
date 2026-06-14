import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class EventGalleryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventGalleryWhereInput;
    orderBy?: Prisma.EventGalleryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.eventGallery.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.EventGalleryWhereInput) {
    return prisma.eventGallery.count({ where });
  }

  async findById(id: string) {
    return prisma.eventGallery.findUnique({ where: { id } });
  }

  async create(data: Prisma.EventGalleryCreateInput | Prisma.EventGalleryUncheckedCreateInput) {
    return prisma.eventGallery.create({ data });
  }

  async update(id: string, data: Prisma.EventGalleryUpdateInput | Prisma.EventGalleryUncheckedUpdateInput) {
    return prisma.eventGallery.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.eventGallery as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.eventGallery.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.eventGallery as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.eventGallery.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
