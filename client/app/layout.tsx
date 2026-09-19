import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DropZone — Share files. Without the baggage.',
  description: 'The secure, ephemeral file transit layer for teams who care about privacy. Drop your files, generate secure share links, and transfer instantly.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} antialiased dark`}>
        <body className="bg-[#09090b] text-[#f4f4f5] min-h-screen selection:bg-[#6366f1] selection:text-white font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}