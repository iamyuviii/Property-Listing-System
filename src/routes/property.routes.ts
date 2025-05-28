import { Router } from 'express';
import { createProperty, getProperties, getProperty, updateProperty, deleteProperty } from '../controllers/property.controller';
import { auth } from '../middlewares/auth.middleware';
import Property from '../models/property.model';
import User from '../models/user.model';

const router = Router();

// Temporary route to clear properties and system user
router.delete('/clear-all', async (req, res) => {
  try {
    await Property.deleteMany({});
    await User.deleteOne({ email: 'system@hypergro.com' });
    res.json({ message: 'Properties and system user cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing data', error });
  }
});

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', auth, createProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

export default router; 