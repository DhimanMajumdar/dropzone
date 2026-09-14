'use client';

import {
  Show,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/nextjs';

export default function Home() {
  const { getToken } = useAuth();

  const testBackend = async () => {
    const token = await getToken();

    const response = await fetch('http://localhost:5000/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log(data);
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

        <button onClick={testBackend}>
          Test Backend
        </button>
      </Show>
    </main>
  );
}