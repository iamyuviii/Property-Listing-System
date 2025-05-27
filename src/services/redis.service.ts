import Redis from 'ioredis';

let redis: Redis | null = null;

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL not set');
  redis = new Redis(process.env.REDIS_URL);
  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));
};

export const getRedis = () => {
  if (!redis) throw new Error('Redis not connected');
  return redis;
}; 