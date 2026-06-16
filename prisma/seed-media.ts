import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Media Gallery data...');

  // 1. Clear existing media data to ensure clean state
  await prisma.mediaImage.deleteMany({});
  await prisma.mediaVideo.deleteMany({});
  await prisma.mediaAlbum.deleteMany({});
  await prisma.mediaCategory.deleteMany({});

  // 2. Seed Categories
  console.log('Creating Media Categories...');
  const categoriesData = [
    { name: 'Photography', slug: 'photography', status: 'ACTIVE' },
    { name: 'Videos', slug: 'videos', status: 'ACTIVE' },
    { name: 'Personal', slug: 'personal', status: 'ACTIVE' },
    { name: 'Outdoor', slug: 'outdoor', status: 'ACTIVE' },
    { name: 'Show Photos', slug: 'show-photos', status: 'ACTIVE' },
    { name: 'Show Videos', slug: 'show-videos', status: 'ACTIVE' }
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.mediaCategory.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 3. Seed Albums
  console.log('Creating Media Albums...');
  const albumsData = [
    { title: 'Wedding Dogs', slug: 'wedding-dogs', categorySlug: 'photography' },
    { title: 'Dog Shows', slug: 'dog-shows', categorySlug: 'show-photos' },
    { title: 'Outdoor', slug: 'outdoor', categorySlug: 'outdoor' },
    { title: 'Training', slug: 'training', categorySlug: 'show-photos' },
    { title: 'Championship', slug: 'championship', categorySlug: 'show-photos' },
    { title: 'Puppies', slug: 'puppies', categorySlug: 'personal' }
  ];

  const albums: Record<string, any> = {};
  for (const alb of albumsData) {
    const categoryId = categories[alb.categorySlug].id;
    const created = await prisma.mediaAlbum.create({
      data: {
        title: alb.title,
        slug: alb.slug,
        categoryId,
        coverImage: `/images/media-gallery/golden_retriever.png`
      }
    });
    albums[alb.slug] = created;
  }

  // 4. Seed Images
  console.log('Creating Media Images...');
  const imagesData = [
    {
      title: 'Golden Retriever Championship Portrait',
      slug: 'golden-retriever-championship-portrait',
      imageUrl: '/images/media-gallery/golden_retriever.png',
      altText: 'Champion Golden Retriever standing proud on show stage',
      description: 'Award-winning Golden Retriever posing beautifully under cinematic studio lights at the National Show.',
      categorySlug: 'show-photos',
      albumSlug: 'dog-shows',
      featured: true
    },
    {
      title: 'Luxury Doberman Studio Shoot',
      slug: 'luxury-doberman-studio-shoot',
      imageUrl: '/images/media-gallery/doberman.png',
      altText: 'Sleek Doberman Pinscher in high-end studio portrait',
      description: 'Elegant Doberman Pinscher showing off its athletic frame and glossy coat in a luxury studio setup.',
      categorySlug: 'photography',
      albumSlug: 'championship',
      featured: true
    },
    {
      title: 'Champion Husky Outdoor Session',
      slug: 'champion-husky-outdoor-session',
      imageUrl: '/images/media-gallery/husky.png',
      altText: 'Siberian Husky in natural outdoor mountain landscape',
      description: 'Stunning Siberian Husky with piercing blue eyes posing during an outdoor photo session in the hills.',
      categorySlug: 'outdoor',
      albumSlug: 'outdoor',
      featured: true
    },
    {
      title: 'Professional German Shepherd Photography',
      slug: 'professional-german-shepherd-photography',
      imageUrl: '/images/media-gallery/german_shepherd.png',
      altText: 'German Shepherd working dog alert stance',
      description: 'Focused German Shepherd showcasing perfect breed standards and high alertness in a champion kennel environment.',
      categorySlug: 'show-photos',
      albumSlug: 'dog-shows',
      featured: true
    },
    {
      title: 'Royal Labrador Showcase',
      slug: 'royal-labrador-showcase',
      imageUrl: '/images/media-gallery/labrador.png',
      altText: 'Labrador Retriever on red carpet championship stage',
      description: 'A handsome yellow Labrador Retriever displaying ideal posture and regal attitude on the championship stage.',
      categorySlug: 'show-photos',
      albumSlug: 'championship',
      featured: true
    },
    {
      title: 'Championship Pug Stage Portrait',
      slug: 'championship-pug-stage-portrait',
      imageUrl: '/images/media-gallery/pug.png',
      altText: 'Charming Pug sitting on presentation pedestal',
      description: 'Showcasing the lovable Pug breed on a professional dog show pedestal under bright exhibition lighting.',
      categorySlug: 'photography',
      albumSlug: 'puppies',
      featured: true
    },
    {
      title: 'Majestic Rottweiler Kennel Competition',
      slug: 'majestic-rottweiler-kennel-competition',
      imageUrl: '/images/media-gallery/rottweiler.png',
      altText: 'Powerful Rottweiler posing on training field',
      description: 'Strong and confident Rottweiler posing during a formal breed evaluation event at the championship kennel.',
      categorySlug: 'show-photos',
      albumSlug: 'training',
      featured: true
    },
    {
      title: 'Beagle Outdoor Championship Session',
      slug: 'beagle-outdoor-championship-session',
      imageUrl: '/images/media-gallery/beagle.png',
      altText: 'Beagle dog standing in lush green park',
      description: 'Playful yet disciplined Beagle dog caught in a beautiful pose on a sunny day in an open championship field.',
      categorySlug: 'outdoor',
      albumSlug: 'outdoor',
      featured: true
    },
    {
      title: 'Saint Bernard Championship Stage Portrait',
      slug: 'saint-bernard-championship-stage-portrait',
      imageUrl: '/images/media-gallery/saint_bernard.png',
      altText: 'Massive Saint Bernard show dog',
      description: 'An impressive Saint Bernard showing its gentle giant look and gorgeous thick coat at the kennel competition.',
      categorySlug: 'show-photos',
      albumSlug: 'championship',
      featured: false
    },
    {
      title: 'Luxury Shih Tzu Showcase Shoot',
      slug: 'luxury-shih-tzu-showcase-shoot',
      imageUrl: '/images/media-gallery/shih_tzu.png',
      altText: 'Beautifully groomed Shih Tzu dog',
      description: 'Perfectly groomed Shih Tzu with flowing locks posing for a luxury photography project in a high-end kennel studio.',
      categorySlug: 'photography',
      albumSlug: 'puppies',
      featured: false
    }
  ];

  for (const img of imagesData) {
    const categoryId = categories[img.categorySlug].id;
    const albumId = albums[img.albumSlug].id;
    await prisma.mediaImage.create({
      data: {
        title: img.title,
        slug: img.slug,
        imageUrl: img.imageUrl,
        thumbnailUrl: img.imageUrl,
        altText: img.altText,
        description: img.description,
        categoryId,
        albumId,
        featured: img.featured,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 100) + 10,
        status: 'ACTIVE'
      }
    });
  }

  // 5. Seed Videos
  console.log('Creating Media Videos...');
  const videosData = [
    {
      title: 'Golden Retriever Dog Show Highlights',
      slug: 'golden-retriever-dog-show',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4',
      thumbnail: '/images/media-gallery/golden_retriever.png',
      duration: '03:45',
      categorySlug: 'show-videos',
      albumSlug: 'dog-shows',
      featured: true
    },
    {
      title: 'National Kennel Championship 2026',
      slug: 'national-kennel-championship',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4',
      thumbnail: '/images/media-gallery/german_shepherd.png',
      duration: '12:20',
      categorySlug: 'show-videos',
      albumSlug: 'championship',
      featured: true
    },
    {
      title: 'Best in Show Finals Coverage',
      slug: 'best-in-show-finals',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4',
      thumbnail: '/images/media-gallery/labrador.png',
      duration: '15:10',
      categorySlug: 'show-videos',
      albumSlug: 'championship',
      featured: true
    },
    {
      title: 'Doberman Training Session: Obedience & Agility',
      slug: 'doberman-training-session',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4',
      thumbnail: '/images/media-gallery/doberman.png',
      duration: '05:40',
      categorySlug: 'videos',
      albumSlug: 'training',
      featured: true
    },
    {
      title: 'German Shepherd Walk & Stance Guide',
      slug: 'german-shepherd-walk',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4',
      thumbnail: '/images/media-gallery/german_shepherd.png',
      duration: '04:15',
      categorySlug: 'show-videos',
      albumSlug: 'training',
      featured: true
    },
    {
      title: 'Luxury Kennel Event Tour',
      slug: 'luxury-kennel-event',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4',
      thumbnail: '/images/media-gallery/shih_tzu.png',
      duration: '08:30',
      categorySlug: 'videos',
      albumSlug: 'puppies',
      featured: true
    },
    {
      title: 'Outdoor Championship Agility Test',
      slug: 'outdoor-championship',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4',
      thumbnail: '/images/media-gallery/husky.png',
      duration: '06:50',
      categorySlug: 'show-videos',
      albumSlug: 'outdoor',
      featured: true
    },
    {
      title: 'Champion Dog Parade & Ceremony',
      slug: 'champion-dog-parade',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4',
      thumbnail: '/images/media-gallery/beagle.png',
      duration: '10:15',
      categorySlug: 'show-videos',
      albumSlug: 'championship',
      featured: true
    }
  ];

  for (const vid of videosData) {
    const categoryId = categories[vid.categorySlug].id;
    const albumId = albums[vid.albumSlug].id;
    await prisma.mediaVideo.create({
      data: {
        title: vid.title,
        slug: vid.slug,
        videoUrl: vid.videoUrl,
        thumbnailUrl: vid.thumbnail,
        duration: vid.duration,
        categoryId,
        albumId,
        featured: vid.featured,
        views: Math.floor(Math.random() * 800) + 100,
        likes: Math.floor(Math.random() * 200) + 20,
        status: 'ACTIVE'
      }
    });
  }

  // 6. Seed Admin Menu Management Items
  console.log('Updating Admin Sidebar Navigation Menus...');
  const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });

  if (superAdminRole && adminRole) {
    // Check if Content Management menu exists
    let contentMgmt = await prisma.menu.findFirst({
      where: { name: 'Content Management', position: 'ADMIN_SIDEBAR' }
    });

    if (!contentMgmt) {
      contentMgmt = await prisma.menu.create({
        data: {
          name: 'Content Management',
          url: '#',
          icon: 'FolderOpen',
          position: 'ADMIN_SIDEBAR',
          displayOrder: 4,
          visibility: true
        }
      });
      // Assign permissions
      await prisma.menuPermission.create({
        data: { menuId: contentMgmt.id, roleId: superAdminRole.id }
      }).catch(() => null);
      await prisma.menuPermission.create({
        data: { menuId: contentMgmt.id, roleId: adminRole.id }
      }).catch(() => null);
    }

    const subMenus = [
      { name: 'Photo Gallery', url: '/admin/media-gallery/photos', displayOrder: 1 },
      { name: 'Video Gallery', url: '/admin/media-gallery/videos', displayOrder: 2 },
      { name: 'Albums', url: '/admin/media-gallery/albums', displayOrder: 3 },
      { name: 'Categories', url: '/admin/media-gallery/categories', displayOrder: 4 }
    ];

    for (const sub of subMenus) {
      const existingSub = await prisma.menu.findFirst({
        where: { name: sub.name, parentId: contentMgmt.id }
      });
      if (!existingSub) {
        const createdSub = await prisma.menu.create({
          data: {
            name: sub.name,
            url: sub.url,
            parentId: contentMgmt.id,
            position: 'ADMIN_SIDEBAR',
            displayOrder: sub.displayOrder,
            visibility: true
          }
        });
        await prisma.menuPermission.create({
          data: { menuId: createdSub.id, roleId: superAdminRole.id }
        }).catch(() => null);
        await prisma.menuPermission.create({
          data: { menuId: createdSub.id, roleId: adminRole.id }
        }).catch(() => null);
      }
    }
  }

  console.log('🎉 Media Gallery Seed Completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
