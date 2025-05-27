import { Router } from 'express';
import { addFavorite, removeFavorite, listFavorites } from '../controllers/favorite.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, listFavorites);
router.post('/', auth, addFavorite);
router.delete('/:id', auth, removeFavorite);

export default router;