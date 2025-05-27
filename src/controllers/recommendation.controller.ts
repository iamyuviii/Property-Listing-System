import User from '../models/user.model';
import Property from '../models/property.model';
import { Request, Response } from 'express';

export const recommendProperty = async (req: any, res: Response) => {
  const { recipientEmail, propertyId } = req.body;
  try {
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if recipient exists
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if sender is not recommending to themselves
    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot recommend to yourself' });
    }

    // Check if property is already recommended
    if (recipient.recommendationsReceived.includes(propertyId)) {
      return res.status(400).json({ message: 'Property already recommended to this user' });
    }

    // Add recommendation
    recipient.recommendationsReceived.push(propertyId);
    await recipient.save();

    res.json({ 
      message: 'Property recommended successfully',
      recipient: {
        email: recipient.email,
        id: recipient._id
      },
      property: {
        id: property._id,
        title: property.title
      }
    });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ message: 'Error recommending property' });
  }
};

export const listRecommendations = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'recommendationsReceived',
        select: 'title type price city state areaSqFt bedrooms bathrooms amenities rating'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      recommendations: user.recommendationsReceived,
      count: user.recommendationsReceived.length
    });
  } catch (err) {
    console.error('List recommendations error:', err);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};

export const searchUsers = async (req: any, res: Response) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    }).select('email');

    res.json({
      users,
      count: users.length
    });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ message: 'Error searching users' });
  }
}; 