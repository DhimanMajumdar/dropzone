import { Router } from 'express';
import { getAuth } from '@clerk/express';

import { db } from '../prisma/db';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }

        // Find the DropZone user using Clerk ID
        const user = await db.orm.public.User.first({
            clerkId: userId,
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Get all files and share links.
        // We filter them by ownership on the server.
        const [allFiles, allShareLinks] =
            await Promise.all([
                db.orm.public.File.all(),
                db.orm.public.ShareLink.all(),
            ]);

        const userFiles = allFiles.filter(
            (file) => file.ownerId === user.id,
        );

        const userFileIds = new Set(
            userFiles.map((file) => file.id),
        );

        const userShareLinks =
            allShareLinks.filter((shareLink) =>
                userFileIds.has(shareLink.fileId),
            );

        const files = userFiles.map((file) => {
            const shareLinks =
                userShareLinks.filter(
                    (shareLink) =>
                        shareLink.fileId === file.id,
                );

            return {
                id: file.id,
                originalName: file.originalName,
                size: Number(file.size),
                mimeType: file.mimeType,
                storageKey: file.storageKey,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,

                shareLinks: shareLinks.map(
                    (shareLink) => ({
                        id: shareLink.id,
                        token: shareLink.token,
                        expiresAt:
                            shareLink.expiresAt,
                        maxDownloads:
                            shareLink.maxDownloads,
                        downloadCount:
                            shareLink.downloadCount,
                        deleteAfterDownload:
                            shareLink.deleteAfterDownload,
                        revoked:
                            shareLink.revoked,
                        createdAt:
                            shareLink.createdAt,
                        updatedAt:
                            shareLink.updatedAt,
                    }),
                ),
            };
        });

        const totalFiles = files.length;

        const totalShareLinks =
            userShareLinks.length;

        const totalDownloads =
            userShareLinks.reduce(
                (total, shareLink) =>
                    total +
                    shareLink.downloadCount,
                0,
            );

        return res.json({
            stats: {
                totalFiles,
                totalShareLinks,
                totalDownloads,
            },
            files,
        });
    } catch (error) {
        console.error(
            'Failed to load dashboard:',
            error,
        );

        return res.status(500).json({
            error: 'Failed to load dashboard',
        });
    }
});

export default router;