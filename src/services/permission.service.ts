import { PermissionRepository } from '../repositories/permission.repository';

export class PermissionService {
  private repository: PermissionRepository;

  constructor() {
    this.repository = new PermissionRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      // basic fallback search implementation
      where.OR = [
        { name: { contains: query.search } },
        { title: { contains: query.search } }
      ].filter(x => Object.keys(x).length > 0);
    }

    try {
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
        this.repository.count(where)
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (e) {
      // Fallback for models without name/title fields
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit }),
        this.repository.count()
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
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
