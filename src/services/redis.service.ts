import Redis from 'ioredis';

let redis: Redis | null = null;

export const connectRedis = async () => {
  try {
    redis = new Redis({
      host: 'redis-16559.c84.us-east-1-2.ec2.redns.redis-cloud.com',
      port: 16559,
      username: 'default',
      password: 'Y8ejiYONBMCWNmXp7mL2F0ZmKosocdV4',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
      // Test the connection
      redis?.set('test', 'Redis connection test')
        .then(() => redis?.get('test'))
        .then((result) => {
          console.log('Redis test result:', result);
        })
        .catch((err) => {
          console.error('Redis test error:', err);
        });
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('ready', () => {
      console.log('Redis client ready');
    });

    redis.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });

  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedis = () => {
  if (!redis) {
    throw new Error('Redis client not initialized. Make sure to call connectRedis() first.');
  }
  return redis;
}; 