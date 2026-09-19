'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { ArrowRight, Shield, UploadCloud, Menu, X, Terminal } from 'lucide-react';

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#09090b]/85 border-b border-zinc-800/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all">
            <UploadCloud className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            DropZone
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
              v1.0
            </span>
          </span>
        </Link>

        {/* Center Navigation Links (Signed Out / Desktop) */}
        {!isSignedIn && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Security
            </a>
          </nav>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-400/30 active:scale-[0.98]">
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </SignUpButton>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
              >
                Dashboard
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AUTHENTICATED
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-zinc-700 shadow-2xs"
                  }
                }}
              />
            </div>
          </Show>
        </div>
      </div>

      {/* Mobile Drawer (Signed Out) */}
      {!isSignedIn && mobileMenuOpen && (
        <nav className="md:hidden bg-[#09090b] border-b border-zinc-800 px-4 py-4 flex flex-col gap-3 text-sm font-medium text-zinc-300">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-indigo-400 border-b border-zinc-800/60"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-indigo-400 border-b border-zinc-800/60"
          >
            Features
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-indigo-400 flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            Security Architecture
          </a>
        </nav>
      )}
    </header>
  );
}
