'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

type Period = 'week' | 'month' | 'year';

export function ActivityChart() {
  const t = useTranslations('dashboard');
  const [period, setPeriod] = useState<Period>('month');

  const { data: safetyReports } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('safety_reports')
        .select('created_at')
        .order('created_at', { ascending: true }),
  );

  const { data: actionPlans } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('created_at')
        .order('created_at', { ascending: true }),
  );

  const { data: events } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('events')
        .select('start_date')
        .order('start_date', { ascending: true }),
  );

  const chartData = useMemo(() => {
    const reports = (safetyReports || []) as Record<string, any>[];
    const plans = (actionPlans || []) as Record<string, any>[];
    const evts = (events || []) as Record<string, any>[];

    const now = new Date();
    const buckets: Record<string, { reports: number; plans: number; events: number }> = {};

    let labels: string[] = [];
    const shortMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    if (period === 'week') {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + mondayOffset + i);
        const key = d.toISOString().slice(0, 10);
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        labels.push(dayNames[d.getDay()]);
        buckets[key] = { reports: 0, plans: 0, events: 0 };
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        labels.push(String(d.getDate()));
        buckets[key] = { reports: 0, plans: 0, events: 0 };
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(shortMonths[d.getMonth()]);
        buckets[key] = { reports: 0, plans: 0, events: 0 };
      }
    }

    const getKey = (dateStr: string) => {
      const d = new Date(dateStr);
      if (period === 'year') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return d.toISOString().slice(0, 10);
    };

    reports.forEach((r) => {
      const key = getKey(r.created_at as string);
      if (buckets[key]) buckets[key].reports++;
    });
    plans.forEach((p) => {
      const key = getKey(p.created_at as string);
      if (buckets[key]) buckets[key].plans++;
    });
    evts.forEach((e) => {
      const key = getKey(e.start_date as string);
      if (buckets[key]) buckets[key].events++;
    });

    const keys = Object.keys(buckets);
    return keys.map((key, i) => ({
      name: labels[i] || key,
      signalements: buckets[key].reports,
      actions: buckets[key].plans,
      evenements: buckets[key].events,
    }));
  }, [safetyReports, actionPlans, events, period]);

  const totalActivity = chartData.reduce((sum, d) => sum + d.signalements + d.actions + d.evenements, 0);

  return (
    <div className="card-elevated p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-blue-600/10 text-primary">
            <Activity size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('activityOverview')}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={12} className="text-success" />
              <span className="text-xs text-text-muted">{totalActivity} {t('totalActivities')}</span>
            </div>
          </div>
        </div>

        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <Tabs.List className="flex rounded-xl bg-background/80 p-1 border border-border-light/40">
            <Tabs.Trigger value="week" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              {t('week')}
            </Tabs.Trigger>
            <Tabs.Trigger value="month" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              {t('month')}
            </Tabs.Trigger>
            <Tabs.Trigger value="year" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              {t('year')}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] text-text-muted font-medium">{t('reports')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-[11px] text-text-muted font-medium">{t('actionPlansLabel')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-[11px] text-text-muted font-medium">{t('eventsLabel')}</span>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0052CC" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0052CC" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradActions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#36B37E" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#36B37E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A017" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#D4A017" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBECF0" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#97A0AF', fontSize: 11 }}
              interval={period === 'month' ? 4 : 0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#97A0AF', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-border-light/60 px-4 py-3 shadow-xl">
                    <p className="text-xs font-bold text-text-primary mb-2">{label}</p>
                    {payload.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-text-muted">{entry.name}:</span>
                        <span className="font-bold text-text-primary">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="signalements" name={t('reports')} stroke="#0052CC" strokeWidth={2} fill="url(#gradReports)" dot={false} activeDot={{ r: 4, fill: '#0052CC', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="actions" name={t('actionPlansLabel')} stroke="#36B37E" strokeWidth={2} fill="url(#gradActions)" dot={false} activeDot={{ r: 4, fill: '#36B37E', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="evenements" name={t('eventsLabel')} stroke="#D4A017" strokeWidth={2} fill="url(#gradEvents)" dot={false} activeDot={{ r: 4, fill: '#D4A017', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
