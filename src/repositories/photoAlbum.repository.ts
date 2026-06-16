import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PhotoAlbumRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PhotoAlbumWhereInput;
    orderBy?: Prisma.PhotoAlbumOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.photoAlbum.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.PhotoAlbumWhereInput) {
    return prisma.photoAlbum.count({ where });
  }

  async findById(id: string) {
    return prisma.photoAlbum.findUnique({ where: { id } });
  }

  async create(data: Prisma.PhotoAlbumCreateInput | Prisma.PhotoAlbumUncheckedCreateInput) {
    return prisma.photoAlbum.create({ data });
  }

  async update(id: string, data: Prisma.PhotoAlbumUpdateInput | Prisma.PhotoAlbumUncheckedUpdateInput) {
    return prisma.photoAlbum.update({ where: { id }, data });
  }

  async delete(id: string) {
    try {
      return await (prisma.photoAlbum as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.photoAlbum.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.photoAlbum as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.photoAlbum.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
