import prisma from '../prisma';

export class MediaGalleryService {
  // ==========================================
  // Public Retrieval Methods
  // ==========================================

  async getImages(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };

    // Search filter
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { altText: { contains: query.search } }
      ];
    }

    // Category filter
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Album filter
    if (query.album) {
      where.album = { slug: query.album };
    }

    // Featured filter
    if (query.featured === 'true' || query.featured === true) {
      where.featured = true;
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'views') {
      orderBy = { views: 'desc' };
    } else if (query.sort === 'likes') {
      orderBy = { likes: 'desc' };
    }

    const [items, total] = await Promise.all([
      prisma.mediaImage.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          album: true
        }
      }),
      prisma.mediaImage.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getVideos(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };

    // Search filter
    if (query.search) {
      where.title = { contains: query.search };
    }

    // Category filter
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Album filter
    if (query.album) {
      where.album = { slug: query.album };
    }

    // Featured filter
    if (query.featured === 'true' || query.featured === true) {
      where.featured = true;
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'views') {
      orderBy = { views: 'desc' };
    } else if (query.sort === 'likes') {
      orderBy = { likes: 'desc' };
    }

    const [items, total] = await Promise.all([
      prisma.mediaVideo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          album: true
        }
      }),
      prisma.mediaVideo.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getFeaturedImages() {
    return prisma.mediaImage.findMany({
      where: { featured: true, status: 'ACTIVE' },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true, album: true }
    });
  }

  async getFeaturedVideos() {
    return prisma.mediaVideo.findMany({
      where: { featured: true, status: 'ACTIVE' },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true, album: true }
    });
  }

  async getAlbums(query?: any) {
    const where: any = {};
    if (query?.category) {
      where.category = { slug: query.category };
    }
    return prisma.mediaAlbum.findMany({
      where,
      include: { category: true }
    });
  }

  async getCategories() {
    return prisma.mediaCategory.findMany({
      where: { status: 'ACTIVE' }
    });
  }

  // ==========================================
  // Admin CRUD Methods
  // ==========================================

  // Image CRUD
  async getAdminImages(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } }
      ];
    }

    const [items, totalCount] = await Promise.all([
      prisma.mediaImage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, album: true }
      }),
      prisma.mediaImage.count({ where })
    ]);

    return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async createImage(data: any) {
    return prisma.mediaImage.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        description: data.description,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl || data.imageUrl,
        altText: data.altText,
        featured: data.featured || false,
        categoryId: data.categoryId,
        albumId: data.albumId || null,
        status: data.status || 'ACTIVE'
      }
    });
  }

  // Video CRUD
  async getAdminVideos(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.title = { contains: query.search };
    }

    const [items, totalCount] = await Promise.all([
      prisma.mediaVideo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, album: true }
      }),
      prisma.mediaVideo.count({ where })
    ]);

    return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async createVideo(data: any) {
    return prisma.mediaVideo.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        thumbnail: data.thumbnail,
        videoUrl: data.videoUrl,
        duration: data.duration,
        featured: data.featured || false,
        categoryId: data.categoryId,
        albumId: data.albumId || null,
        status: data.status || 'ACTIVE'
      }
    });
  }

  // Generic Media Update/Delete
  async updateMedia(id: string, data: any) {
    // Check if it's an image
    const isImage = await prisma.mediaImage.findUnique({ where: { id } });
    if (isImage) {
      return prisma.mediaImage.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
          thumbnailUrl: data.thumbnailUrl,
          altText: data.altText,
          featured: data.featured,
          categoryId: data.categoryId,
          albumId: data.albumId || null,
          status: data.status,
          views: data.views !== undefined ? parseInt(data.views) : undefined,
          likes: data.likes !== undefined ? parseInt(data.likes) : undefined
        }
      });
    }

    // Check if it's a video
    const isVideo = await prisma.mediaVideo.findUnique({ where: { id } });
    if (isVideo) {
      return prisma.mediaVideo.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          thumbnail: data.thumbnail,
          videoUrl: data.videoUrl,
          duration: data.duration,
          featured: data.featured,
          categoryId: data.categoryId,
          albumId: data.albumId || null,
          status: data.status,
          views: data.views !== undefined ? parseInt(data.views) : undefined,
          likes: data.likes !== undefined ? parseInt(data.likes) : undefined
        }
      });
    }

    throw new Error('Media item not found');
  }

  async deleteMedia(id: string) {
    const isImage = await prisma.mediaImage.findUnique({ where: { id } });
    if (isImage) {
      return prisma.mediaImage.delete({ where: { id } });
    }

    const isVideo = await prisma.mediaVideo.findUnique({ where: { id } });
    if (isVideo) {
      return prisma.mediaVideo.delete({ where: { id } });
    }

    throw new Error('Media item not found');
  }

  async getById(id: string) {
    const image = await prisma.mediaImage.findUnique({ where: { id }, include: { category: true, album: true } });
    if (image) return { ...image, mediaType: 'PHOTO' };

    const video = await prisma.mediaVideo.findUnique({ where: { id }, include: { category: true, album: true } });
    if (video) return { ...video, mediaType: 'VIDEO' };

    throw new Error('Media item not found');
  }

  // Categories CRUD
  async getAdminCategories(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.name = { contains: query.search };
    }

    const [items, totalCount] = await Promise.all([
      prisma.mediaCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.mediaCategory.count({ where })
    ]);

    return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async createCategory(data: any) {
    return prisma.mediaCategory.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        status: data.status || 'ACTIVE'
      }
    });
  }

  async updateCategory(id: string, data: any) {
    return prisma.mediaCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        status: data.status
      }
    });
  }

  async deleteCategory(id: string) {
    return prisma.mediaCategory.delete({ where: { id } });
  }

  // Albums CRUD
  async getAdminAlbums(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.title = { contains: query.search };
    }

    const [items, totalCount] = await Promise.all([
      prisma.mediaAlbum.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: 'asc' },
        include: { category: true }
      }),
      prisma.mediaAlbum.count({ where })
    ]);

    return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async createAlbum(data: any) {
    return prisma.mediaAlbum.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        coverImage: data.coverImage,
        categoryId: data.categoryId
      }
    });
  }

  async updateAlbum(id: string, data: any) {
    return prisma.mediaAlbum.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        coverImage: data.coverImage,
        categoryId: data.categoryId
      }
    });
  }

  async deleteAlbum(id: string) {
    return prisma.mediaAlbum.delete({ where: { id } });
  }

  // Increments for like/view buttons
  async incrementViews(id: string, type: 'image' | 'video') {
    if (type === 'image') {
      return prisma.mediaImage.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    } else {
      return prisma.mediaVideo.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    }
  }

  async incrementLikes(id: string, type: 'image' | 'video') {
    if (type === 'image') {
      return prisma.mediaImage.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
    } else {
      return prisma.mediaVideo.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
    }
  }
}
