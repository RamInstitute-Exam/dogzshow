import { Router } from 'express';
import { getActive, getAll, getById, create, update, remove, reorder } from '../controllers/heroBanner.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const publicRouter = Router();
publicRouter.get('/', getActive);

const adminRouter = Router();
adminRouter.get('/', authenticate, authorize(['Super Admin', 'Admin']), getAll);
adminRouter.get('/:id', authenticate, authorize(['Super Admin', 'Admin']), getById);
adminRouter.post('/', authenticate, authorize(['Super Admin', 'Admin']), create);
adminRouter.put('/:id', authenticate, authorize(['Super Admin', 'Admin']), update);
adminRouter.delete('/:id', authenticate, authorize(['Super Admin', 'Admin']), remove);
adminRouter.post('/reorder', authenticate, authorize(['Super Admin', 'Admin']), reorder);

export { publicRouter as publicHeroBannerRouter, adminRouter as adminHeroBannerRouter };
export default publicRouter;
