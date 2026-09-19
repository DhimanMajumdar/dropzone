'use client';

import { Shield, Zap, Sliders, Sparkles, Lock, KeyRound } from 'lucide-react';

export default function Features() {
  const features = [
    {
      number: '01',
      title: 'Secure by default',
      description: 'Files remain private in encrypted storage and downloads use short-lived secure transfer links.',
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
      title: 'Password lock & limits',
      description: 'Protect links with custom passwords, expiration timestamps, and download bounds.',
      icon: KeyRound,
    },
    {
      number: '04',
      title: 'Simple by design',
      description: 'No folders, complicated permissions, or retained file baggage.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#09090b] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Everything you need to share a file.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">
              Nothing you don't.
            </span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Engineered for speed, security, and clarity. No bloated storage UI or confusing authorization levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.number}
                className="bg-[#121215] rounded-2xl p-6 border border-zinc-800/90 shadow-2xl hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-zinc-400">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
