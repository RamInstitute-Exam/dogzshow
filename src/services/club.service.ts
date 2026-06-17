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
    
    if (query.state) where.state = query.state;
    if (query.city) where.city = query.city;
    if (query.establishedYear) where.establishedYear = parseInt(query.establishedYear);
    if (query.kciApproved) where.kciApproved = query.kciApproved === 'true' || query.kciApproved === true;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.breed) {
      // If breed is provided, search description or name since there is no Breed relation in DB.
      where.OR = where.OR || [];
      where.OR.push({ description: { contains: query.breed } });
      where.OR.push({ name: { contains: query.breed } });
    }

    const include = { category: true };

    try {
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit, where, include }),
        this.repository.count(where)
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (e) {
      const [data, total] = await Promise.all([
        this.repository.findAll({ skip: (page - 1) * limit, take: limit, include }),
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
      where: { slug },
      include: {
        category: true,
        clubEvents: { orderBy: { startDate: 'asc' } },
        clubGalleries: true,
        clubCommittees: true,
        events: { orderBy: { startDate: 'asc' }, take: 10 }
      }
    });
    return item;
  }

  async bulkUpload(items: any[]) {
    const fs = require('fs');
    const path = require('path');
    
    // --- Step 1: Backup snapshot before any changes ---
    try {
      const backupSnapshot = await prisma.club.findMany();
      const backupTimestamp = Date.now();
      const backupDir = path.join(process.cwd(), 'data', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(backupDir, `clubs_backup_${backupTimestamp}.json`),
        JSON.stringify(backupSnapshot, null, 2)
      );
      console.log(`[Backup] Successfully backed up ${backupSnapshot.length} existing clubs.`);
    } catch (error) {
      console.error('[Backup Error] Failed to create club backup before bulk import:', error);
      // Optional: throw to prevent data loss if backup is absolutely critical
    }

    // --- Step 2: Delete existing dummy data to replace with official KCI clubs ---
    const existingClubs = await prisma.club.findMany();
    const emails = existingClubs.map(c => c.email).filter(Boolean) as string[];
    
    // Optional: cleanup associated users
    if (emails.length > 0) {
      await prisma.user.deleteMany({
        where: { email: { in: emails } }
      });
    }
    
    await prisma.club.deleteMany();

    // --- Step 3: Process items ---
    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const errors: any[] = [];
    const validRecordsToInsert: any[] = [];

    // Maps to track uniqueness within the current upload batch
    const seenEmails = new Set<string>();
    const seenSlugs = new Set<string>();

    for (const [index, item] of items.entries()) {
      try {
        const clubName = (item.clubName || item.name || '').trim();
        if (!clubName) {
          failedCount++;
          errors.push({ row: index + 1, clubName: 'N/A', reason: 'Missing club name' });
          continue;
        }

        // Generate slug
        let baseSlug = item.slug || clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let finalSlug = baseSlug;
        let counter = 1;
        while (seenSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        seenSlugs.add(finalSlug);

        // Map Email handling (could be a string or array in JSON)
        let primaryEmail = null;
        let emailJson = null;
        if (item.email) {
          if (Array.isArray(item.email) && item.email.length > 0) {
            primaryEmail = item.email[0].trim().toLowerCase();
            emailJson = item.email;
          } else if (typeof item.email === 'string') {
            const splitEmails = item.email.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            if (splitEmails.length > 0) {
              primaryEmail = splitEmails[0];
              emailJson = splitEmails.length > 1 ? splitEmails : null;
            }
          }
        }

        if (primaryEmail && seenEmails.has(primaryEmail)) {
          duplicateCount++;
          errors.push({ row: index + 1, clubName, reason: `Duplicate email in batch: ${primaryEmail}` });
          continue; // Skip duplicates
        }
        if (primaryEmail) seenEmails.add(primaryEmail);

        // Support automatic location detection dummy logic if needed (e.g. from zipcode)
        let city = (item.city || '').trim();
        let state = (item.state || '').trim();
        let country = (item.country || 'India').trim();
        
        // Map fields
        validRecordsToInsert.push({
          name: clubName,
          slug: finalSlug,
          secretary: (item.secretaryName || item.secretary || '').trim(),
          secretaryName: (item.secretaryName || '').trim(),
          designation: (item.designation || '').trim(),
          president: (item.president || '').trim(),
          address: (item.address || '').trim(),
          city: city,
          state: state,
          zipcode: (item.zipcode || '').trim(),
          country: country,
          phone: (item.phone || '').trim(),
          mobile: (item.mobile || '').trim(),
          fax: (item.fax || '').trim(),
          email: primaryEmail || null,
          emailJson: emailJson,
          website: (item.website || '').trim(),
          description: (item.description || '').trim(),
          logoUrl: (item.logo || item.logoUrl || '').trim(),
          bannerUrl: (item.banner || item.bannerUrl || '').trim(),
          status: item.status === 'ACTIVE' || item.isActive !== false ? 'ACTIVE' : 'INACTIVE',
          isActive: item.status === 'ACTIVE' || item.isActive !== false,
          isFeatured: item.featured === true || item.isFeatured === true,
          kciApproved: true,
        });
      } catch (err: any) {
        failedCount++;
        errors.push({ row: index + 1, clubName: item.clubName || 'Unknown', reason: err.message });
      }
    }

    // --- Step 4: Batch Insert via Transaction ---
    if (validRecordsToInsert.length > 0) {
      try {
        await prisma.$transaction(
          validRecordsToInsert.map(data => prisma.club.create({ data }))
        );
        importedCount += validRecordsToInsert.length;
      } catch (insertError: any) {
        console.error('[Bulk Import Error] DB Insert Failed:', insertError);
        throw new Error('Database insertion failed. Rollback executed. ' + insertError.message);
      }
    }

    return {
      success: true,
      imported: importedCount,
      duplicates: duplicateCount,
      failed: failedCount,
      errors: errors,
      message: `Bulk import completed successfully. Imported: ${importedCount}.`
    };
  }
}
