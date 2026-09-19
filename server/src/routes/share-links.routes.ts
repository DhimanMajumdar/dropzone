import { Router } from 'express';
import { getAuth } from '@clerk/express';

import { db } from '../prisma/db';

const router = Router();

router.post('/:id/revoke', async (req, res) => {
    const { userId } = getAuth(req);
    const shareLinkId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    if (!Number.isInteger(shareLinkId)) {
        return res.status(400).json({
            error: 'Invalid share link ID',
        });
    }

    try {
        // Find the current DropZone user
        const user = await db.orm.public.User.first({
            clerkId: userId,
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Find the share link
        const shareLink =
            await db.orm.public.ShareLink.first({
                id: shareLinkId,
            });

        if (!shareLink) {
            return res.status(404).json({
                error: 'Share link not found',
            });
        }

        // Find the file belonging to this share link
        const file = await db.orm.public.File.first({
            id: shareLink.fileId,
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found',
            });
        }

        // IMPORTANT: ownership check
        if (file.ownerId !== user.id) {
            return res.status(403).json({
                error: 'You do not have permission to revoke this link',
            });
        }

        // Already revoked
        if (shareLink.revoked) {
            return res.status(400).json({
                error: 'Share link is already revoked',
            });
        }

        // Revoke the link
        await db.orm.public.ShareLink.where({
            id: shareLink.id,
        }).update({
            revoked: true,
        });

        return res.json({
            message: 'Share link revoked successfully',
        });
    } catch (error) {
        console.error(
            'Failed to revoke share link:',
            error,
        );

        return res.status(500).json({
            error: 'Failed to revoke share link',
        });
    }

});



export default router;