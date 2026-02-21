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
    <div className="relative overflow-hidden rounded-card bg-gradient-to-r from-primary via-primary to-primary-light p-6 md:p-8 text-white animate-fade-in-up">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-white/10" />
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t('welcome', { name: displayName })}
          </h1>
          <p className="mt-1 text-white/70 text-sm md:text-base">
            {t('welcomeSubtitle')}
          </p>
          <p className="mt-2 text-sm text-white/50 capitalize">{today}</p>
        </div>

        {/* Weather widget */}
        <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
          <Sun size={28} className="text-amber-300" />
          <div>
            <p className="text-lg font-bold">18°C</p>
            <p className="text-xs text-white/60">Bordeaux, France</p>
          </div>
        </div>
      </div>
    </div>
  );
}
