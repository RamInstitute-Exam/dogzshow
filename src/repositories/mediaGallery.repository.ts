import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class MediaGalleryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MediaGalleryWhereInput;
    orderBy?: Prisma.MediaGalleryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.mediaGallery.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.MediaGalleryWhereInput) {
    return prisma.mediaGallery.count({ where });
  }

  async findById(id: string) {
    return prisma.mediaGallery.findUnique({ where: { id } });
  }

  async create(data: Prisma.MediaGalleryCreateInput | Prisma.MediaGalleryUncheckedCreateInput) {
    return prisma.mediaGallery.create({ data });
  }

  async update(id: string, data: Prisma.MediaGalleryUpdateInput | Prisma.MediaGalleryUncheckedUpdateInput) {
    return prisma.mediaGallery.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.mediaGallery as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.mediaGallery.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.mediaGallery as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.mediaGallery.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
