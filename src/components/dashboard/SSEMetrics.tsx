'use client';

import { useTranslations } from 'next-intl';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

function getMetricProgressColor(value: number, target: number): string {
  const ratio = value / target;
  if (ratio >= 0.9) return 'bg-success';
  if (ratio >= 0.7) return 'bg-warning';
  return 'bg-danger';
}

export function SSEMetrics() {
  const t = useTranslations('dashboard');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: metrics } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('sse_metrics')
        .select('*')
        .eq('year', currentYear)
        .eq('month', currentMonth),
  );

  const items = (metrics || []) as Record<string, any>[];

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '480ms' }}>
      <h2 className="text-lg font-bold text-text-primary mb-4">{t('sseOverview')}</h2>

      {items.length > 0 ? (
        <div className="space-y-3.5">
          {items.map((metric) => {
            const value = (metric.value as number) || 0;
            const target = (metric.target as number) || 100;
            const unit = (metric.unit as string) || '';
            const progress = Math.min((value / target) * 100, 100);

            return (
              <div key={metric.id as string}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-secondary">{metric.metric_name as string}</span>
                  <span className="text-xs font-bold text-text-primary">
                    {value}{unit} / {target}{unit}
                  </span>
                </div>
                <div className="h-2 rounded-bar bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-bar transition-all duration-500 ${getMetricProgressColor(value, target)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucune métrique SSE pour ce mois</p>
      )}
    </div>
  );
}
