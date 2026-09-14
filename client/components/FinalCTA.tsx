'use client';

import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, UploadCloud } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-[#fafafa] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              Ready to share something?
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mb-6 sm:mb-8">
              Upload your first payload and forge a presigned share link in seconds.
            </p>

            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-base shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer group">
                <UploadCloud className="w-5 h-5 group-hover:scale-105 transition-transform" />
                Get started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    </section>
  );
}
