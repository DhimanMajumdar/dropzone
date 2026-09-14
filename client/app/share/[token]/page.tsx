'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function SharePage() {
    const params = useParams();

    const token = params.token as string;

    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `http://localhost:5000/api/share-links/${token}/download`
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Unable to download file');
                return;
            }

            setFileName(data.fileName);

            // Redirect browser to temporary S3 download URL
            window.location.href = data.downloadUrl;
        } catch (error) {
            console.error('Download error:', error);

            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>DropZone</h1>

            <p>Someone shared a file with you.</p>

            {fileName && (
                <p>
                    File: <strong>{fileName}</strong>
                </p>
            )}

            <button
                onClick={downloadFile}
                disabled={loading}
            >
                {loading ? 'Preparing download...' : 'Download File'}
            </button>

            {error && (
                <p>
                    {error}
                </p>
            )}
        </main>
    );
}