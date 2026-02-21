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
    <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 text-purple-600">
            <GraduationCap size={18} strokeWidth={1.8} />
          </div>
          <h2 className="section-title">{t('trainingsInProgress')}</h2>
        </div>
        <Link href="/formations" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          Voir tout <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((formation) => (
            <div key={formation.id as string} className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap size={14} className="text-text-muted flex-shrink-0" />
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                    {formation.title as string}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary/70 bg-primary-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                  En cours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(50)}`} style={{ width: '50%' }} />
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0 font-medium">{formation.duration_hours as number}h</span>
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
