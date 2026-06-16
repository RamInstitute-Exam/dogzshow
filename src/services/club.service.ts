import { ClubRepository } from '../repositories/club.repository';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

export class ClubService {
  private repository: ClubRepository;

  constructor() {
    this.repository = new ClubRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { president: { contains: query.search } },
        { city: { contains: query.search } }
      ].filter(x => Object.keys(x).length > 0);
    }

    if (query.status) {
      const isStatusActive = query.status === 'ACTIVE' || query.status === 'true';
      where.isActive = isStatusActive;
    }

    if (query.isFeatured) {
      where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    try {
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
        this.repository.count(where)
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (e) {
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit }),
        this.repository.count()
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Club not found');
    return item;
  }

  async create(data: any) {
    if (data.email) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });
        if (!existingUser) {
          const saltRounds = 12;
          const plainPassword = data.password || 'welcome123';
          const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

          let firstName = data.president || data.name || 'Club';
          let lastName = 'Admin';
          if (data.president && data.president.includes(' ')) {
            const parts = data.president.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }

          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: hashedPassword,
              firstName: firstName,
              lastName: lastName,
              phone: data.phone || null,
              isActive: data.isActive === true || data.isActive === 'true' || data.isActive === 'ACTIVE',
              mobileVerified: true,
              termsAccepted: true,
              privacyAccepted: true,
            }
          });

          const role = await prisma.role.findFirst({
            where: {
              OR: [
                { name: { equals: 'Club Admin', mode: 'insensitive' } },
                { name: { equals: 'CLUB', mode: 'insensitive' } }
              ]
            }
          });

          if (role) {
            await prisma.userRole.create({
              data: {
                userId: user.id,
                roleId: role.id
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to auto-create user credentials for Club:', error);
      }
    }

    const clubData = {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      president: data.president,
      secretary: data.secretary,
      email: data.email,
      phone: data.phone,
      website: data.website,
      facebook: data.facebook,
      instagram: data.instagram,
      description: data.description,
      registrationNumber: data.registrationNumber,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      isActive: data.isActive === true || data.isActive === 'true' || data.isActive === 'ACTIVE'
    };

    return await this.repository.create(clubData);
  }

  async update(id: string, data: any) {
    const updatedClub = await this.repository.update(id, data);
    
    if (updatedClub.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: updatedClub.email }
        });
        if (user) {
          let firstName = updatedClub.president || updatedClub.name || 'Club';
          let lastName = 'Admin';
          if (updatedClub.president && updatedClub.president.includes(' ')) {
            const parts = updatedClub.president.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }
          await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName,
              lastName,
              phone: updatedClub.phone || undefined,
              isActive: updatedClub.isActive
            }
          });
        }
      } catch (e) {
        console.error('Failed to sync club update to User:', e);
      }
    }
    return updatedClub;
  }

  async delete(id: string) {
    const club = await this.repository.findById(id);
    const result = await this.repository.delete(id);
    if (club && club.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: club.email }
        });
        if (user) {
          await prisma.user.delete({
            where: { id: user.id }
          });
        }
      } catch (e) {
        console.error('Failed to delete associated user for club:', e);
      }
    }
    return result;
  }

  async bulkDelete(ids: string[]) {
    for (const id of ids) {
      await this.delete(id);
    }
    return { success: true };
  }

  async getBySlug(slug: string) {
    const item = await prisma.club.findUnique({
      where: { slug }
    });
    return item;
  }

  async bulkUpload(items: any[]) {
    // Delete all existing clubs to replace with new panel
    await prisma.club.deleteMany();
    
    // Also cleanup existing club user accounts if needed, but for now just clear clubs
    
    const createdClubs = [];
    for (const item of items) {
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const created = await this.create({
        ...item,
        slug
      });
      createdClubs.push(created);
    }
    return createdClubs;
  }
}
