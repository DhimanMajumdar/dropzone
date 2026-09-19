'use client';

import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, UploadCloud } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#09090b] relative overflow-hidden border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-indigo-600/5 to-purple-500/10 blur-xl opacity-50" />
          
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Ready to share something?
            </h2>
            <p className="text-zinc-400 text-base mb-8 leading-relaxed">
              Upload your first payload and forge a secure share link in seconds.
            </p>

            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-base shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer group border border-indigo-400/30 active:scale-[0.98]">
                <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Get started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    </section>
  );
}
