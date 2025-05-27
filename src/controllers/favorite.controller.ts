import User from '../models/user.model';
import Property from '../models/property.model';
import { Request, Response } from 'express';

export const addFavorite = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.favorites.includes(req.body.propertyId)) {
      user.favorites.push(req.body.propertyId);
      await user.save();
    }
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(400).json({ message: 'Add favorite error' });
  }
};

export const removeFavorite = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.favorites = user.favorites.filter((id) => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(400).json({ message: 'Remove favorite error' });
  }
};

export const listFavorites = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites);
  } catch (err) {
    res.status(400).json({ message: 'List favorites error' });
  }
}; 