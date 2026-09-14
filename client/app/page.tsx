'use client';

import {
  Show,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/nextjs';

export default function Home() {
  const { getToken } = useAuth();

  const uploadFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      // 1. Get Clerk token
      const token = await getToken();

      if (!token) {
        alert('Please sign in first');
        return;
      }

      // 2. Ask backend for presigned S3 upload URL
      const response = await fetch(
        'http://localhost:5000/api/files/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert('Failed to get upload URL');
        return;
      }

      // 3. Upload file directly to S3
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      // 4. Save file metadata in PostgreSQL
      const saveResponse = await fetch(
        'http://localhost:5000/api/files',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalName: file.name,
            storageKey: data.storageKey,
            mimeType: file.type,
            size: file.size,
          }),
        }
      );

      const savedFile = await saveResponse.json();

      if (!saveResponse.ok) {
        console.error(savedFile);
        alert(
          'File uploaded to S3, but failed to save metadata'
        );
        return;
      }

      console.log('Uploaded successfully!');
      console.log('Storage key:', data.storageKey);
      console.log('Database file:', savedFile);

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  return (
    <main>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button>Sign in with Google</button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <p>You are signed in!</p>

        <UserButton />

        <div>
          <input
            type="file"
            onChange={uploadFile}
          />
        </div>
      </Show>
    </main>
  );
}