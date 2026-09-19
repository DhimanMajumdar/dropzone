'use client';

import { UploadCloud, Link as LinkIcon, Send } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'UPLOAD',
      description: 'Choose your file and stream it directly to private encrypted storage.',
      icon: UploadCloud,
    },
    {
      number: '02',
      title: 'CREATE & LOCK',
      description: 'Generate a unique secure share link with optional password protection.',
      icon: LinkIcon,
    },
    {
      number: '03',
      title: 'SHARE & PURGE',
      description: 'Recipient downloads payload. Automated cleanup purges file when expired.',
      icon: Send,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#09090b] border-t border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            From payload to shared URL in seconds.
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Three simple engineered steps to safely transfer data to anyone, anywhere.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center group">
                {/* Connecting Line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 left-[60%] w-[80%] h-[2px] bg-zinc-800 -z-0" />
                )}

                {/* Step Icon Box */}
                <div className="relative z-10 w-18 h-18 rounded-2xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-indigo-400 mb-6 shadow-2xl group-hover:border-indigo-500/80 group-hover:bg-indigo-950/30 transition-all">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-2.5 -right-2.5 bg-indigo-950 text-indigo-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-indigo-500/40">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
