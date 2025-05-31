import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import favoriteRoutes from './routes/fav.routes';
import recommendationRoutes from './routes/recommendation.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check / Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🏠 Property Listing API is running',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      favorites: '/api/favorites',
      recommendations: '/api/recommendations',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Global error handler
app.use(errorHandler);

export default app;
