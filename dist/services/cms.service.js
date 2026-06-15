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
exports.CmsService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class CmsService {
    getGlobal() {
        return __awaiter(this, void 0, void 0, function* () {
            let globalData = yield prisma_1.default.cmsGlobal.findFirst();
            if (!globalData) {
                globalData = yield prisma_1.default.cmsGlobal.create({
                    data: {
                        title: 'JuzDog Global Config',
                        seoTitle: 'JuzDog | Global Network',
                        status: 'ACTIVE'
                    }
                });
            }
            return globalData;
        });
    }
    updateGlobal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let globalData = yield prisma_1.default.cmsGlobal.findFirst();
            if (globalData) {
                return prisma_1.default.cmsGlobal.update({
                    where: { id: globalData.id },
                    data
                });
            }
            else {
                return prisma_1.default.cmsGlobal.create({
                    data
                });
            }
        });
    }
    getPageBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageData = yield prisma_1.default.cmsPage.findUnique({
                where: { slug }
            });
            if (!pageData) {
                // Auto-seed if missing so frontend never breaks
                pageData = yield prisma_1.default.cmsPage.create({
                    data: {
                        slug,
                        title: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
                        subtitle: `Welcome to the ${slug} page`,
                        seoTitle: `JuzDog | ${slug}`,
                        status: 'ACTIVE'
                    }
                });
            }
            return pageData;
        });
    }
    updatePage(slug, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.getPageBySlug(slug);
            return prisma_1.default.cmsPage.update({
                where: { id: page.id },
                data
            });
        });
    }
    getAllPages() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.cmsPage.findMany({
                orderBy: { createdAt: 'desc' }
            });
        });
    }
}
exports.CmsService = CmsService;
