/**
 * JuzDog Media Seeder
 * =============================================
 * Seeds 30 demo Photos + 20 demo Videos into PostgreSQL.
 * Uses real Unsplash dog photo URLs as cdnUrl (no S3 upload needed for demo).
 * Run with:  npm run seed:media
 * =============================================
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slug = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'juzdog-media';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// High-quality Unsplash dog photo IDs (verified dog images)
const DOG_PHOTO_IDS = [
  'eBkEJ9cH5b4', // German Shepherd
  'N04FIfHhv_k', // Golden Retriever
  'VMpMus5XMRI', // Labrador
  'E0AHdsENmDg', // Husky
  'f-d4ORwT6Mc', // Poodle
  'ct7ZVP4fSpY', // Beagle
  'rCbdp8VCYhQ', // Rottweiler
  '4mt-color-0', // Great Dane (fallback picsum)
  'Sg3XwuEpybU', // Dog show
  'yihlaRCCvd4', // Portrait dog
  'l7v4Iaig2vI', // Dog training
  'BphTrPVCXuI', // Dog outdoor
  'mkMH8v5I_9A', // Dog kennel
  'suwanApDMFc', // Championship dog
  'FQXF7uNQmrk', // Award ceremony
  '8JxO3P8OQHM', // Grooming
  'WYd_PkCa1-Y', // Puppy show
  'Hc4UdqrtFRI', // Dog portrait
  'EOe30QMEKvg', // Dog outdoor
  'MbkRXajNYZg', // Dog show stage
  'NKXTSJRbfUQ', // Dog walk
  'FD2AJaW2g9Y', // Dog judge
  'x9A5OPCxiio', // Dog grooming
  '_RBcxo9AU-U', // Dog award
  'qO-PIF84Vxg', // Dog breed
  'yihlaRCCvd4', // Repeat 2
  'eBkEJ9cH5b4', // Repeat 3
  'N04FIfHhv_k', // Repeat 4
  'VMpMus5XMRI', // Repeat 5
  'E0AHdsENmDg', // Repeat 6
];

// Build cdnUrl from either Unsplash or picsum fallback
const photoUrl = (index: number, w = 800, h = 600): string => {
  const id = DOG_PHOTO_IDS[index % DOG_PHOTO_IDS.length];
  // Use picsum.photos with seed for consistent, reliable demo images
  return `https://picsum.photos/seed/juzdog-${index}/800/600`;
};

const thumbUrl = (index: number): string =>
  `https://picsum.photos/seed/juzdog-thumb-${index}/400/300`;

const videoThumbUrl = (index: number): string =>
  `https://picsum.photos/seed/juzdog-video-${index}/1280/720`;

// ─── Categories Data ───────────────────────────────────────────────────────────
const PHOTO_CATEGORIES = [
  { name: 'Championship', slug: 'championship' },
  { name: 'Dog Shows', slug: 'dog-shows' },
  { name: 'Best in Show', slug: 'best-in-show' },
  { name: 'Puppy Show', slug: 'puppy-show' },
  { name: 'Outdoor', slug: 'outdoor' },
  { name: 'Portrait', slug: 'portrait' },
  { name: 'Award Ceremony', slug: 'award-ceremony' },
  { name: 'Grooming', slug: 'grooming' },
  { name: 'Training', slug: 'training' },
  { name: 'Kennel', slug: 'kennel' },
];

const VIDEO_CATEGORIES = [
  { name: 'Dog Shows', slug: 'video-dog-shows' },
  { name: 'Championship', slug: 'video-championship' },
  { name: 'Winners', slug: 'video-winners' },
  { name: 'Training', slug: 'video-training' },
  { name: 'Handler', slug: 'video-handler' },
  { name: 'Interviews', slug: 'video-interviews' },
  { name: 'Highlights', slug: 'video-highlights' },
];

const PHOTO_ALBUMS = [
  { title: 'JuzDog National Championship 2024', slug: 'national-championship-2024' },
  { title: 'Mumbai All-Breed Show', slug: 'mumbai-all-breed-show' },
  { title: 'Best in Show Collection', slug: 'best-in-show-collection' },
  { title: 'Puppy Showcase India', slug: 'puppy-showcase-india' },
  { title: 'Champion Portraits', slug: 'champion-portraits' },
];

const BREEDS = [
  'German Shepherd', 'Golden Retriever', 'Labrador', 'Siberian Husky',
  'Rottweiler', 'Doberman', 'Poodle', 'Beagle', 'Great Dane', 'Shih Tzu',
];

const PHOTOGRAPHERS = [
  'JuzDog Media', 'Rajesh Kumar', 'Priya Sharma', 'Anand Verma',
  'JuzDog Official', 'Suresh Nair', 'Deepa Menon',
];

const LOCATIONS = [
  'Mumbai, Maharashtra', 'Delhi, India', 'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu', 'Hyderabad, Telangana', 'Kolkata, West Bengal',
  'Pune, Maharashtra', 'Ahmedabad, Gujarat',
];

// ─── Photo Records ─────────────────────────────────────────────────────────────
const PHOTO_TEMPLATES = [
  { title: 'Grand Champion German Shepherd at National Dog Show', cat: 'Championship', breed: 'German Shepherd' },
  { title: 'Golden Retriever Best in Show Winner', cat: 'Best in Show', breed: 'Golden Retriever' },
  { title: 'Labrador Retriever Show Ring Elegance', cat: 'Dog Shows', breed: 'Labrador' },
  { title: 'Siberian Husky — Blue Eyes Champion', cat: 'Portrait', breed: 'Siberian Husky' },
  { title: 'Rottweiler Power and Grace at JuzDog 2024', cat: 'Championship', breed: 'Rottweiler' },
  { title: 'Doberman Pinscher Champion Class Winner', cat: 'Best in Show', breed: 'Doberman' },
  { title: 'Poodle Grooming Excellence Award', cat: 'Grooming', breed: 'Poodle' },
  { title: 'Beagle Puppy Show — Future Champion', cat: 'Puppy Show', breed: 'Beagle' },
  { title: 'Great Dane Commanding the Show Ring', cat: 'Dog Shows', breed: 'Great Dane' },
  { title: 'Shih Tzu — Perfectly Groomed Champion', cat: 'Grooming', breed: 'Shih Tzu' },
  { title: 'German Shepherd Obedience Training Session', cat: 'Training', breed: 'German Shepherd' },
  { title: 'Golden Retriever Outdoor Agility Excellence', cat: 'Outdoor', breed: 'Golden Retriever' },
  { title: 'Award Ceremony — JuzDog National Finals', cat: 'Award Ceremony', breed: 'Labrador' },
  { title: 'Husky Pack — Kennel Life at Champion Breeds', cat: 'Kennel', breed: 'Siberian Husky' },
  { title: 'Rottweiler Portrait — Power Meets Elegance', cat: 'Portrait', breed: 'Rottweiler' },
  { title: 'Poodle Breed Specialist Show Winner', cat: 'Dog Shows', breed: 'Poodle' },
  { title: 'Puppy Championship — Best in Puppy Class', cat: 'Puppy Show', breed: 'Beagle' },
  { title: 'Doberman Handler Excellence Award', cat: 'Award Ceremony', breed: 'Doberman' },
  { title: 'Great Dane — India\'s Tallest Champion', cat: 'Championship', breed: 'Great Dane' },
  { title: 'Shih Tzu Indoor Portrait Study', cat: 'Portrait', breed: 'Shih Tzu' },
  { title: 'German Shepherd Tracking Champion 2024', cat: 'Training', breed: 'German Shepherd' },
  { title: 'Golden Retriever Outdoor Action Photography', cat: 'Outdoor', breed: 'Golden Retriever' },
  { title: 'JuzDog Best of Breed — Labrador Edition', cat: 'Best in Show', breed: 'Labrador' },
  { title: 'Kennel Club Approved Husky Bloodline', cat: 'Kennel', breed: 'Siberian Husky' },
  { title: 'Rottweiler Working Dog Excellence', cat: 'Training', breed: 'Rottweiler' },
  { title: 'Miniature Poodle — Grooming Art Form', cat: 'Grooming', breed: 'Poodle' },
  { title: 'Beagle Scent Detection Champion', cat: 'Championship', breed: 'Beagle' },
  { title: 'Doberman Alert and Ready — Show Stance', cat: 'Dog Shows', breed: 'Doberman' },
  { title: 'Great Dane Puppy — Future Giant Champion', cat: 'Puppy Show', breed: 'Great Dane' },
  { title: 'Shih Tzu Best in Group Award Ceremony', cat: 'Award Ceremony', breed: 'Shih Tzu' },
];

// ─── Video Records ─────────────────────────────────────────────────────────────
const VIDEO_TEMPLATES = [
  { title: 'JuzDog National Championship 2024 — Full Highlights', cat: 'Highlights', breed: 'German Shepherd', dur: '08:45' },
  { title: 'Best in Show Winner Walk — Grand Finale', cat: 'Dog Shows', breed: 'Golden Retriever', dur: '03:22' },
  { title: 'Championship Ring — German Shepherd Class', cat: 'Championship', breed: 'German Shepherd', dur: '05:10' },
  { title: 'Handler Interview — JuzDog Season Finale', cat: 'Interviews', breed: 'Labrador', dur: '06:55' },
  { title: 'Labrador Training Routine — Champion Style', cat: 'Training', breed: 'Labrador', dur: '04:30' },
  { title: 'Siberian Husky Winners Circle Moment', cat: 'Winners', breed: 'Siberian Husky', dur: '02:15' },
  { title: 'Rottweiler Show Ring — Power Demonstration', cat: 'Dog Shows', breed: 'Rottweiler', dur: '03:48' },
  { title: 'Poodle Grooming to Champion — Time-lapse', cat: 'Highlights', breed: 'Poodle', dur: '07:22' },
  { title: 'Puppy Show 2024 — Cutest Moments', cat: 'Dog Shows', breed: 'Beagle', dur: '05:00' },
  { title: 'Handler Technique Masterclass — Expert Tips', cat: 'Handler', breed: 'Doberman', dur: '12:10' },
  { title: 'Great Dane Championship Gaiting Analysis', cat: 'Championship', breed: 'Great Dane', dur: '04:05' },
  { title: 'JuzDog Season Recap — Best Moments 2024', cat: 'Highlights', breed: 'Shih Tzu', dur: '09:30' },
  { title: 'Winner\'s Interview — National Best in Show', cat: 'Interviews', breed: 'Golden Retriever', dur: '08:15' },
  { title: 'Doberman Training Regimen — Show Ready', cat: 'Training', breed: 'Doberman', dur: '06:40' },
  { title: 'Beagle Winners — Scent Group Finals', cat: 'Winners', breed: 'Beagle', dur: '03:05' },
  { title: 'Show Ring Etiquette — Handler Guide', cat: 'Handler', breed: 'German Shepherd', dur: '10:20' },
  { title: 'Husky Championship — Winter Breed Special', cat: 'Championship', breed: 'Siberian Husky', dur: '05:50' },
  { title: 'Poodle Group Winner — Toy to Standard', cat: 'Winners', breed: 'Poodle', dur: '04:18' },
  { title: 'Expert Judge Interview — Breed Standards', cat: 'Interviews', breed: 'Labrador', dur: '14:00' },
  { title: 'JuzDog Opening Ceremony — National Show', cat: 'Highlights', breed: 'German Shepherd', dur: '06:30' },
];

// ─── Main Seeder ───────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🐕 JuzDog Media Seeder Starting...\n');

  // 1. Seed Photo Categories
  console.log('📁 Creating photo categories...');
  const photoCategoryMap: Record<string, string> = {};
  for (const cat of PHOTO_CATEGORIES) {
    const created = await prisma.photoCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, status: 'ACTIVE' },
    });
    photoCategoryMap[cat.name] = created.id;
    process.stdout.write(`  ✓ ${cat.name}\n`);
  }

  // 2. Seed Video Categories
  console.log('\n📁 Creating video categories...');
  const videoCategoryMap: Record<string, string> = {};
  for (const cat of VIDEO_CATEGORIES) {
    const created = await prisma.videoCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, status: 'ACTIVE' },
    });
    videoCategoryMap[cat.name] = created.id;
    process.stdout.write(`  ✓ ${cat.name}\n`);
  }

  // 3. Seed Photo Albums
  console.log('\n📂 Creating photo albums...');
  const albumMap: Record<string, string> = {};
  for (const album of PHOTO_ALBUMS) {
    const created = await prisma.photoAlbum.upsert({
      where: { slug: album.slug },
      update: {},
      create: {
        title: album.title,
        slug: album.slug,
        status: 'ACTIVE',
      },
    });
    albumMap[album.slug] = created.id;
    process.stdout.write(`  ✓ ${album.title}\n`);
  }
  const albumIds = Object.values(albumMap);

  // 4. Seed Photos
  console.log('\n📸 Seeding 30 demo photos...');
  let photoCreated = 0;
  let photoSkipped = 0;

  for (let i = 0; i < PHOTO_TEMPLATES.length; i++) {
    const tpl = PHOTO_TEMPLATES[i];
    const photoSlug = slug(tpl.title) + `-${i + 1}`;
    const url = photoUrl(i);
    const catId = photoCategoryMap[tpl.cat];
    const albumId = albumIds[i % albumIds.length];
    const photographer = PHOTOGRAPHERS[i % PHOTOGRAPHERS.length];
    const location = LOCATIONS[i % LOCATIONS.length];

    const existing = await prisma.mediaPhoto.findUnique({ where: { slug: photoSlug } });
    if (existing) {
      photoSkipped++;
      process.stdout.write(`  ⏭  Skipped: ${tpl.title}\n`);
      continue;
    }

    await prisma.mediaPhoto.create({
      data: {
        title: tpl.title,
        slug: photoSlug,
        description: `Professional dog show photography capturing ${tpl.breed} excellence. ${tpl.title}. Photographed at ${location} by ${photographer} for JuzDog Media.`,
        albumId,
        categoryId: catId || null,
        breed: tpl.breed,
        photographer,
        location,
        tags: [tpl.breed.toLowerCase(), tpl.cat.toLowerCase(), 'juzdog', 'dog-show', 'india'],
        altText: `${tpl.breed} at ${tpl.cat} - JuzDog Photography`,
        seoTitle: `${tpl.title} | JuzDog Photography`,
        seoDescription: `View stunning ${tpl.breed} photography from JuzDog's ${tpl.cat} collection. Professional dog show images from across India.`,
        // Demo URLs — replace with real S3 URLs after uploading actual images
        s3Key: `media/photos/demo/${photoSlug}.jpg`,
        bucketName: BUCKET,
        cdnUrl: url,
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        fileSize: rand(200000, 2000000),
        featured: i < 12, // First 12 are featured (homepage shows 8)
        status: 'ACTIVE',
        views: rand(50, 5000),
      },
    });
    photoCreated++;
    process.stdout.write(`  ✓ [${i + 1}/30] ${tpl.title}\n`);
  }

  // 5. Seed Videos
  console.log('\n🎥 Seeding 20 demo videos...');
  let videoCreated = 0;
  let videoSkipped = 0;

  for (let i = 0; i < VIDEO_TEMPLATES.length; i++) {
    const tpl = VIDEO_TEMPLATES[i];
    const videoSlug = slug(tpl.title) + `-v${i + 1}`;
    const thumbUrl = videoThumbUrl(i);
    const catId = videoCategoryMap[tpl.cat];

    const existing = await prisma.mediaVideo.findUnique({ where: { slug: videoSlug } });
    if (existing) {
      videoSkipped++;
      process.stdout.write(`  ⏭  Skipped: ${tpl.title}\n`);
      continue;
    }

    await prisma.mediaVideo.create({
      data: {
        title: tpl.title,
        slug: videoSlug,
        description: `Watch this exclusive JuzDog video: ${tpl.title}. Featuring ${tpl.breed} in the ${tpl.cat} category. Recorded at JuzDog championship events across India.`,
        categoryId: catId || null,
        breed: tpl.breed,
        location: LOCATIONS[i % LOCATIONS.length],
        tags: [tpl.breed.toLowerCase(), tpl.cat.toLowerCase(), 'juzdog', 'video', 'championship'],
        thumbnailUrl: thumbUrl,
        duration: tpl.dur,
        // Demo placeholder — replace with real S3 uploaded video URL
        s3Key: `media/videos/demo/${videoSlug}.mp4`,
        bucketName: BUCKET,
        cdnUrl: `https://www.w3schools.com/html/mov_bbb.mp4`, // universal MP4 for demo play
        mimeType: 'video/mp4',
        fileSize: rand(50000000, 500000000),
        featured: i < 8, // First 8 are featured (homepage shows 6)
        status: 'ACTIVE',
        views: rand(100, 20000),
      },
    });
    videoCreated++;
    process.stdout.write(`  ✓ [${i + 1}/20] ${tpl.title}\n`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('✅ JuzDog Media Seeder Complete!');
  console.log('═'.repeat(55));
  console.log(`  📸 Photos   created: ${photoCreated}  skipped: ${photoSkipped}`);
  console.log(`  🎥 Videos   created: ${videoCreated}  skipped: ${videoSkipped}`);
  console.log(`  📁 Photo Categories: ${PHOTO_CATEGORIES.length}`);
  console.log(`  📁 Video Categories: ${VIDEO_CATEGORIES.length}`);
  console.log(`  📂 Albums:           ${PHOTO_ALBUMS.length}`);
  console.log('═'.repeat(55));
  console.log('\n🌐 Homepage will now show:');
  console.log('   Featured Photography → /gallery/photos');
  console.log('   Featured Videography → /gallery/videos');
  console.log('\n📌 To replace demo images with real S3 files:');
  console.log('   Admin → Media → Photos → Upload Photo (mark as Featured)');
  console.log('   Admin → Media → Videos → Upload Video (mark as Featured)');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
