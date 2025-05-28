import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/property.model';
import User from '../models/user.model';

dotenv.config();

const clearProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hypergro:hypergro123@cluster0.mongodb.net/hypergro?retryWrites=true&w=majority');
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