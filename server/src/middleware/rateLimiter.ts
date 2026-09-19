import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';

export const downloadRateLimiter = rateLimit({
    windowMs: 60 * 1000,

    limit: 5,

    standardHeaders: 'draft-8',
    legacyHeaders: false,

    store: new RedisStore({
        // @ts-expect-error - ioredis call returns Promise<unknown> which satisfies RedisReply at runtime
        sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    }),

    message: {
        error: 'Too many download requests. Please try again later.',
    },
});