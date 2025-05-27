import { Router } from 'express';
import { createProperty, getProperties, getProperty, updateProperty, deleteProperty } from '../controllers/property.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', auth, createProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

export default router; 