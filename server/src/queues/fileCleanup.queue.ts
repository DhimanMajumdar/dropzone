import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const fileCleanupQueue = new Queue(
    'file-cleanup',
    {
        connection: redis,
    },
);