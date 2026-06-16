import { DogRepository } from '../repositories/dog.repository';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';

export class DogService {
  private repository: DogRepository;

  constructor() {
    this.repository = new DogRepository();
  }

  async getAllDogs(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';
    
    let where: Prisma.DogWhereInput = { deletedAt: null };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { kciNumber: { contains: search } },
        { microchipNumber: { contains: search } },
        { micNumber: { contains: search } }
      ];
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      this.repository.count(where)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getDogById(id: string) {
    const dog = await this.repository.findById(id);
    if (!dog || dog.deletedAt) {
      throw new Error('Dog not found or deleted');
    }
    return dog;
  }

  async createDog(data: any, userOwnerId: string) {
    // Duplicate validations
    if (data.kciNumber) {
      const existing = await this.repository.findByKci(data.kciNumber);
      if (existing) throw new Error('KCI Number already exists');
    }
    
    if (data.micNumber) {
      const existing = await this.repository.findByMic(data.micNumber);
      if (existing) throw new Error('MIC Number already exists');
    }

    // Prepare create payload using a transaction-like boundary handled safely by prisma relations
    // We will extract owner/breeder if passed
    let ownerConnectOrCreate = undefined;
    if (data.owner) {
      ownerConnectOrCreate = {
        create: {
          name: data.owner.name,
          email: data.owner.email,
          phone: data.owner.phone
        }
      };
    }

    let breederConnectOrCreate = undefined;
    if (data.breeder) {
      breederConnectOrCreate = {
        create: {
          name: data.breeder.name,
          kennelName: data.breeder.kennelName,
          phone: data.breeder.phone
        }
      };
    }

    const payload: Prisma.DogCreateInput = {
      name: data.name,
      breed: { connect: { id: data.breedId } },
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      color: data.color,
      markings: data.markings,
      kciNumber: data.kciNumber,
      microchipNumber: data.microchipNumber,
      micNumber: data.micNumber,
      weight: data.weight ? parseFloat(data.weight) : null,
      height: data.height ? parseFloat(data.height) : null,
      isImported: data.isImported || false,
      countryOfOrigin: data.countryOfOrigin,
      isChampion: data.isChampion || false,
      ownerUser: { connect: { id: userOwnerId } }
    };

    if (ownerConnectOrCreate) payload.owner = ownerConnectOrCreate;
    if (breederConnectOrCreate) payload.breeder = breederConnectOrCreate;

    if (data.certificateFrontUrl) {
      payload.kciCertificate = {
        create: {
          url: data.certificateFrontUrl,
          status: 'PENDING'
        }
      };
    }

    const newDog = await this.repository.create(payload);

    // Audit Log Creation
    await prisma.activityLog.create({
      data: {
        userId: userOwnerId,
        action: 'DOG_CREATED',
        description: `Created dog profile for ${newDog.name}`
      }
    });

    return newDog;
  }

  async updateDog(id: string, data: any, userId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Dog not found');

    const updated = await this.repository.update(id, data);
    
    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_DOG',
        entity: 'DOG',
        entityId: id,
        details: data
      }
    });

    return updated;
  }

  async deleteDog(id: string, userId: string) {
    const deleted = await this.repository.softDelete(id);
    
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DOG_DELETED',
        description: `Deleted dog profile with ID ${id}`
      }
    });

    return deleted;
  }

  async restoreDog(id: string, userId: string) {
    const restored = await this.repository.restore(id);
    await prisma.activityLog.create({
      data: { userId, action: 'DOG_RESTORED', description: `Restored dog profile with ID ${id}` }
    });
    return restored;
  }

  async bulkDeleteDogs(ids: string[], userId: string) {
    const result = await this.repository.bulkSoftDelete(ids);
    await prisma.activityLog.create({
      data: { userId, action: 'DOG_BULK_DELETED', description: `Bulk deleted dogs: ${ids.join(', ')}` }
    });
    return result;
  }

  async bulkUpdateDogs(ids: string[], data: any, userId: string) {
    const result = await this.repository.bulkUpdate(ids, data);
    await prisma.activityLog.create({
      data: { userId, action: 'DOG_BULK_UPDATED', description: `Bulk updated dogs: ${ids.join(', ')}` }
    });
    return result;
  }
}
