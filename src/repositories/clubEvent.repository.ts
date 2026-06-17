import prisma from '../prisma';

export class ClubEventRepository {
  async findAll(params: any) { return prisma.clubEvent.findMany(params); }
  async count(where?: any) { return prisma.clubEvent.count({ where }); }
  async findById(id: string) { return prisma.clubEvent.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.clubEvent.create({ data }); }
  async update(id: string, data: any) { return prisma.clubEvent.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.clubEvent.delete({ where: { id } }); }
  async bulkDelete(ids: string[]) { return prisma.clubEvent.deleteMany({ where: { id: { in: ids } } }); }
}
