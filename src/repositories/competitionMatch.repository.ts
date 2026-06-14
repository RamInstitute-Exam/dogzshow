import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class CompetitionMatchRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CompetitionMatchWhereInput;
    orderBy?: Prisma.CompetitionMatchOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.competitionMatch.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.CompetitionMatchWhereInput) {
    return prisma.competitionMatch.count({ where });
  }

  async findById(id: string) {
    return prisma.competitionMatch.findUnique({ where: { id } });
  }

  async create(data: Prisma.CompetitionMatchCreateInput | Prisma.CompetitionMatchUncheckedCreateInput) {
    return prisma.competitionMatch.create({ data });
  }

  async update(id: string, data: Prisma.CompetitionMatchUpdateInput | Prisma.CompetitionMatchUncheckedUpdateInput) {
    return prisma.competitionMatch.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.competitionMatch as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.competitionMatch.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.competitionMatch as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.competitionMatch.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
