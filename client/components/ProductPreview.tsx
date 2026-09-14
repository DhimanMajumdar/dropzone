'use client';

import { useState } from 'react';
import { FileText, CheckCircle2, Copy, ExternalLink, Share2, Sparkles, Check } from 'lucide-react';

export default function ProductPreview() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('http://localhost:3000/share/8f39a7e2b104');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-20 bg-zinc-950 text-white relative overflow-hidden dark-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono font-medium uppercase tracking-wider mb-3 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Streamlined from upload to share
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            No clutter or complicated dashboards. Experience how DropZone handles file transit in two steps.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Step 1 Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  01 / Payload Staged
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to share
                </span>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate">
                    project-report.pdf
                  </h4>
                  <p className="text-xs font-mono text-zinc-400">
                    PDF Document · 2.4 MB
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full py-3 rounded-lg bg-[#4f46e5] hover:bg-indigo-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-default">
              <Share2 className="w-4 h-4" />
              Create share link
            </button>
          </div>

          {/* Step 2 Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  02 / Presigned URL Active
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" />
                  Token Forged
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-2">Share URL:</p>
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 flex items-center justify-between gap-2 mb-6">
                <span className="text-[11px] sm:text-xs font-mono text-indigo-300 truncate min-w-0">
                  dropzone.app/share/8f39a7e2b104
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 shrink-0">
                  Presigned
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy link
                  </>
                )}
              </button>
              <button className="py-2.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
