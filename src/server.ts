import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { connectRedis } from './services/redis.service';
import { importCSVIfNeeded } from './services/csv-import.service';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    await connectRedis();
    console.log('✅ Redis connected successfully');

    await importCSVIfNeeded();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

startServer();
