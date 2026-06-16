import { JudgeRepository } from '../repositories/judge.repository';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

export class JudgeService {
  private repository: JudgeRepository;

  constructor() {
    this.repository = new JudgeRepository();
  }

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { city: { contains: query.search } },
        { state: { contains: query.search } }
      ].filter(x => Object.keys(x).length > 0);
    }

    if (query.status) {
      where.status = query.status;
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
    if (!item) throw new Error('Judge not found');
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

          let firstName = data.name || 'Judge';
          let lastName = '';
          if (data.name && data.name.includes(' ')) {
            const parts = data.name.split(' ');
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
              isActive: data.status === 'ACTIVE' || data.status === true,
              mobileVerified: true,
              termsAccepted: true,
              privacyAccepted: true,
            }
          });

          const role = await prisma.role.findFirst({
            where: {
              OR: [
                { name: { equals: 'Judge', mode: 'insensitive' } },
                { name: { equals: 'JUDGE', mode: 'insensitive' } }
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
        console.error('Failed to auto-create user credentials for Judge:', error);
      }
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const judgeData = {
      name: data.name,
      slug: slug,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      dob: data.dob,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      experience: String(data.experience || ''),
      specialization: data.specialization || data.credentials,
      certifications: data.certifications || data.qualifications,
      qualifications: data.certifications || data.qualifications,
      bio: data.bio,
      photoUrl: data.photoUrl,
      credentials: data.specialization || data.credentials,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      status: data.status || 'ACTIVE'
    };

    return await this.repository.create(judgeData);
  }

  async update(id: string, data: any) {
    const updatedJudge = await this.repository.update(id, data);
    
    if (updatedJudge.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: updatedJudge.email }
        });
        if (user) {
          let firstName = updatedJudge.name || 'Judge';
          let lastName = '';
          if (updatedJudge.name && updatedJudge.name.includes(' ')) {
            const parts = updatedJudge.name.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }
          await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName,
              lastName,
              phone: updatedJudge.phone || undefined,
              isActive: updatedJudge.status === 'ACTIVE'
            }
          });
        }
      } catch (e) {
        console.error('Failed to sync judge update to User:', e);
      }
    }
    return updatedJudge;
  }

  async delete(id: string) {
    const judge = await this.repository.findById(id);
    const result = await this.repository.delete(id);
    if (judge && judge.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: judge.email }
        });
        if (user) {
          await prisma.user.delete({
            where: { id: user.id }
          });
        }
      } catch (e) {
        console.error('Failed to delete associated user for judge:', e);
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

  async bulkImport(replaceExisting: boolean, judges: any[]) {
    if (replaceExisting) {
      // First, get all existing judges to delete their users
      const existingJudges = await prisma.judge.findMany();
      const emails = existingJudges.map(j => j.email).filter(Boolean) as string[];
      if (emails.length > 0) {
        await prisma.user.deleteMany({
          where: { email: { in: emails } }
        });
      }
      // Then truncate the judges table
      await prisma.judge.deleteMany({});
    }

    let imported = 0;
    let failed = 0;

    for (const data of judges) {
      try {
        await this.create(data);
        imported++;
      } catch (error) {
        console.error('Failed to import judge:', data.email, error);
        failed++;
      }
    }

    return {
      success: true,
      existingDeleted: replaceExisting,
      totalImported: imported,
      failed: failed,
      message: `${imported} judges imported successfully.`
    };
  }

  async updatePhotoUrl(id: string, photoUrl: string) {
    const updatedJudge = await this.repository.update(id, { photoUrl });
    return updatedJudge;
  }

  async getBySlug(slug: string) {
    const item = await prisma.judge.findUnique({
      where: { slug }
    });
    return item;
  }
}
