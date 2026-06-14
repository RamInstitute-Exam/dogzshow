import os

base_dir = "d:/Our Projects/DogProfileApp/backend/src"

models = [
    "Club", "Event", "EventCategory", "Judge", "CompetitionRound", "CompetitionMatch", "Winner", "WinnerTag",
    "Payment", "Refund", "Notification", "NotificationTemplate", "MediaGallery", "EventGallery", "FAQ",
    "Testimonial", "Sponsor", "Banner", "PageBanner", "HomepageBanner", "Report", "Role", "Permission",
    "FCIGroup", "Breed", "AgeClass"
]

def lowercase_first(s):
    return s[0].lower() + s[1:] if s else s

def pluralize(s):
    if s.endswith('s'): return s + "es"
    if s.endswith('y'): return s[:-1] + "ies"
    return s + "s"

for model in models:
    lower_model = lowercase_first(model)
    route_name = lowercase_first(model)
    
    # 1. Repository
    repo_code = f"""import prisma from '../prisma';
import {{ Prisma }} from '@prisma/client';

export class {model}Repository {{
  async findAll(params: {{
    skip?: number;
    take?: number;
    where?: Prisma.{model}WhereInput;
    orderBy?: Prisma.{model}OrderByWithRelationInput;
  }}) {{
    const {{ skip, take, where, orderBy }} = params;
    return prisma.{lower_model}.findMany({{
      skip, take, where, orderBy
    }});
  }}

  async count(where?: Prisma.{model}WhereInput) {{
    return prisma.{lower_model}.count({{ where }});
  }}

  async findById(id: string) {{
    return prisma.{lower_model}.findUnique({{ where: {{ id }} }});
  }}

  async create(data: Prisma.{model}CreateInput | Prisma.{model}UncheckedCreateInput) {{
    return prisma.{lower_model}.create({{ data }});
  }}

  async update(id: string, data: Prisma.{model}UpdateInput | Prisma.{model}UncheckedUpdateInput) {{
    return prisma.{lower_model}.update({{ where: {{ id }}, data }});
  }}

  async delete(id: string) {{
    // Checking if deletedAt exists on schema, falling back to hard delete if not
    try {{
      return await (prisma.{lower_model} as any).update({{
        where: {{ id }},
        data: {{ deletedAt: new Date() }}
      }});
    }} catch (e) {{
      return prisma.{lower_model}.delete({{ where: {{ id }} }});
    }}
  }}

  async bulkDelete(ids: string[]) {{
    try {{
      return await (prisma.{lower_model} as any).updateMany({{
        where: {{ id: {{ in: ids }} }},
        data: {{ deletedAt: new Date() }}
      }});
    }} catch(e) {{
      return prisma.{lower_model}.deleteMany({{
        where: {{ id: {{ in: ids }} }}
      }});
    }}
  }}
}}
"""
    with open(os.path.join(base_dir, f"repositories/{route_name}.repository.ts"), "w") as f:
        f.write(repo_code)

    # 2. Service
    service_code = f"""import {{ {model}Repository }} from '../repositories/{route_name}.repository';

export class {model}Service {{
  private repository: {model}Repository;

  constructor() {{
    this.repository = new {model}Repository();
  }}

  async getAll(query: any) {{
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let where: any = {{}};
    if (query.search) {{
      // basic fallback search implementation
      where.OR = [
        {{ name: {{ contains: query.search }} }},
        {{ title: {{ contains: query.search }} }}
      ].filter(x => Object.keys(x).length > 0);
    }}

    try {{
      const [data, total] = await Promise.all([
        this.repository.findAll({{ skip: (page - 1) * limit, take: limit, where }}),
        this.repository.count(where)
      ]);
      return {{ data, total, page, limit, totalPages: Math.ceil(total / limit) }};
    }} catch (e) {{
      // Fallback for models without name/title fields
      const [data, total] = await Promise.all([
        this.repository.findAll({{ skip: (page - 1) * limit, take: limit }}),
        this.repository.count()
      ]);
      return {{ data, total, page, limit, totalPages: Math.ceil(total / limit) }};
    }}
  }}

  async getById(id: string) {{
    const item = await this.repository.findById(id);
    if (!item) throw new Error('{model} not found');
    return item;
  }}

  async create(data: any) {{
    return await this.repository.create(data);
  }}

  async update(id: string, data: any) {{
    return await this.repository.update(id, data);
  }}

  async delete(id: string) {{
    return await this.repository.delete(id);
  }}

  async bulkDelete(ids: string[]) {{
    return await this.repository.bulkDelete(ids);
  }}
}}
"""
    with open(os.path.join(base_dir, f"services/{route_name}.service.ts"), "w") as f:
        f.write(service_code)

    # 3. Controller
    controller_code = f"""import {{ Request, Response }} from 'express';
import {{ {model}Service }} from '../services/{route_name}.service';

const service = new {model}Service();

export const getAll = async (req: Request, res: Response): Promise<void> => {{
  try {{
    const result = await service.getAll(req.query);
    res.status(200).json({{ success: true, message: 'Retrieved successfully', ...result }});
  }} catch (error: any) {{
    res.status(500).json({{ success: false, message: error.message }});
  }}
}};

export const getById = async (req: Request, res: Response): Promise<void> => {{
  try {{
    const data = await service.getById(req.params.id as string);
    res.status(200).json({{ success: true, data }});
  }} catch (error: any) {{
    res.status(404).json({{ success: false, message: error.message }});
  }}
}};

export const create = async (req: Request, res: Response): Promise<void> => {{
  try {{
    const data = await service.create(req.body);
    res.status(201).json({{ success: true, message: 'Created successfully', data }});
  }} catch (error: any) {{
    res.status(400).json({{ success: false, message: error.message }});
  }}
}};

export const update = async (req: Request, res: Response): Promise<void> => {{
  try {{
    const data = await service.update(req.params.id as string, req.body);
    res.status(200).json({{ success: true, message: 'Updated successfully', data }});
  }} catch (error: any) {{
    res.status(400).json({{ success: false, message: error.message }});
  }}
}};

export const remove = async (req: Request, res: Response): Promise<void> => {{
  try {{
    await service.delete(req.params.id as string);
    res.status(200).json({{ success: true, message: 'Deleted successfully' }});
  }} catch (error: any) {{
    res.status(500).json({{ success: false, message: error.message }});
  }}
}};

export const bulkRemove = async (req: Request, res: Response): Promise<void> => {{
  try {{
    await service.bulkDelete(req.body.ids);
    res.status(200).json({{ success: true, message: 'Bulk deleted successfully' }});
  }} catch (error: any) {{
    res.status(500).json({{ success: false, message: error.message }});
  }}
}};
"""
    with open(os.path.join(base_dir, f"controllers/{route_name}.controller.ts"), "w") as f:
        f.write(controller_code)

    # 4. Routes
    routes_code = f"""import {{ Router }} from 'express';
import {{ getAll, getById, create, update, remove, bulkRemove }} from '../controllers/{route_name}.controller';
import {{ authenticate, authorize }} from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
router.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
router.post('/bulk-delete', authenticate, authorize(['Super Admin', 'Admin']), bulkRemove);

export default router;
"""
    with open(os.path.join(base_dir, f"routes/{route_name}.routes.ts"), "w") as f:
        f.write(routes_code)

print("All advanced CRUD implementations successfully generated!")
