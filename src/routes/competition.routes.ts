import { Router } from 'express';
import { getMatches, scoreMatch } from '../controllers/competition.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/matches', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'JUDGE']), getMatches);
router.post('/matches/score', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'JUDGE']), scoreMatch);

export default router;
