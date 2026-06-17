import prisma from '../prisma';

export class ClubCommitteeRepository {
  async findAll(params: any) { return prisma.clubCommittee.findMany(params); }
  async count(where?: any) { return prisma.clubCommittee.count({ where }); }
  async findById(id: string) { return prisma.clubCommittee.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.clubCommittee.create({ data }); }
  async update(id: string, data: any) { return prisma.clubCommittee.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.clubCommittee.delete({ where: { id } }); }
  async bulkDelete(ids: string[]) { return prisma.clubCommittee.deleteMany({ where: { id: { in: ids } } }); }
}
