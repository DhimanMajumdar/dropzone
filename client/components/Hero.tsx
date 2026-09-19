'use client';

import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, ShieldCheck, UploadCloud, Link as LinkIcon, Lock, Terminal, Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-grid-pattern ambient-glow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>SYS_OK • ZERO-KNOWLEDGE EPHEMERAL TRANSIT LAYER</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Share payloads.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
            Without the baggage.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Upload any file, generate secure transfer links, and share instantly. Zero permanent retention, optional password protection, and automated lifecycle purging.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14 sm:mb-20">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-base shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer group border border-indigo-400/30 active:scale-[0.98]">
              <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Upload a file
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignInButton>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#121215] hover:bg-[#18181c] text-zinc-300 hover:text-white border border-zinc-800 font-semibold text-base shadow-2xs transition-all flex items-center justify-center"
          >
            Explore architecture
          </a>
        </div>

        {/* Centerpiece Hero Card */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-indigo-600/10 to-purple-500/20 blur-xl opacity-70" />
          
          <div className="relative bg-[#121215] rounded-2xl border border-zinc-800/90 p-5 sm:p-7 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
                <span className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
                <span className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-[#09090b] px-3 py-1 rounded-md border border-zinc-800">
                <Lock className="w-3 h-3 text-emerald-400" />
                DROPZONE PRIVATE VAULT
              </div>
            </div>

            {/* Drop Zone Box Demo */}
            <SignInButton mode="modal">
              <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/80 bg-zinc-950/60 hover:bg-indigo-950/20 rounded-xl p-7 sm:p-9 text-center transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3.5 text-indigo-400 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base mb-1 tracking-tight">
                  Drop your file here
                </h3>
                <p className="text-xs text-zinc-400 mb-4 font-normal">
                  or <span className="text-indigo-400 font-medium underline underline-offset-2">browse from your device</span>
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-[#121215] px-3 py-1 rounded-md border border-zinc-800">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  Files stored in isolated private storage
                </div>
              </div>
            </SignInButton>

            {/* Visual Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800/80 text-center font-mono">
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium py-1">
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                Direct Secure Transfer
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium py-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Password Protection
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium py-1">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                Unique Token URL
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
