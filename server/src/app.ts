import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express';
import { db } from './prisma/db'

import dashboardRoutes from './routes/dashboard.routes';

import { createDownloadUrl, createUploadUrl } from './services/s3.service';
import crypto from 'crypto';

import { downloadRateLimiter } from './middleware/rateLimiter';

import { fileCleanupQueue } from './queues/fileCleanup.queue';

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
    });
});

app.use('/api/dashboard', dashboardRoutes);

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

app.post('/api/files/upload-url', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
        return res.status(400).json({
            error: 'fileName and contentType are required',
        });
    }

    try {
        const storageKey = `files/${userId}/${crypto.randomUUID()}-${fileName}`;

        const uploadUrl = await createUploadUrl(
            storageKey,
            contentType,
        );

        return res.json({
            uploadUrl,
            storageKey,
        });
    } catch (error) {
        console.error('Failed to create upload URL:', error);

        return res.status(500).json({
            error: 'Failed to create upload URL',
        });
    }
});

app.post('/api/files', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    const { originalName, storageKey, mimeType, size } = req.body;

    if (!originalName || !storageKey || !size) {
        return res.status(400).json({
            error: 'originalName, storageKey and size are required',
        });
    }

    try {
        const user = await db.orm.public.User.first({
            clerkId: userId,
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        const file = await db.orm.public.File.create({
            originalName,
            storageKey,
            mimeType: mimeType || null,
            size: BigInt(size),
            ownerId: user.id,
        });

        return res.status(201).json({
            id: file.id,
            originalName: file.originalName,
            storageKey: file.storageKey,
            mimeType: file.mimeType,
            size: file.size.toString(),
        });
    } catch (error) {
        console.error('Failed to save file:', error);

        return res.status(500).json({
            error: 'Failed to save file',
        });
    }
});

app.post('/api/share-links', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    const {
        fileId,
        expiresAt,
        maxDownloads,
        passwordHash,
        deleteAfterDownload,
    } = req.body;

    if (!fileId) {
        return res.status(400).json({
            error: 'fileId is required',
        });
    }

    try {
        // Find logged-in user
        const user = await db.orm.public.User.first({
            clerkId: userId,
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Find file
        const file = await db.orm.public.File.first({
            id: Number(fileId),
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found',
            });
        }

        // Ownership check
        if (file.ownerId !== user.id) {
            return res.status(403).json({
                error: 'You do not own this file',
            });
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Create share link
        const shareLink = await db.orm.public.ShareLink.create({
            token,
            fileId: file.id,
            expiresAt: expiresAt || null,
            maxDownloads: maxDownloads
                ? Number(maxDownloads)
                : null,
            passwordHash: passwordHash || null,
            deleteAfterDownload: Boolean(deleteAfterDownload),
        });

        return res.status(201).json({
            id: shareLink.id,
            token: shareLink.token,
            fileId: shareLink.fileId,
            expiresAt: shareLink.expiresAt,
            maxDownloads: shareLink.maxDownloads,
            deleteAfterDownload: shareLink.deleteAfterDownload,
            shareUrl: `http://localhost:3000/share/${shareLink.token}`,
        });
    } catch (error) {
        console.error('Failed to create share link:', error);

        return res.status(500).json({
            error: 'Failed to create share link',
        });
    }
});

app.get('/api/share-links/:token/download', downloadRateLimiter, async (req, res) => {
    const token = req.params.token;

    if (!token || typeof token !== 'string') {
        return res.status(400).json({
            error: 'Share token is required',
        });
    }

    try {
        // 1. Find the share link
        const shareLink = await db.orm.public.ShareLink.first({
            token,
        });

        if (!shareLink) {
            return res.status(404).json({
                error: 'Share link not found',
            });
        }

        // 2. Check if the link is revoked
        if (shareLink.revoked) {
            return res.status(403).json({
                error: 'Share link has been revoked',
            });
        }

        // 3. Check if the link has expired
        if (
            shareLink.expiresAt &&
            new Date(shareLink.expiresAt) <= new Date()
        ) {
            return res.status(410).json({
                error: 'Share link has expired',
            });
        }

        // 4. Check download limit
        if (
            shareLink.maxDownloads !== null &&
            shareLink.downloadCount >= shareLink.maxDownloads
        ) {
            return res.status(410).json({
                error: 'Download limit reached',
            });
        }

        // 5. Find the actual file
        const file = await db.orm.public.File.first({
            id: shareLink.fileId,
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found',
            });
        }

        // 6. Record this download
        await db.orm.public.Download.create({
            shareLinkId: shareLink.id,
            ipAddress: req.ip || null,
            userAgent: req.get('user-agent') || null,
        });

        // 7. Increment download count
        await db.orm.public.ShareLink.where({
            id: shareLink.id,
        }).update({
            downloadCount: shareLink.downloadCount + 1,
        });

        // 8. Generate temporary S3 download URL
        const downloadUrl = await createDownloadUrl(
            file.storageKey,
        );

        // 9. Schedule cleanup if "delete after download" is enabled
        if (shareLink.deleteAfterDownload) {
            await fileCleanupQueue.add(
                'delete-after-download',
                {
                    fileId: file.id,
                    storageKey: file.storageKey,
                },
                {
                    delay: 5 * 60 * 1000,
                    jobId: `delete-file-${file.id}`,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            );

            console.log(
                `Cleanup scheduled for file ${file.id}`,
            );
        }

        // 10. Return download URL
        return res.json({
            downloadUrl,
            fileName: file.originalName,
        });
    } catch (error) {
        console.error(
            'Failed to create download URL:',
            error,
        );

        return res.status(500).json({
            error: 'Failed to create download URL',
        });
    }
});

export default app;