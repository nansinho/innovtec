'use client';

import { useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';
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
    <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
          <BarChart3 size={18} strokeWidth={1.8} />
        </div>
        <h2 className="section-title">{t('sseOverview')}</h2>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((metric) => {
            const value = (metric.value as number) || 0;
            const target = (metric.target as number) || 100;
            const unit = (metric.unit as string) || '';
            const progress = Math.min((value / target) * 100, 100);

            return (
              <div key={metric.id as string}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-text-secondary">{metric.metric_name as string}</span>
                  <span className="text-xs font-bold text-text-primary">
                    {value}{unit} / {target}{unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getMetricProgressColor(value, target)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucune m&eacute;trique SSE pour ce mois</p>
      )}
    </div>
  );
}
