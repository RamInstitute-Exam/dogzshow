import { Router } from 'express';
import { getPosts, createPost } from '../controllers/social.controller';
// import { authenticateToken } from '../middlewares/auth'; // To be updated later

const router = Router();

router.get('/posts', getPosts);
router.post('/posts', createPost); // Should be protected by authenticateToken

export default router;
