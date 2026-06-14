import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class TestimonialRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TestimonialWhereInput;
    orderBy?: Prisma.TestimonialOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.testimonial.findMany({
      skip, take, where, orderBy
    });
  }

  async count(where?: Prisma.TestimonialWhereInput) {
    return prisma.testimonial.count({ where });
  }

  async findById(id: string) {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  async create(data: Prisma.TestimonialCreateInput | Prisma.TestimonialUncheckedCreateInput) {
    return prisma.testimonial.create({ data });
  }

  async update(id: string, data: Prisma.TestimonialUpdateInput | Prisma.TestimonialUncheckedUpdateInput) {
    return prisma.testimonial.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {
      return await (prisma.testimonial as any).update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (e) {
      return prisma.testimonial.delete({ where: { id } });
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      return await (prisma.testimonial as any).updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } catch(e) {
      return prisma.testimonial.deleteMany({
        where: { id: { in: ids } }
      });
    }
  }
}
