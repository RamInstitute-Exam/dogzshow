import { Router } from 'express';
import { getGlobal, updateGlobal, getPageBySlug, updatePage, getAllPages, getHomeCms, getEventsCms } from '../controllers/cms.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Global CMS
router.get('/global', getGlobal);
router.put('/global', authenticate, authorize(['Super Admin', 'Admin']), updateGlobal);

// Specific CMS endpoints for Frontend
router.get('/home', getHomeCms);
router.get('/events', getEventsCms);

// Page CMS
router.get('/pages', getAllPages); // Important: /pages must be before /:slug so 'pages' is not treated as a slug
router.get('/:slug', getPageBySlug);
router.put('/:slug', authenticate, authorize(['Super Admin', 'Admin']), updatePage);

export default router;
