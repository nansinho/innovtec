'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Sun } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/use-supabase-query';

export function WelcomeBanner() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { user } = useCurrentUser();

  const today = new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayName = user ? user.first_name : '...';

  return (
    <div className="relative overflow-hidden -mx-6 md:-mx-8 -mt-6 bg-gradient-to-br from-[#060E1F] via-[#0B1A3E] to-[#0F2A5E] pb-32 pt-10 px-6 md:px-10 text-white">
      {/* Grid pattern overlay */}
      <div className="banner-grid absolute inset-0" />

      {/* Large gradient orbs like Fincan.io */}
      <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(76,154,255,0.4) 0%, transparent 70%)' }} />
      <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(0,82,204,0.5) 0%, transparent 70%)' }} />
      <div className="absolute right-1/3 top-0 h-[300px] w-[300px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(76,154,255,0.3) 0%, transparent 70%)' }} />

      {/* Prominent dot pattern - top right (like Fincan.io) */}
      <div className="absolute right-8 md:right-16 top-6 grid grid-cols-6 gap-3 opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* Secondary dot pattern - bottom left */}
      <div className="absolute left-8 bottom-20 grid grid-cols-4 gap-2.5 opacity-15">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-white" />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-content mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/40 capitalize mb-2">{today}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {t('welcome', { name: displayName })}
            </h1>
            <p className="mt-3 text-white/50 text-sm md:text-base max-w-lg leading-relaxed">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Weather widget - glassmorphism */}
          <div className="flex items-center gap-4 rounded-2xl px-6 py-4 backdrop-blur-xl border border-white/10 shadow-2xl"
               style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm border border-white/10" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
              <Sun size={24} className="text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">18°C</p>
              <p className="text-xs text-white/40">Bordeaux, France</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
