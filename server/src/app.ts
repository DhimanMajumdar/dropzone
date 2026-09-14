import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express';
import { db } from './prisma/db'

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
    });
});

app.get('/api/me', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    try {
        // Get user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return res.status(400).json({
                error: 'User email not found',
            });
        }

        // Find existing DropZone user
        let user = await db.orm.public.User.first({
            clerkId: userId,
        });

        // Create DropZone user if it doesn't exist
        if (!user) {
            user = await db.orm.public.User.create({
                clerkId: userId,
                email,
                username: clerkUser.username ?? null,
                name:
                    [clerkUser.firstName, clerkUser.lastName]
                        .filter(Boolean)
                        .join(' ') || null,
            });
        }

        return res.json({
            id: user.id,
            clerkUserId: user.clerkId,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    } catch (error) {
        console.error('Failed to sync user:', error);

        return res.status(500).json({
            error: 'Failed to sync user',
        });
    }
});

export default app;