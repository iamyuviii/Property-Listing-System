import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';
import { connectRedis } from './services/redis.service';
import { importCSVIfNeeded } from './services/csv-import.service';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    await connectRedis();
    await importCSVIfNeeded();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

startServer(); 