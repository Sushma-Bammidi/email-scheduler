import dotenv from 'dotenv';
import { ConnectionOptions } from 'bullmq';

dotenv.config();

export const redisOptions: ConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};
