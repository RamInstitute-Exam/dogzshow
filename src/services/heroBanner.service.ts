import { HeroBannerRepository } from '../repositories/heroBanner.repository';
import prisma from '../prisma';

export class HeroBannerService {
  private repository: HeroBannerRepository;

  constructor() {
    this.repository = new HeroBannerRepository();
  }

  // Fetch banners for homepage display (public view)
  async getActiveBanners() {
    const now = new Date();
    
    // Query active banners within scheduling date range
    const banners = await this.repository.findAll({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { gte: now },
          },
          {
            startDate: { lte: now },
            endDate: { gte: now },
          }
        ]
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    if (banners.length > 0) {
      return banners;
    }

    // Fallback to 5 default sample banners if no banners exist
    return [
      {
        id: 'default-1',
        title: 'Luxury Doberman Pinscher',
        subtitle: 'Experience the grace, strength, and intelligence of elite Dobermans.',
        desktopImage: '/images/banners/doberman_championship.png',
        mobileImage: '/images/banners/doberman_championship.png',
        buttonText: 'Explore Breed',
        buttonLink: '/groups',
        displayOrder: 1,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: now,
      },
      {
        id: 'default-2',
        title: 'Luxury Golden Retriever',
        subtitle: 'Meet the loyal, affectionate, and intelligent family companions.',
        desktopImage: '/images/banners/golden_retriever_championship.png',
        mobileImage: '/images/banners/golden_retriever_championship.png',
        buttonText: 'View Profiles',
        buttonLink: '/dogs',
        displayOrder: 2,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: now,
      },
      {
        id: 'default-3',
        title: 'Luxury Siberian Husky',
        subtitle: 'Explore the striking beauty and energetic spirit of the Arctic husky.',
        desktopImage: '/images/banners/husky_championship.png',
        mobileImage: '/images/banners/husky_championship.png',
        buttonText: 'Show Winners',
        buttonLink: '/winners',
        displayOrder: 3,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: now,
      },
      {
        id: 'default-4',
        title: 'Upcoming Dog Shows & Events',
        subtitle: 'Register your champion dogs for the prestigious national and international championships.',
        desktopImage: '/images/banners/german_shepherd_championship.png',
        mobileImage: '/images/banners/german_shepherd_championship.png',
        buttonText: 'Register Now',
        buttonLink: '/events',
        displayOrder: 4,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: now,
      },
      {
        id: 'default-5',
        title: 'Celebrating JuzDog Champions',
        subtitle: 'A hall of fame dedicated to the most decorated show dogs in the country.',
        desktopImage: '/images/banners/rottweiler_championship.png',
        mobileImage: '/images/banners/rottweiler_championship.png',
        buttonText: 'View Hall of Fame',
        buttonLink: '/winners',
        displayOrder: 5,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: now,
      }
    ];
  }

  // Get all banners with pagination and search for admin management
  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { subtitle: { contains: query.search } }
      ];
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { displayOrder: 'asc' }
      }),
      this.repository.count(where)
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Hero banner not found');
    return item;
  }

  async create(data: any) {
    // If displayOrder is not set, find the maximum displayOrder and add 1
    if (data.displayOrder === undefined || data.displayOrder === null) {
      const maxBanner = await prisma.heroBanner.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      });
      data.displayOrder = maxBanner ? maxBanner.displayOrder + 1 : 1;
    }
    
    // Parse date fields if they are strings
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    return await this.repository.create(data);
  }

  async update(id: string, data: any) {
    // Parse date fields if they are strings
    if (data.startDate !== undefined) {
      data.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      data.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    return await this.repository.update(id, data);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

  async bulkDelete(ids: string[]) {
    return await this.repository.bulkDelete(ids);
  }

  async reorder(orders: { id: string; displayOrder: number }[]) {
    return await prisma.$transaction(
      orders.map((o) =>
        prisma.heroBanner.update({
          where: { id: o.id },
          data: { displayOrder: o.displayOrder }
        })
      )
    );
  }
}
