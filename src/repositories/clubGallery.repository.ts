import prisma from '../prisma';

export class ClubGalleryRepository {
  async findAll(params: any) { return prisma.clubGallery.findMany(params); }
  async count(where?: any) { return prisma.clubGallery.count({ where }); }
  async findById(id: string) { return prisma.clubGallery.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.clubGallery.create({ data }); }
  async update(id: string, data: any) { return prisma.clubGallery.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.clubGallery.delete({ where: { id } }); }
  async bulkDelete(ids: string[]) { return prisma.clubGallery.deleteMany({ where: { id: { in: ids } } }); }
}
