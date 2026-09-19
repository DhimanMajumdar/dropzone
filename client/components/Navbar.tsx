'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { ArrowRight, Shield, UploadCloud, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-zinc-200 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <UploadCloud className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 flex items-center gap-1.5">
            DropZone
          </span>
        </Link>

        {/* Center Navigation Links (Signed Out / Desktop) */}
        {!isSignedIn && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-zinc-900 transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#4f46e5]" />
              Security
            </a>
          </nav>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-xs sm:text-sm font-medium text-white bg-[#4f46e5] hover:bg-indigo-700 px-3.5 sm:px-4 py-2 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </SignUpButton>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Dashboard
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AUTHENTICATED
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-zinc-200 shadow-2xs"
                  }
                }}
              />
            </div>
          </Show>
        </div>
      </div>

      {/* Mobile Drawer (Signed Out) */}
      {!isSignedIn && mobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-zinc-200 px-4 py-3 flex flex-col gap-3 text-sm font-medium text-zinc-700">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-[#4f46e5] border-b border-zinc-100"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-[#4f46e5] border-b border-zinc-100"
          >
            Features
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-[#4f46e5] flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-[#4f46e5]" />
            Security Architecture
          </a>
        </nav>
      )}
    </header>
  );
}
