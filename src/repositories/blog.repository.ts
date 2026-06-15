import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class BlogRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BlogWhereInput;
    orderBy?: Prisma.BlogOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const finalWhere: Prisma.BlogWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.blog.findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: orderBy || { createdAt: 'desc' }
    });
  }

  async count(where?: Prisma.BlogWhereInput) {
    const finalWhere: Prisma.BlogWhereInput = {
      deletedAt: null,
      ...where
    };
    return prisma.blog.count({ where: finalWhere });
  }

  async findById(id: string) {
    return prisma.blog.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async findBySlug(slug: string) {
    return prisma.blog.findFirst({
      where: { slug, deletedAt: null }
    });
  }

  async create(data: Prisma.BlogCreateInput) {
    return prisma.blog.create({ data });
  }

  async update(id: string, data: Prisma.BlogUpdateInput) {
    return prisma.blog.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }

  async bulkDelete(ids: string[]) {
    return prisma.blog.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}
