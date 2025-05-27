import { Router } from 'express';
import { recommendProperty, listRecommendations, searchUsers } from '../controllers/recommendation.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/search', auth, searchUsers);
router.get('/', auth, listRecommendations);
router.post('/', auth, recommendProperty);

export default router;