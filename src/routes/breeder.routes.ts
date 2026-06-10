import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Breeder routes placeholder' });
});

export default router;
