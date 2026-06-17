/**
 * KCI Judges Seed Script
 * Run: node scripts/seed-judges.js
 * 
 * This script reads the KCI judges JSON file and imports them directly
 * using the Prisma client (bypassing HTTP to allow running standalone).
 */

const path = require('path');
const fs = require('fs');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DATA_FILE = path.join(__dirname, '..', 'data', 'kci-judges.json');

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('\n🐕 JuzDog KCI Judges Seed Script\n');
  console.log('━'.repeat(50));

  // Load data
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const judges = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log(`📂 Loaded ${judges.length} judges from kci-judges.json`);

  // Step 1: Backup
  const existing = await prisma.judge.findMany();
  console.log(`\n📦 Backup: Found ${existing.length} existing judge records`);
  if (existing.length > 0) {
    const backupPath = path.join(__dirname, '..', 'data', `judges_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
    console.log(`✅ Backup saved to: ${path.basename(backupPath)}`);
  }

  // Step 2: Clear existing data
  console.log('\n🗑️  Clearing existing judges...');
  const existingEmails = existing.map(j => j.email).filter(Boolean);
  if (existingEmails.length > 0) {
    await prisma.user.deleteMany({ where: { email: { in: existingEmails } } });
    console.log(`   Deleted ${existingEmails.length} associated user accounts`);
  }
  await prisma.judge.deleteMany({});
  console.log(`   Judges table cleared ✓`);

  // Step 3: Import
  console.log('\n📥 Importing KCI Judges...\n');
  let imported = 0;
  let failed = 0;
  const seenSlugs = new Set();
  const seenEmails = new Set();

  // Find Judge role (MySQL is case-insensitive by default on most collations)
  const judgeRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: 'Judge' },
        { name: 'JUDGE' },
        { name: 'judge' },
      ]
    }
  });

  for (const raw of judges) {
    try {
      const name = (raw.fullName || raw.name || '').trim();
      if (!name) { console.log(`   ⚠️  Skipped (no name): ${JSON.stringify(raw)}`); failed++; continue; }

      const email = raw.email && raw.email.trim() !== '' ? raw.email.trim().toLowerCase() : null;

      if (email && seenEmails.has(email)) {
        console.log(`   ⚠️  Skipped duplicate email: ${email}`);
        failed++;
        continue;
      }
      if (email) seenEmails.add(email);

      // Generate slug
      let baseSlug = generateSlug(raw.slug || name);
      let slug = baseSlug;
      let counter = 1;
      while (seenSlugs.has(slug)) slug = `${baseSlug}-${counter++}`;
      seenSlugs.add(slug);

      // Create judge
      const judge = await prisma.judge.create({
        data: {
          name,
          slug,
          email,
          phone: raw.phone || null,
          mobile: raw.mobile && raw.mobile.trim() !== '' ? raw.mobile.trim() : null,
          address: raw.address || null,
          city: raw.city || null,
          state: raw.state || null,
          country: raw.country || 'India',
          zipcode: raw.zipcode || null,
          specialization: raw.specialization || raw.description || null,
          bio: raw.biography || null,
          photoUrl: raw.profileImage || null,
          credentials: raw.specialization || raw.description || null,
          isFeatured: raw.featured === true,
          status: raw.status || 'ACTIVE',
          seoTitle: `${name} | KCI Judge`,
          seoDescription: `${name} – ${raw.specialization || raw.description || 'KCI Registered Judge'} based in ${raw.city || 'India'}.`,
        }
      });

      // Create user account if email provided
      if (email) {
        try {
          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (!existingUser) {
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
            if (judgeRole) {
              await prisma.userRole.create({ data: { userId: user.id, roleId: judgeRole.id } });
            }
          }
        } catch (ue) {
          console.warn(`   ⚠️  Could not create user for: ${email}`);
        }
      }

      imported++;
      console.log(`   ✅ [${imported}] ${name} (${raw.city || 'N/A'})`);
    } catch (err) {
      console.log(`   ❌ Failed: ${raw.fullName || raw.name} — ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`📊 SUMMARY`);
  console.log(`   ✅ Imported : ${imported}`);
  console.log(`   ❌ Failed   : ${failed}`);
  console.log(`   📦 Backed up: ${existing.length} old records`);
  console.log('━'.repeat(50));

  if (imported > 0) {
    console.log(`\n🎉 Done! ${imported} KCI judges are now live in the database.\n`);
  }
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
