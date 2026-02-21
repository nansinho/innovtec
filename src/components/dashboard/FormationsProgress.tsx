'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-success';
  if (progress >= 50) return 'bg-primary';
  if (progress >= 25) return 'bg-warning';
  return 'bg-accent';
}

export function FormationsProgress() {
  const t = useTranslations('dashboard');

  const { data: formations } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('formations')
        .select('id, title, duration_hours, status')
        .eq('status', 'en_cours')
        .order('start_date', { ascending: false })
        .limit(4),
  );

  const items = (formations || []) as Record<string, any>[];

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '420ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('trainingsInProgress')}</h2>
        <Link href="/formations" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((formation) => (
            <div key={formation.id as string} className="group cursor-pointer">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap size={14} className="text-text-muted flex-shrink-0" />
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                    {formation.title as string}
                  </p>
                </div>
                <span className="text-xs font-bold text-text-secondary ml-2 flex-shrink-0">
                  En cours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-bar bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-bar transition-all duration-500 ${getProgressColor(50)}`} style={{ width: '50%' }} />
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">{formation.duration_hours as number}h</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucune formation en cours</p>
      )}
    </div>
  );
}
