import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ReportRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.report.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.ReportWhereInput) {
    return prisma.report.count({ where });
  }

  async findById(id: string) {
    return prisma.report.findUnique({ where: { id } });
  }

  async create(data: Prisma.ReportCreateInput | Prisma.ReportUncheckedCreateInput) {
    return prisma.report.create({ data });
  }

  async update(id: string, data: Prisma.ReportUpdateInput | Prisma.ReportUncheckedUpdateInput) {
    return prisma.report.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.report as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.report.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.report as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.report.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
