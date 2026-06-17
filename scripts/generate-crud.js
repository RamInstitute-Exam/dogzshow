const fs = require('fs');
const path = require('path');

const models = [
  { name: 'ClubCategory', camel: 'clubCategory', route: 'club-categories' },
  { name: 'ClubEvent', camel: 'clubEvent', route: 'club-events' },
  { name: 'ClubGallery', camel: 'clubGallery', route: 'club-galleries' },
  { name: 'ClubCommittee', camel: 'clubCommittee', route: 'club-committees' },
];

const basePath = path.join(__dirname, '..', 'src');

models.forEach((m) => {
  // Repository
  const repoContent = `import prisma from '../prisma';

export class ${m.name}Repository {
  async findAll(params: any) { return prisma.${m.camel}.findMany(params); }
  async count(where?: any) { return prisma.${m.camel}.count({ where }); }
  async findById(id: string) { return prisma.${m.camel}.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.${m.camel}.create({ data }); }
  async update(id: string, data: any) { return prisma.${m.camel}.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.${m.camel}.delete({ where: { id } }); }
  async bulkDelete(ids: string[]) { return prisma.${m.camel}.deleteMany({ where: { id: { in: ids } } }); }
}
`;
  fs.writeFileSync(path.join(basePath, 'repositories', `${m.camel}.repository.ts`), repoContent);

  // Service
  const serviceContent = `import { ${m.name}Repository } from '../repositories/${m.camel}.repository';

export class ${m.name}Service {
  private repository = new ${m.name}Repository();

  async getAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    let where: any = {};
    if (query.clubId) where.clubId = query.clubId;
    
    const [data, total] = await Promise.all([
      this.repository.findAll({ skip: (page - 1) * limit, take: limit, where }),
      this.repository.count(where)
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) { return this.repository.findById(id); }
  async create(data: any) { return this.repository.create(data); }
  async update(id: string, data: any) { return this.repository.update(id, data); }
  async delete(id: string) { return this.repository.delete(id); }
  async bulkDelete(ids: string[]) { return this.repository.bulkDelete(ids); }
}
`;
  fs.writeFileSync(path.join(basePath, 'services', `${m.camel}.service.ts`), serviceContent);

  // Controller
  const controllerContent = `import { Request, Response } from 'express';
import { ${m.name}Service } from '../services/${m.camel}.service';

const service = new ${m.name}Service();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.getAll(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.delete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.bulkDelete(req.body.ids);
    res.status(200).json({ success: true });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};
`;
  fs.writeFileSync(path.join(basePath, 'controllers', `${m.camel}.controller.ts`), controllerContent);

  // Routes
  const routeContent = `import { Router } from 'express';
import { getAll, getById, create, update, remove, bulkRemove } from '../controllers/${m.camel}.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public', getAll);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.patch('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);

export default router;
`;
  fs.writeFileSync(path.join(basePath, 'routes', `${m.camel}.routes.ts`), routeContent);

});

console.log('CRUD generated successfully');
