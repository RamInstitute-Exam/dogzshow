import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class CompetitionRoundRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CompetitionRoundWhereInput;
    orderBy?: Prisma.CompetitionRoundOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.competitionRound.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.CompetitionRoundWhereInput) {
    return prisma.competitionRound.count({ where });
  }

  async findById(id: string) {
    return prisma.competitionRound.findUnique({ where: { id } });
  }

  async create(data: Prisma.CompetitionRoundCreateInput | Prisma.CompetitionRoundUncheckedCreateInput) {
    return prisma.competitionRound.create({ data });
  }

  async update(id: string, data: Prisma.CompetitionRoundUpdateInput | Prisma.CompetitionRoundUncheckedUpdateInput) {
    return prisma.competitionRound.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.competitionRound as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.competitionRound.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.competitionRound as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.competitionRound.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
