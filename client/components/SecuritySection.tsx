'use client';

import { ShieldCheck, Lock, Key, Clock, UserCheck, Link2, KeyRound } from 'lucide-react';

export default function SecuritySection() {
  const securityFeatures = [
    {
      title: 'Private Vault Storage',
      description: 'Objects are stored in isolated vault architectures configured for strict private access.',
      icon: Lock,
    },
    {
      title: 'Direct Stream Transfer',
      description: 'Files upload directly to encrypted storage via authenticated short-lived security tokens.',
      icon: Key,
    },
    {
      title: 'Custom Password Locks',
      description: 'Set custom passcodes on any link to restrict file access strictly to authorized recipients.',
      icon: KeyRound,
    },
    {
      title: 'Authenticated Workspace',
      description: 'Strict user authentication isolates your file storage workspace from unauthorized access.',
      icon: UserCheck,
    },
    {
      title: 'Share Link Revocation',
      description: 'Instantly revoke active share links or enforce download limits whenever needed.',
      icon: Link2,
    },
    {
      title: 'Automated Lifecycle Purge',
      description: 'Background engines automatically purge expired payloads and revokes stale links.',
      icon: Clock,
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-[#09090b] text-white relative overflow-hidden dark-grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium uppercase tracking-wider mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ARCHITECTURE & SECURITY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Your files stay private.
          </h2>

          <p className="text-zinc-400 text-base leading-relaxed">
            DropZone keeps files private in object storage and only provides temporary access when a valid share link is authorized.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {securityFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-indigo-400 flex items-center justify-center mb-4 border border-zinc-800 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 tracking-tight">
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
