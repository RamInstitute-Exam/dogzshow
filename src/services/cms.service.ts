import prisma from '../prisma';

export class CmsService {
  async getGlobal() {
    let globalData = await prisma.cmsGlobal.findFirst();
    if (!globalData) {
      globalData = await prisma.cmsGlobal.create({
        data: {
          title: 'JuzDog Global Config',
          seoTitle: 'JuzDog | Global Network',
          status: 'ACTIVE'
        }
      });
    }
    return globalData;
  }

  async updateGlobal(data: any) {
    let globalData = await prisma.cmsGlobal.findFirst();
    if (globalData) {
      return prisma.cmsGlobal.update({
        where: { id: globalData.id },
        data
      });
    } else {
      return prisma.cmsGlobal.create({
        data
      });
    }
  }

  async getPageBySlug(slug: string) {
    let pageData = await prisma.cmsPage.findUnique({
      where: { slug }
    });

    if (!pageData) {
      // Auto-seed if missing so frontend never breaks
      pageData = await prisma.cmsPage.create({
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
  }

  async updatePage(slug: string, data: any) {
    const page = await this.getPageBySlug(slug);
    return prisma.cmsPage.update({
      where: { id: page.id },
      data
    });
  }

  async getAllPages() {
    return prisma.cmsPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
