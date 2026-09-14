'use client';

import { UploadCloud, Link as LinkIcon, Send } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'UPLOAD',
      description: 'Choose your file and upload it securely.',
      icon: UploadCloud,
    },
    {
      number: '02',
      title: 'CREATE',
      description: 'Generate a unique presigned share link.',
      icon: LinkIcon,
    },
    {
      number: '03',
      title: 'SHARE',
      description: 'Send the link and let the recipient download the file.',
      icon: Send,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            From file to shared link in seconds.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Three simple actions to safely send files to anyone, anywhere.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center group">
                {/* Connecting Line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 left-[60%] w-[80%] h-[2px] bg-zinc-200 -z-0" />
                )}

                {/* Step Icon Box */}
                <div className="relative z-10 w-18 h-18 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[#4f46e5] mb-5 shadow-2xs group-hover:bg-[#4f46e5] group-hover:text-white group-hover:border-[#4f46e5] transition-all">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold font-mono text-zinc-900 tracking-wider uppercase mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 max-w-xs leading-relaxed">
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
