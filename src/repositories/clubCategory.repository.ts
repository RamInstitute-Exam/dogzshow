import prisma from '../prisma';

export class ClubCategoryRepository {
  async findAll(params: any) { return prisma.clubCategory.findMany(params); }
  async count(where?: any) { return prisma.clubCategory.count({ where }); }
  async findById(id: string) { return prisma.clubCategory.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.clubCategory.create({ data }); }
  async update(id: string, data: any) { return prisma.clubCategory.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.clubCategory.delete({ where: { id } }); }
  async bulkDelete(ids: string[]) { return prisma.clubCategory.deleteMany({ where: { id: { in: ids } } }); }
}
