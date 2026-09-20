import { Router } from 'express';
import { getAuth } from '@clerk/express';

import { db } from '../prisma/db.js';
import { deleteFile } from '../services/s3.service.js';

const router = Router();

router.delete('/:id', async (req, res) => {
    const { userId } = getAuth(req);
    const fileId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({
            error: 'Unauthorized',
        });
    }

    if (!Number.isInteger(fileId)) {
        return res.status(400).json({
            error: 'Invalid file ID',
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

        const file = await db.orm.public.File.first({
            id: fileId,
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found',
            });
        }

        if (file.ownerId !== user.id) {
            return res.status(403).json({
                error: 'You do not have permission to delete this file',
            });
        }

        await deleteFile(file.storageKey);

        await db.orm.public.File.where({
            id: file.id,
        }).delete();

        return res.json({
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error(
            'Failed to delete file:',
            error,
        );

        return res.status(500).json({
            error: 'Failed to delete file',
        });
    }
});

export default router;