import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express';
import { db } from './prisma/db.js';
import bcrypt from 'bcryptjs';

import dashboardRoutes from './routes/dashboard.routes.js';
import shareLinksRoutes from './routes/share-links.routes.js';
import filesRoutes from './routes/files.routes.js';



import { createDownloadUrl, createUploadUrl } from './services/s3.service.js';
import { getOrCreateUser, UserSyncError } from './services/user.service.js';
import crypto from 'crypto';

import { downloadRateLimiter } from './middleware/rateLimiter.js';

import { fileCleanupQueue } from './queues/fileCleanup.queue.js';

const app = express();

app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'https://dropzone-dusky.vercel.app',
        ],
        credentials: true,
    }),
);
app.use(express.json());

app.use(clerkMiddleware());

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
    });
});



app.use('/api/dashboard', dashboardRoutes);
app.use('/api/share-links', shareLinksRoutes);
app.use('/api/files', filesRoutes);

app.get('/api/me', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    try {
        const user = await getOrCreateUser(userId);

        return res.json({
            id: user.id,
            clerkUserId: user.clerkId,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    } catch (error: any) {
        if (error instanceof UserSyncError || error?.statusCode === 400 || error?.message === 'User email not found') {
            return res.status(error?.statusCode || 400).json({
                error: error.message || 'User email not found',
            });
        }

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
        const user = await getOrCreateUser(userId);

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
    } catch (error: any) {
        if (error instanceof UserSyncError || error?.statusCode === 400 || error?.message === 'User email not found') {
            return res.status(error?.statusCode || 400).json({
                error: error.message || 'User email not found',
            });
        }

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
        password,
        passwordHash: rawPasswordHash,
        deleteAfterDownload,
    } = req.body;

    if (!fileId) {
        return res.status(400).json({
            error: 'fileId is required',
        });
    }

    try {
        // Find or sync logged-in user
        const user = await getOrCreateUser(userId);

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

        let passwordHash: string | null = null;
        if (password && typeof password === 'string' && password.trim().length > 0) {
            if (password.length > 128) {
                return res.status(400).json({
                    error: 'Password is too long (maximum 128 characters)',
                });
            }
            passwordHash = await bcrypt.hash(password.trim(), 12);
        } else if (rawPasswordHash && typeof rawPasswordHash === 'string') {
            passwordHash = rawPasswordHash;
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
            passwordHash,
            deleteAfterDownload: Boolean(deleteAfterDownload),
        });

        return res.status(201).json({
            id: shareLink.id,
            token: shareLink.token,
            fileId: shareLink.fileId,
            expiresAt: shareLink.expiresAt,
            maxDownloads: shareLink.maxDownloads,
            deleteAfterDownload: shareLink.deleteAfterDownload,
            shareUrl: `${process.env.CLIENT_URL}/share/${shareLink.token}`,
        });
    } catch (error: any) {
        if (error instanceof UserSyncError || error?.statusCode === 400 || error?.message === 'User email not found') {
            return res.status(error?.statusCode || 400).json({
                error: error.message || 'User email not found',
            });
        }

        console.error('Failed to create share link:', error);

        return res.status(500).json({
            error: 'Failed to create share link',
        });
    }
});

const handleDownloadRequest = async (req: express.Request, res: express.Response) => {
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

        // 5. Verify Password (if password-protected)
        if (shareLink.passwordHash) {
            const password = req.body?.password;

            if (!password || typeof password !== 'string' || password.trim().length === 0) {
                return res.status(401).json({
                    error: 'Password required',
                    code: 'PASSWORD_REQUIRED',
                });
            }

            const isPasswordValid = await bcrypt.compare(password, shareLink.passwordHash);

            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Incorrect password',
                    code: 'INVALID_PASSWORD',
                });
            }
        }

        // 6. Find the actual file
        const file = await db.orm.public.File.first({
            id: shareLink.fileId,
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found',
            });
        }

        // 7. Record this download
        await db.orm.public.Download.create({
            shareLinkId: shareLink.id,
            ipAddress: req.ip || null,
            userAgent: req.get('user-agent') || null,
        });

        // 8. Increment download count
        await db.orm.public.ShareLink.where({
            id: shareLink.id,
        }).update({
            downloadCount: shareLink.downloadCount + 1,
        });

        // 9. Generate temporary S3 download URL
        const downloadUrl = await createDownloadUrl(
            file.storageKey,
        );

        // 10. Schedule cleanup if "delete after download" is enabled
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

        // 11. Return download URL
        return res.json({
            downloadUrl,
            fileName: file.originalName,
        });
    } catch (error) {
        console.error(
            'Failed to process download request:',
            error,
        );

        return res.status(500).json({
            error: 'Failed to process download request',
        });
    }
};

app.post('/api/share-links/:token/download', downloadRateLimiter, handleDownloadRequest);
app.get('/api/share-links/:token/download', downloadRateLimiter, handleDownloadRequest);

export default app;