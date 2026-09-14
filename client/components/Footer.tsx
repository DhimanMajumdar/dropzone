'use client';

import Link from 'next/link';
import { UploadCloud } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Left Info */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white">
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="font-bold text-zinc-900 tracking-tight">DropZone</span>
          </Link>
          <span className="hidden sm:inline text-zinc-300">|</span>
          <p className="text-xs font-mono text-zinc-500">
            Ephemeral Data Transit & Presigned Sharing
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-zinc-600">
          <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-zinc-900 transition-colors">
            Product
          </a>
          <a href="#security" className="hover:text-zinc-900 transition-colors">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}
