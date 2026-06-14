import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class DogRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DogWhereInput;
    orderBy?: Prisma.DogOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.dog.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        breed: true,
        photos: true,
        owner: true,
        breeder: true,
        kciCertificate: true,
        _count: { select: { registrations: true, winnerTags: true } }
      }
    });
  }

  async count(where?: Prisma.DogWhereInput) {
    return prisma.dog.count({ where });
  }

  async findById(id: string) {
    return prisma.dog.findUnique({
      where: { id },
      include: {
        breed: true,
        photos: true,
        owner: true,
        breeder: true,
        kciCertificate: true,
        winnerTags: true,
        registrations: { include: { event: true, category: true } }
      }
    });
  }

  async findByKci(kciNumber: string) {
    return prisma.dog.findUnique({ where: { kciNumber } });
  }

  async findByMic(micNumber: string) {
    return prisma.dog.findUnique({ where: { micNumber } });
  }

  async create(data: Prisma.DogCreateInput) {
    return prisma.dog.create({
      data,
      include: { breed: true, owner: true, breeder: true }
    });
  }

  async update(id: string, data: Prisma.DogUpdateInput) {
    return prisma.dog.update({
      where: { id },
      data,
      include: { breed: true, owner: true, breeder: true }
    });
  }

  async softDelete(id: string) {
    return prisma.dog.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async restore(id: string) {
    return prisma.dog.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async hardDelete(id: string) {
    return prisma.dog.delete({ where: { id } });
  }

  async bulkSoftDelete(ids: string[]) {
    return prisma.dog.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
  }

  async bulkUpdate(ids: string[], data: Prisma.DogUpdateInput) {
    return prisma.dog.updateMany({
      where: { id: { in: ids } },
      data
    });
  }
}
