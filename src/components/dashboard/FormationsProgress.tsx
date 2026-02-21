'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, GraduationCap, Clock } from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

function getProgressColor(progress: number): string {
  if (progress >= 80) return '#36B37E';
  if (progress >= 50) return '#0052CC';
  if (progress >= 25) return '#FFAB00';
  return '#D4A017';
}

export function FormationsProgress() {
  const t = useTranslations('dashboard');

  const { data: formations } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('formations')
        .select('id, title, duration_hours, status, formation_enrollments(progress)')
        .eq('status', 'en_cours')
        .order('start_date', { ascending: false })
        .limit(4),
  );

  const items = (formations || []) as Record<string, any>[];

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-600/10 text-sky-600">
            <GraduationCap size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('trainingsInProgress')}</h2>
            <p className="text-xs text-text-muted">{items.length} {t('active')}</p>
          </div>
        </div>
        <Link href="/formations" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors group">
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((formation) => {
            // Get average progress from enrollments, fallback to 50%
            const enrollments = (formation.formation_enrollments || []) as { progress: number }[];
            const avgProgress = enrollments.length > 0
              ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
              : 50;
            const color = getProgressColor(avgProgress);

            return (
              <div key={formation.id as string} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-background/50 transition-colors group cursor-pointer">
                <DonutChart
                  value={avgProgress}
                  max={100}
                  size={44}
                  strokeWidth={5}
                  color={color}
                  showPercentage={true}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {formation.title as string}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-text-muted" />
                    <span className="text-[11px] text-text-muted">{formation.duration_hours as number}h</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600">
                      En cours
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <GraduationCap size={28} className="text-text-muted/30 mb-2" />
          <p className="text-sm text-text-muted">Aucune formation en cours</p>
        </div>
      )}
    </div>
  );
}
