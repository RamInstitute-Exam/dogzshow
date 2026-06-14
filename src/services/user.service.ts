import { UserRepository } from '../repositories/user.repository';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../prisma';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getAllUsers(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';
    const status = query.status;
    const roleId = query.roleId;

    let where: Prisma.UserWhereInput = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    if (status) {
      where.isActive = status === 'ACTIVE';
    }

    if (roleId) {
      where.roles = { some: { roleId } };
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

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user || user.deletedAt) {
      throw new Error('User not found or deleted');
    }
    return user;
  }

  async createUser(data: any, adminId?: string) {
    const { email, password, firstName, lastName, phone, roleId, ...otherData } = data;
    
    if (email) {
      const existing = await this.repository.findByEmail(email);
      if (existing) throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password || 'JuzDog@2026', 10);

    const payload: Prisma.UserCreateInput = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      ...otherData
    };

    if (roleId) {
      payload.roles = { create: { roleId } };
    }

    const newUser = await this.repository.create(payload);

    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'CREATE_USER', entity: 'USER', entityId: newUser.id, details: { email } }
      });
    }

    return newUser;
  }

  async updateUser(id: string, data: any, adminId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('User not found');

    const { roleId, password, ...updateData } = data;
    const payload: any = { ...updateData };

    if (password) {
      payload.password = await bcrypt.hash(password, 10);
    }

    // Since we are overriding completely, handle role update separately
    if (roleId) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({ data: { userId: id, roleId } });
    }

    const updated = await this.repository.update(id, payload);

    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'UPDATE_USER', entity: 'USER', entityId: id, details: updateData }
      });
    }

    return updated;
  }

  async deleteUser(id: string, adminId?: string) {
    const deleted = await this.repository.softDelete(id);
    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'DELETE_USER', entity: 'USER', entityId: id }
      });
    }
    return deleted;
  }

  async restoreUser(id: string, adminId?: string) {
    const restored = await this.repository.restore(id);
    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'RESTORE_USER', entity: 'USER', entityId: id }
      });
    }
    return restored;
  }

  async bulkDeleteUsers(ids: string[], adminId?: string) {
    const result = await this.repository.bulkSoftDelete(ids);
    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'BULK_DELETE_USER', entity: 'USER', details: { ids } }
      });
    }
    return result;
  }

  async bulkUpdateUsers(ids: string[], data: any, adminId?: string) {
    const result = await this.repository.bulkUpdate(ids, data);
    if (adminId) {
      await prisma.auditLog.create({
        data: { userId: adminId, action: 'BULK_UPDATE_USER', entity: 'USER', details: { ids, data } }
      });
    }
    return result;
  }
}
