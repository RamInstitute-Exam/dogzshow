"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaGalleryService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class MediaGalleryService {
    // ==========================================
    // Public Retrieval Methods
    // ==========================================
    getImages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 12;
            const skip = (page - 1) * limit;
            const where = { status: 'ACTIVE' };
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
            let orderBy = { createdAt: 'desc' };
            if (query.sort === 'views') {
                orderBy = { views: 'desc' };
            }
            else if (query.sort === 'likes') {
                orderBy = { likes: 'desc' };
            }
            const [items, total] = yield Promise.all([
                prisma_1.default.mediaImage.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    include: {
                        category: true,
                        album: true
                    }
                }),
                prisma_1.default.mediaImage.count({ where })
            ]);
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        });
    }
    getVideos(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 12;
            const skip = (page - 1) * limit;
            const where = { status: 'ACTIVE' };
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
            let orderBy = { createdAt: 'desc' };
            if (query.sort === 'views') {
                orderBy = { views: 'desc' };
            }
            else if (query.sort === 'likes') {
                orderBy = { likes: 'desc' };
            }
            const [items, total] = yield Promise.all([
                prisma_1.default.mediaVideo.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    include: {
                        category: true,
                        album: true
                    }
                }),
                prisma_1.default.mediaVideo.count({ where })
            ]);
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        });
    }
    getFeaturedImages() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaImage.findMany({
                where: { featured: true, status: 'ACTIVE' },
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: { category: true, album: true }
            });
        });
    }
    getFeaturedVideos() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaVideo.findMany({
                where: { featured: true, status: 'ACTIVE' },
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: { category: true, album: true }
            });
        });
    }
    getAlbums(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (query === null || query === void 0 ? void 0 : query.category) {
                where.category = { slug: query.category };
            }
            return prisma_1.default.mediaAlbum.findMany({
                where,
                include: { category: true }
            });
        });
    }
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaCategory.findMany({
                where: { status: 'ACTIVE' }
            });
        });
    }
    // ==========================================
    // Admin CRUD Methods
    // ==========================================
    // Image CRUD
    getAdminImages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search } },
                    { description: { contains: query.search } }
                ];
            }
            const [items, totalCount] = yield Promise.all([
                prisma_1.default.mediaImage.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { category: true, album: true }
                }),
                prisma_1.default.mediaImage.count({ where })
            ]);
            return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
        });
    }
    createImage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaImage.create({
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
        });
    }
    // Video CRUD
    getAdminVideos(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where.title = { contains: query.search };
            }
            const [items, totalCount] = yield Promise.all([
                prisma_1.default.mediaVideo.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { category: true, album: true }
                }),
                prisma_1.default.mediaVideo.count({ where })
            ]);
            return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
        });
    }
    createVideo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaVideo.create({
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
        });
    }
    // Generic Media Update/Delete
    updateMedia(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if it's an image
            const isImage = yield prisma_1.default.mediaImage.findUnique({ where: { id } });
            if (isImage) {
                return prisma_1.default.mediaImage.update({
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
            const isVideo = yield prisma_1.default.mediaVideo.findUnique({ where: { id } });
            if (isVideo) {
                return prisma_1.default.mediaVideo.update({
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
        });
    }
    deleteMedia(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isImage = yield prisma_1.default.mediaImage.findUnique({ where: { id } });
            if (isImage) {
                return prisma_1.default.mediaImage.delete({ where: { id } });
            }
            const isVideo = yield prisma_1.default.mediaVideo.findUnique({ where: { id } });
            if (isVideo) {
                return prisma_1.default.mediaVideo.delete({ where: { id } });
            }
            throw new Error('Media item not found');
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield prisma_1.default.mediaImage.findUnique({ where: { id }, include: { category: true, album: true } });
            if (image)
                return Object.assign(Object.assign({}, image), { mediaType: 'PHOTO' });
            const video = yield prisma_1.default.mediaVideo.findUnique({ where: { id }, include: { category: true, album: true } });
            if (video)
                return Object.assign(Object.assign({}, video), { mediaType: 'VIDEO' });
            throw new Error('Media item not found');
        });
    }
    // Categories CRUD
    getAdminCategories(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where.name = { contains: query.search };
            }
            const [items, totalCount] = yield Promise.all([
                prisma_1.default.mediaCategory.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' }
                }),
                prisma_1.default.mediaCategory.count({ where })
            ]);
            return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
        });
    }
    createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaCategory.create({
                data: {
                    name: data.name,
                    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    status: data.status || 'ACTIVE'
                }
            });
        });
    }
    updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaCategory.update({
                where: { id },
                data: {
                    name: data.name,
                    slug: data.slug,
                    status: data.status
                }
            });
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaCategory.delete({ where: { id } });
        });
    }
    // Albums CRUD
    getAdminAlbums(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where.title = { contains: query.search };
            }
            const [items, totalCount] = yield Promise.all([
                prisma_1.default.mediaAlbum.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { title: 'asc' },
                    include: { category: true }
                }),
                prisma_1.default.mediaAlbum.count({ where })
            ]);
            return { items, totalCount, totalPages: Math.ceil(totalCount / limit) };
        });
    }
    createAlbum(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaAlbum.create({
                data: {
                    title: data.title,
                    slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    coverImage: data.coverImage,
                    categoryId: data.categoryId
                }
            });
        });
    }
    updateAlbum(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaAlbum.update({
                where: { id },
                data: {
                    title: data.title,
                    slug: data.slug,
                    coverImage: data.coverImage,
                    categoryId: data.categoryId
                }
            });
        });
    }
    deleteAlbum(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.mediaAlbum.delete({ where: { id } });
        });
    }
    // Increments for like/view buttons
    incrementViews(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'image') {
                return prisma_1.default.mediaImage.update({
                    where: { id },
                    data: { views: { increment: 1 } }
                });
            }
            else {
                return prisma_1.default.mediaVideo.update({
                    where: { id },
                    data: { views: { increment: 1 } }
                });
            }
        });
    }
    incrementLikes(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'image') {
                return prisma_1.default.mediaImage.update({
                    where: { id },
                    data: { likes: { increment: 1 } }
                });
            }
            else {
                return prisma_1.default.mediaVideo.update({
                    where: { id },
                    data: { likes: { increment: 1 } }
                });
            }
        });
    }
}
exports.MediaGalleryService = MediaGalleryService;
