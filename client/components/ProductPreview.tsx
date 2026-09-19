'use client';

import { useState } from 'react';
import { FileText, CheckCircle2, Copy, ExternalLink, Share2, Sparkles, Check, Terminal } from 'lucide-react';

export default function ProductPreview() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('http://localhost:3000/share/8f39a7e2b104');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[#09090b] text-white relative overflow-hidden dark-grid-pattern border-t border-b border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono font-medium uppercase tracking-wider mb-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>INTERACTIVE WORKFLOW ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Streamlined from upload to share
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            No clutter or complicated dashboards. Experience how DropZone handles file transit in two simple steps.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Step 1 Card */}
          <div className="bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  01 / PAYLOAD STAGED
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to share
                </span>
              </div>

              <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800 flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate">
                    project-report.pdf
                  </h4>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    PDF Document · 2.4 MB · AES-256
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-default shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Share2 className="w-4 h-4" />
              Create share link
            </button>
          </div>

          {/* Step 2 Card */}
          <div className="bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  02 / SECURE SHARE LINK ACTIVE
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Token Forged
                </span>
              </div>

              <p className="text-xs font-mono text-zinc-400 mb-2">Share URL:</p>
              <div className="bg-[#09090b] rounded-xl p-3.5 border border-zinc-800 flex items-center justify-between gap-2 mb-6">
                <span className="text-[11px] sm:text-xs font-mono text-indigo-300 truncate min-w-0">
                  dropzone.app/share/8f39a7e2b104
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700 shrink-0">
                  Encrypted
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-700/60"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    Copy link
                  </>
                )}
              </button>
              <button className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]">
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
