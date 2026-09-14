'use client';

import { ShieldCheck, Lock, Key, Clock, UserCheck, Link2 } from 'lucide-react';

export default function SecuritySection() {
  const securityFeatures = [
    {
      title: 'Private S3 Storage',
      description: 'Objects are stored in bucket architectures configured for strict private access.',
      icon: Lock,
    },
    {
      title: 'Presigned Upload URLs',
      description: 'Files upload directly to object storage via authenticated short-lived presigned URLs.',
      icon: Key,
    },
    {
      title: 'Temporary Download URLs',
      description: 'Downloads execute through signed URLs generated strictly on valid request.',
      icon: Clock,
    },
    {
      title: 'Authenticated File Ownership',
      description: 'Clerk authentication strictly isolates file ownership and authorization records.',
      icon: UserCheck,
    },
    {
      title: 'Share-link Validation',
      description: 'Tokens are verified against revocation and invalidation flags prior to serving files.',
      icon: Link2,
    },
    {
      title: 'Expiration Controls',
      description: 'Set download limits and time-based expiration parameters on generated share links.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="security" className="py-16 md:py-24 bg-[#0a0a0c] text-white relative overflow-hidden dark-grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium uppercase tracking-wider mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Architecture & Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Your files stay private.
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            DropZone keeps files private in storage and only provides temporary access when a valid share link is used.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {securityFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 hover:border-zinc-700 transition-colors shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-indigo-400 flex items-center justify-center mb-4 border border-zinc-700">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
