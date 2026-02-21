'use client';

import { useLocale } from 'next-intl';
import { ChevronRight, ListFilter, Download } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/use-supabase-query';

export function WelcomeHeaderV2() {
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
    <div className="bg-white rounded-card p-6 border border-border-light/60 shadow-card">
      {/* Inline breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-text-muted mb-1">
        <span>Overview</span>
        <ChevronRight size={14} className="text-text-muted/50" />
        <span className="text-text-primary font-medium">Sales</span>
      </div>

      {/* Date */}
      <p className="text-xs text-text-muted mb-3 capitalize">{today}</p>

      {/* Welcome + actions row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Good Morning, {displayName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here is what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <ListFilter size={16} />
            Filter
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
