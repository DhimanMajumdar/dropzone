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
  description: 'The secure, ephemeral file transit layer for teams who care about privacy. Drop your files, generate presigned links, and share instantly.',
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
      <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} antialiased`}>
        <body className="bg-[#fafafa] text-[#09090b] min-h-screen selection:bg-[#4f46e5] selection:text-white font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}