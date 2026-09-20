import { clerkClient } from '@clerk/express';
import { db } from '../prisma/db.js';

export class UserSyncError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
    ) {
        super(message);
        this.name = 'UserSyncError';
    }
}

/**
 * Gets an existing DropZone application user by clerkId or automatically syncs/creates a new
 * application user from Clerk metadata if none exists in PostgreSQL.
 *
 * @param clerkUserId Authenticated Clerk user ID from getAuth(req)
 * @returns DropZone application user record from database
 */
export async function getOrCreateUser(clerkUserId: string) {
    // 1. Look up existing application User by clerkId
    let user = await db.orm.public.User.first({
        clerkId: clerkUserId,
    });

    if (user) {
        return user;
    }

    // 2. Fetch user information from Clerk integration
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        throw new UserSyncError('User email not found', 400);
    }

    const name =
        [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(' ') || null;
    const username = clerkUser.username ?? null;

    // 3. Create application User in database with concurrency handling
    try {
        user = await db.orm.public.User.create({
            clerkId: clerkUserId,
            email,
            username,
            name,
        });

        return user;
    } catch (error) {
        // In case of a race condition where a concurrent request created the User
        const existingUser = await db.orm.public.User.first({
            clerkId: clerkUserId,
        });

        if (existingUser) {
            return existingUser;
        }

        const existingUserByEmail = await db.orm.public.User.first({
            email,
        });

        if (existingUserByEmail) {
            return existingUserByEmail;
        }

        throw error;
    }
}
