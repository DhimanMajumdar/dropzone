import express from 'express';
import cors from 'cors';
import { db } from './prisma/db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
    try {
        const users = await db.orm.public.User.all();

        res.json({
            status: 'ok',
            database: 'connected',
            users: users.length,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'error',
            database: 'disconnected',
        });
    }
});

export default app;