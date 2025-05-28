import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/property.model';
import User from '../models/user.model';

dotenv.config();

const clearProperties = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Property.deleteMany({});
    console.log('All properties cleared successfully');

    await User.deleteOne({ email: 'system@hypergro.com' });
    console.log('System user cleared (will be recreated on next import)');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearProperties(); 