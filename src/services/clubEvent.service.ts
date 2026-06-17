import { ClubEventRepository } from '../repositories/clubEvent.repository';

export class ClubEventService {
  private repository = new ClubEventRepository();

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    let where: any = {};
    if (query.clubId) where.clubId = query.clubId;
    
    const [data, total] = await Promise.all([
      this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
      this.repository.count(where)
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) { return this.repository.findById(id); }
  async create(data: any) { return this.repository.create(data); }
  async update(id: string, data: any) { return this.repository.update(id, data); }
  async delete(id: string) { return this.repository.delete(id); }
  async bulkDelete(ids: string[]) { return this.repository.bulkDelete(ids); }
}
