'use client';

import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, ShieldCheck, UploadCloud, Link as LinkIcon, Lock } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4f46e5] text-xs font-mono font-medium tracking-wide uppercase mb-6 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#4f46e5]" />
          <span>Zero-Knowledge Ephemeral Transit</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.15] mb-5 max-w-3xl mx-auto">
          Share files.{' '}
          <span className="text-[#4f46e5]">
            Without the baggage.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Upload a file, create a secure presigned link, and share it instantly. No folders, no permanent log retained.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group">
              <UploadCloud className="w-5 h-5 group-hover:scale-105 transition-transform" />
              Upload a file
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </SignInButton>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium text-base shadow-2xs transition-colors flex items-center justify-center"
          >
            See how it works
          </a>
        </div>

        {/* Centerpiece Hero Card */}
        <div className="relative max-w-xl mx-auto">
          <div className="relative bg-white rounded-2xl border border-zinc-200 p-5 sm:p-7 shadow-lg text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded border border-zinc-200">
                <Lock className="w-3 h-3 text-emerald-600" />
                Private S3 Storage
              </div>
            </div>

            {/* Drop Zone Box Demo */}
            <SignInButton mode="modal">
              <div className="border-2 border-dashed border-indigo-200 hover:border-[#4f46e5] bg-zinc-50/60 hover:bg-indigo-50/40 rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-[#4f46e5] group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-base mb-1">
                  Drop your file here
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  or <span className="text-[#4f46e5] font-medium underline underline-offset-2">browse from your device</span>
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-white px-2.5 py-1 rounded border border-zinc-200">
                  Files stay private until shared
                </div>
              </div>
            </SignInButton>

            {/* Visual Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-medium py-1">
                <UploadCloud className="w-3.5 h-3.5 text-[#4f46e5]" />
                Fast Presigned Upload
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-medium py-1">
                <Lock className="w-3.5 h-3.5 text-[#4f46e5]" />
                Private Bucket Vault
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-medium py-1">
                <LinkIcon className="w-3.5 h-3.5 text-[#4f46e5]" />
                Unique Share Token
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
