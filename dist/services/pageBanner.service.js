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
exports.PageBannerService = void 0;
const pageBanner_repository_1 = require("../repositories/pageBanner.repository");
const prisma_1 = __importDefault(require("../prisma"));
class PageBannerService {
    constructor() {
        this.repository = new pageBanner_repository_1.PageBannerRepository();
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            let where = {};
            if (query.search) {
                // basic fallback search implementation
                where.OR = [
                    { name: { contains: query.search } },
                    { title: { contains: query.search } }
                ].filter(x => Object.keys(x).length > 0);
            }
            try {
                const [data, total] = yield Promise.all([
                    this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
                    this.repository.count(where)
                ]);
                return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
            }
            catch (e) {
                // Fallback for models without name/title fields
                const [data, total] = yield Promise.all([
                    this.repository.findAll({ skip: (page - 1) * limit, take: limit }),
                    this.repository.count()
                ]);
                return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
            }
        });
    }
    getById(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            let item;
            // Check if it's a valid UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
            if (isUuid) {
                item = yield this.repository.findById(idOrSlug);
            }
            else {
                // It's a slug
                item = yield prisma_1.default.pageBanner.findUnique({
                    where: { pageSlug: idOrSlug }
                });
                if (!item) {
                    // Auto-seed if it's a valid slug so frontend doesn't 404
                    const bannerImageMap = {
                        about: '/images/about_banner.png',
                        events: '/images/events_banner.png',
                        contact: '/images/contact_banner.png',
                        judges: '/images/judges_banner.png',
                        winners: '/images/winners_banner.png',
                        gallery: '/images/gallery_banner.png',
                        registration: '/images/registration_banner.png'
                    };
                    const bannerImage = bannerImageMap[idOrSlug] || '/images/hero_banner.png';
                    item = yield prisma_1.default.pageBanner.create({
                        data: {
                            pageSlug: idOrSlug,
                            title: idOrSlug.charAt(0).toUpperCase() + idOrSlug.slice(1).replace('-', ' '),
                            bannerImage,
                            isActive: true
                        }
                    });
                }
            }
            if (!item)
                throw new Error('PageBanner not found');
            return item;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.update(id, data);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.delete(id);
        });
    }
    bulkDelete(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.bulkDelete(ids);
        });
    }
}
exports.PageBannerService = PageBannerService;
