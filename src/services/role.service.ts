import { RoleRepository } from '../repositories/role.repository';
import prisma from '../prisma';

export class RoleService {
  private repository: RoleRepository;

  constructor() {
    this.repository = new RoleRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { displayName: { contains: query.search } },
        { description: { contains: query.search } }
      ];
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
      this.repository.count(where)
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Role not found');
    return item;
  }

  async create(data: any) {
    const { permissions, ...roleData } = data;
    const role = await this.repository.create(roleData);
    
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permId: string) => ({
          roleId: role.id,
          permissionId: permId
        }))
      });
    }
    
    return this.getById(role.id);
  }

  async update(id: string, data: any) {
    const { permissions, ...roleData } = data;
    const role = await this.repository.update(id, roleData);
    
    if (permissions && Array.isArray(permissions)) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });
      if (permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissions.map((permId: string) => ({
            roleId: id,
            permissionId: permId
          }))
        });
      }
    }
    
    return this.getById(id);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

  async bulkDelete(ids: string[]) {
    return await this.repository.bulkDelete(ids);
  }
}
