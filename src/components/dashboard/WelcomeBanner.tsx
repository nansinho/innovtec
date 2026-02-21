'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Sun, Sparkles } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-[#0A1F44] via-primary to-[#1A6FFF] pb-24 pt-8 px-6 md:px-10 text-white shadow-banner">
      {/* Grid pattern overlay */}
      <div className="banner-grid absolute inset-0" />

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/30 via-transparent to-transparent" />

      {/* Animated decorative elements */}
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5 animate-float" />
      <div className="absolute right-1/4 top-4 h-48 w-48 rounded-full bg-primary-light/10 animate-float-slow" />
      <div className="absolute -left-8 -bottom-8 h-56 w-56 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute right-1/3 bottom-8 h-20 w-20 rounded-full bg-accent/10 animate-pulse-glow" />

      {/* Decorative dots pattern */}
      <div className="absolute right-10 top-10 grid grid-cols-3 gap-2 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* Sparkle accents */}
      <div className="absolute left-1/4 top-6 opacity-30 animate-pulse-glow" style={{ animationDelay: '1s' }}>
        <Sparkles size={16} />
      </div>
      <div className="absolute right-1/3 top-12 opacity-20 animate-pulse-glow" style={{ animationDelay: '3s' }}>
        <Sparkles size={12} />
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10">
        <div>
          <p className="text-sm font-medium text-white/50 capitalize mb-1">{today}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('welcome', { name: displayName })}
          </h1>
          <p className="mt-2 text-white/60 text-sm md:text-base max-w-lg">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Weather widget - glassmorphism */}
        <div className="flex items-center gap-3 rounded-xl px-5 py-3.5 backdrop-blur-md border border-white/15 shadow-lg"
             style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20 backdrop-blur-sm">
            <Sun size={22} className="text-amber-300" />
          </div>
          <div>
            <p className="text-lg font-bold">18°C</p>
            <p className="text-xs text-white/50">Bordeaux, France</p>
          </div>
        </div>
      </div>
    </div>
  );
}
