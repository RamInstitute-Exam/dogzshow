import { CertificateRepository } from '../repositories/certificate.repository';
import prisma from '../prisma';

const repository = new CertificateRepository();

export class CertificateService {
  async getUserCertificates(userId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    const where = {
      dog: { userOwnerId: userId }
    };

    const [data, total] = await Promise.all([
      repository.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        include: { dog: { include: { breed: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      repository.count(where)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAdminCertificates(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const status = query.status;

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      repository.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        include: { dog: { include: { ownerUser: true, breed: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      repository.count(where)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async verifyCertificate(id: string, status: string, adminId: string, kciNumber?: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status');
    }

    const cert = await repository.findById(id);
    if (!cert) throw new Error('Certificate not found');

    const updatedCert = await repository.update(id, { status });

    // If approved, update the Dog record with the verified KCI Number
    if (status === 'APPROVED' && kciNumber) {
      await prisma.dog.update({
        where: { id: cert.dogId },
        data: { kciNumber }
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'VERIFY_KCI_CERTIFICATE',
        entity: 'KCI_CERTIFICATE',
        entityId: id,
        details: { status, kciNumber }
      }
    });

    return updatedCert;
  }
}
