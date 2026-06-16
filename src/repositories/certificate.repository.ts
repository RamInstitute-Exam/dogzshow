import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class CertificateRepository {
  async findAll(params: { skip?: number; take?: number; where?: Prisma.KCICertificateWhereInput; orderBy?: Prisma.KCICertificateOrderByWithRelationInput; include?: Prisma.KCICertificateInclude }) {
    return prisma.kCICertificate.findMany(params);
  }

  async count(where?: Prisma.KCICertificateWhereInput) {
    return prisma.kCICertificate.count({ where });
  }

  async findById(id: string) {
    return prisma.kCICertificate.findUnique({
      where: { id },
      include: { dog: { include: { ownerUser: true, breed: true } } }
    });
  }

  async create(data: Prisma.KCICertificateCreateInput) {
    return prisma.kCICertificate.create({ data });
  }

  async update(id: string, data: Prisma.KCICertificateUpdateInput) {
    return prisma.kCICertificate.update({ where: { id }, data });
  }

  async upsert(dogId: string, url: string, ocrConfidence?: number, extractedData?: any) {
    return prisma.kCICertificate.upsert({
      where: { dogId },
      update: { url, ocrConfidence, extractedData, status: 'PENDING' },
      create: { dog: { connect: { id: dogId } }, url, ocrConfidence, extractedData, status: 'PENDING' }
    });
  }
}
