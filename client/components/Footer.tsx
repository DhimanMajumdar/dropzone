'use client';

import Link from 'next/link';
import { UploadCloud } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/80 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Left Info */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight">DropZone</span>
          </Link>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <p className="text-xs font-mono text-zinc-500">
            Ephemeral Data Transit &amp; Secure File Sharing
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-400 font-mono">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Product
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}
