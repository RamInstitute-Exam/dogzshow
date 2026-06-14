import { PageBannerRepository } from '../repositories/pageBanner.repository';
import prisma from '../prisma';

export class PageBannerService {
  private repository: PageBannerRepository;

  constructor() {
    this.repository = new PageBannerRepository();
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

  async getById(idOrSlug: string) {
    let item;
    
    // Check if it's a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    if (isUuid) {
      item = await this.repository.findById(idOrSlug);
    } else {
      // It's a slug
      item = await prisma.pageBanner.findUnique({
        where: { pageSlug: idOrSlug }
      });

      if (!item) {
        // Auto-seed if it's a valid slug so frontend doesn't 404
        const bannerImageMap: Record<string, string> = {
          about: '/images/about_banner.png',
          events: '/images/events_banner.png',
          contact: '/images/contact_banner.png',
          judges: '/images/judges_banner.png',
          winners: '/images/winners_banner.png',
          gallery: '/images/gallery_banner.png',
          registration: '/images/registration_banner.png'
        };
        const bannerImage = bannerImageMap[idOrSlug] || '/images/hero_banner.png';

        item = await prisma.pageBanner.create({
          data: {
            pageSlug: idOrSlug,
            title: idOrSlug.charAt(0).toUpperCase() + idOrSlug.slice(1).replace('-', ' '),
            bannerImage,
            isActive: true
          }
        });
      }
    }

    if (!item) throw new Error('PageBanner not found');
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
