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

    if (query.specialization) {
      where.specialization = { contains: query.specialization, mode: 'insensitive' };
    }

    if (query.experience) {
      where.experience = { contains: query.experience, mode: 'insensitive' };
    }

    if (query.category) {
      where.certifications = { contains: query.category, mode: 'insensitive' };
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

    const slug = data.slug || (data.name || data.fullName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const judgeData = {
      name: data.fullName || data.name,
      slug: slug,
      email: data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null,
      phone: data.phone || null,
      mobile: data.mobile || null,
      gender: data.gender || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'India',
      zipcode: data.zipcode || null,
      experience: String(data.experience || ''),
      specialization: data.specialization || data.description || data.credentials,
      certifications: data.certifications || data.qualifications,
      qualifications: data.certifications || data.qualifications,
      bio: data.biography || data.bio,
      photoUrl: data.profileImage || data.photoUrl,
      credentials: data.specialization || data.description || data.credentials,
      seoTitle: data.seoTitle || `${data.fullName || data.name} | KCI Judge`,
      seoDescription: data.seoDescription,
      isFeatured: data.featured === true || data.isFeatured === true || data.featured === 'true',
      status: data.status || 'ACTIVE'
    };

    return await this.repository.create(judgeData);
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.email === '') updateData.email = null;
    delete updateData.dob;
    delete updateData.zipCode;
    
    const updatedJudge = await this.repository.update(id, updateData);
    
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
    // --- Step 1: Backup snapshot before any changes ---
    const backupSnapshot = await prisma.judge.findMany();
    const backupTimestamp = new Date().toISOString();

    let imported = 0;
    let skipped = 0;
    const failedRecords: { record: any; error: string }[] = [];

    // --- Step 2: Delete existing data if requested ---
    if (replaceExisting) {
      const existingJudges = await prisma.judge.findMany({
        where: { email: { not: null } }
      });
      const emails = existingJudges.map(j => j.email).filter(Boolean) as string[];
      try {
        if (emails.length > 0) {
          await prisma.user.deleteMany({ where: { email: { in: emails } } });
        }
        await prisma.judge.deleteMany({});
      } catch (err) {
        console.error('[BulkImport] Error clearing existing judges:', err);
        throw new Error('Failed to clear existing judges. Import aborted.');
      }
    }

    // --- Step 3: Track slugs for uniqueness within this batch ---
    const seenSlugs = new Set<string>();
    const seenEmails = new Set<string>();
    const seenMobiles = new Set<string>();

    // --- Step 4: Process each judge record ---
    for (const raw of judges) {
      try {
        // Normalize the name — support both `name` and `fullName`
        const name = (raw.fullName || raw.name || '').trim();
        if (!name) {
          failedRecords.push({ record: raw, error: 'Missing name/fullName' });
          continue;
        }

        // Email normalization
        const email = raw.email && raw.email.trim() !== '' ? raw.email.trim().toLowerCase() : null;

        // Mobile normalization
        const mobile = raw.mobile && raw.mobile.trim() !== '' ? raw.mobile.trim() : null;

        // Duplicate email check within batch
        if (email) {
          if (seenEmails.has(email)) {
            skipped++;
            failedRecords.push({ record: raw, error: `Duplicate email in batch: ${email}` });
            continue;
          }
          // Check DB (if not replacing)
          if (!replaceExisting) {
            const existing = await prisma.judge.findFirst({ where: { email } });
            if (existing) {
              skipped++;
              failedRecords.push({ record: raw, error: `Email already exists in DB: ${email}` });
              continue;
            }
          }
          seenEmails.add(email);
        }

        // Duplicate mobile check within batch
        if (mobile) {
          if (seenMobiles.has(mobile)) {
            skipped++;
            failedRecords.push({ record: raw, error: `Duplicate mobile in batch: ${mobile}` });
            continue;
          }
          seenMobiles.add(mobile);
        }

        // --- Slug generation ---
        let baseSlug = (raw.slug || name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        let slug = baseSlug;
        let slugCounter = 1;
        while (seenSlugs.has(slug)) {
          slug = `${baseSlug}-${slugCounter++}`;
        }
        // Also check DB
        const dbSlug = await prisma.judge.findFirst({ where: { slug } });
        if (dbSlug) {
          slug = `${baseSlug}-${Date.now()}`;
        }
        seenSlugs.add(slug);

        // --- Field mapping ---
        const judgeData = {
          name,
          slug,
          email,
          phone: raw.phone || null,
          mobile: mobile,
          gender: raw.gender || null,
          address: raw.address || null,
          city: raw.city || null,
          state: raw.state || null,
          country: raw.country || 'India',
          zipcode: raw.zipcode || null,
          experience: raw.experience ? String(raw.experience) : null,
          specialization: raw.specialization || raw.description || null,
          certifications: raw.certifications || null,
          qualifications: raw.qualifications || null,
          bio: raw.biography || raw.bio || null,
          photoUrl: raw.profileImage || raw.photoUrl || null,
          credentials: raw.specialization || raw.description || null,
          isFeatured: raw.featured === true || raw.featured === 'true' || raw.isFeatured === true,
          status: raw.status || 'ACTIVE',
          seoTitle: `${name} | KCI Judge`,
          seoDescription: `${name} – ${raw.specialization || raw.description || 'KCI Registered Judge'} based in ${raw.city || 'India'}.`,
        };

        await prisma.judge.create({ data: judgeData });

        // Auto-create user account for email-based judges
        if (email) {
          try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (!existingUser) {
              const bcrypt = require('bcrypt');
              const hashedPassword = await bcrypt.hash('welcome123', 12);
              const nameParts = name.split(' ');
              const user = await prisma.user.create({
                data: {
                  email,
                  password: hashedPassword,
                  firstName: nameParts[0] || name,
                  lastName: nameParts.slice(1).join(' ') || '',
                  phone: raw.phone || null,
                  isActive: true,
                  mobileVerified: true,
                  termsAccepted: true,
                  privacyAccepted: true,
                }
              });
              const role = await prisma.role.findFirst({
                where: { name: { equals: 'Judge', mode: 'insensitive' } }
              });
              if (role) {
                await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
              }
            }
          } catch (userErr) {
            console.warn('[BulkImport] Could not create user for judge:', email, userErr);
          }
        }

        imported++;
      } catch (error: any) {
        console.error('[BulkImport] Failed to import judge:', raw.fullName || raw.name, error.message);
        failedRecords.push({ record: raw, error: error.message });
      }
    }

    return {
      success: true,
      existingDeleted: replaceExisting,
      totalImported: imported,
      skipped,
      failed: failedRecords.length,
      failedRecords,
      backupCount: backupSnapshot.length,
      backupTimestamp,
      message: `${imported} of ${judges.length} judges imported successfully. ${skipped} skipped. ${failedRecords.length} failed.`,
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
