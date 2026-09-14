'use client';

import { Shield, Zap, Sliders, Sparkles } from 'lucide-react';

export default function Features() {
  const features = [
    {
      number: '01',
      title: 'Secure by default',
      description: 'Files remain private in S3 storage and downloads use short-lived presigned URLs.',
      icon: Shield,
    },
    {
      number: '02',
      title: 'Share instantly',
      description: 'Upload a payload and generate a unique share link in seconds.',
      icon: Zap,
    },
    {
      number: '03',
      title: 'Control access',
      description: 'Share links support expiration timestamps and download count bounds.',
      icon: Sliders,
    },
    {
      number: '04',
      title: 'Simple by design',
      description: 'No folders, complicated permissions, or retained file baggage.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            Everything you need to share a file.{' '}
            <span className="text-[#4f46e5]">Nothing you don't.</span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Purpose-built for speed and clarity. No bloated file management systems or confusing authorization levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.number}
                className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center group-hover:bg-[#4f46e5] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-zinc-400">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-[#4f46e5] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
