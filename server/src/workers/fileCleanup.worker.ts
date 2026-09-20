import 'dotenv/config';
import { Worker } from 'bullmq';

import { redis } from '../config/redis.js';
import { db } from '../prisma/db.js';
import { deleteFile } from '../services/s3.service.js';

const worker = new Worker(
    'file-cleanup',
    async (job) => {
        const { fileId, storageKey } = job.data;

        console.log(
            `Starting cleanup for file ${fileId}`,
        );

        // Check that the file still exists.
        const file = await db.orm.public.File.first({
            id: fileId,
        });

        if (!file) {
            console.log(
                `File ${fileId} already removed`,
            );

            return;
        }

        // Delete the actual object from S3.
        await deleteFile(storageKey);

        // Delete the DB file.
        // ShareLinks are deleted through the
        // File -> ShareLink cascade.
        await db.orm.public.File.where({
            id: fileId,
        }).delete();

        console.log(
            `File ${fileId} deleted successfully`,
        );
    },
    {
        connection: redis,
    },
);

worker.on('completed', (job) => {
    console.log(
        `Cleanup job ${job.id} completed`,
    );
});

worker.on('failed', (job, error) => {
    console.error(
        `Cleanup job ${job?.id} failed:`,
        error,
    );
});