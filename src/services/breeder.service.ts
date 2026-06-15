import { BreederRepository } from '../repositories/breeder.repository';

export class BreederService {
  private repository: BreederRepository;

  constructor() {
    this.repository = new BreederRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { kennelName: { contains: query.search } },
        { country: { contains: query.search } }
      ];
    }

    if (query.all === 'true' || query.limit === 'all') {
      const data = await this.repository.findAll({ where });
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
      this.repository.count(where)
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Breeder not found');
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
