'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { DonutChart } from '@/components/charts/DonutChart';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

function getMetricColor(value: number, target: number): string {
  const ratio = value / target;
  if (ratio >= 0.9) return '#36B37E';
  if (ratio >= 0.7) return '#FFAB00';
  return '#FF5630';
}

export function SSEMetrics() {
  const t = useTranslations('dashboard');
  const [tab, setTab] = useState('current');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const { data: currentMetrics } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('sse_metrics')
        .select('*')
        .eq('year', currentYear)
        .eq('month', currentMonth),
  );

  const { data: prevMetrics } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('sse_metrics')
        .select('*')
        .eq('year', prevYear)
        .eq('month', prevMonth),
  );

  const currentItems = (currentMetrics || []) as Record<string, any>[];
  const prevItems = (prevMetrics || []) as Record<string, any>[];
  const activeItems = tab === 'current' ? currentItems : prevItems;

  const overallAchievement = activeItems.length > 0
    ? Math.round(activeItems.reduce((sum, m) => sum + Math.min(((m.value as number) / ((m.target as number) || 100)) * 100, 100), 0) / activeItems.length)
    : 0;

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-600">
            <BarChart3 size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('sseOverview')}</h2>
            <p className="text-xs text-text-muted">{overallAchievement}% global</p>
          </div>
        </div>

        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex rounded-xl bg-background/80 p-1 border border-border-light/40">
            <Tabs.Trigger value="current" className="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              {t('currentMonth')}
            </Tabs.Trigger>
            <Tabs.Trigger value="prev" className="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              {t('previousMonth')}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      {activeItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {activeItems.slice(0, 4).map((metric) => {
            const value = (metric.value as number) || 0;
            const target = (metric.target as number) || 100;
            const unit = (metric.unit as string) || '';
            const color = getMetricColor(value, target);

            return (
              <div key={metric.id as string} className="flex flex-col items-center text-center p-3 rounded-xl bg-background/40 hover:bg-background/70 transition-colors">
                <DonutChart
                  value={value}
                  max={target}
                  size={72}
                  strokeWidth={7}
                  color={color}
                  showPercentage={true}
                />
                <p className="text-[11px] font-semibold text-text-primary mt-2 line-clamp-1">{metric.metric_name as string}</p>
                <p className="text-[10px] text-text-muted">{value}{unit} / {target}{unit}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart3 size={32} className="text-text-muted/30 mb-2" />
          <p className="text-sm text-text-muted text-center">Aucune métrique SSE</p>
        </div>
      )}
    </div>
  );
}
