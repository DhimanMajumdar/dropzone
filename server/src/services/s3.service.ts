import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function createUploadUrl(
    storageKey: string,
    contentType: string,
) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: storageKey,
        ContentType: contentType,
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300,
    });
}

export async function createDownloadUrl(
    storageKey: string,
) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: storageKey,
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300,
    });
}

export async function deleteFile(
    storageKey: string,
) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: storageKey,
    });

    return s3.send(command);
}

export default s3;