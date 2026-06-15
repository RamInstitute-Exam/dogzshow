import { PermissionRepository } from '../repositories/permission.repository';
import prisma from '../prisma';

export class PermissionService {
  private repository: PermissionRepository;

  constructor() {
    this.repository = new PermissionRepository();
  }

  private async ensurePermissionsSeeded() {
    const count = await this.repository.count();
    if (count === 0) {
      const modules = [
        'users', 'roles', 'permissions', 'dogs', 'owners', 'breeds', 'fci-groups', 
        'show-classes', 'clubs', 'judges', 'events', 'registrations', 'payments', 
        'winners', 'banners', 'cms', 'gallery', 'videos', 'faqs', 'blogs', 
        'notifications', 'reports', 'support-tickets', 'downloads', 'settings'
      ];
      const actions = ['view', 'create', 'edit', 'delete', 'export', 'approve'];
      const dataToCreate = [];
      for (const mod of modules) {
        for (const act of actions) {
          dataToCreate.push({
            name: `${mod}:${act}`,
            description: `Can ${act} ${mod}`
          });
        }
      }
      await prisma.permission.createMany({
        data: dataToCreate
      });
    }
  }

  async getAll(query: any) {
    await this.ensurePermissionsSeeded();

    let where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } }
      ];
    }

    if (query.all === 'true' || query.limit === 'all') {
      const data = await this.repository.findAll({ where });
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const [data, total] = await Promise.all([
      this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
      this.repository.count(where)
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Permission not found');
    return item;
  }

  async create(data: any) {
    return await this.repository.create(data);
  }

  async update(id: string, data: any) {
    return await this.repository.update(id, data);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

  async bulkDelete(ids: string[]) {
    return await this.repository.bulkDelete(ids);
  }
}
