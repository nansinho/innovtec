'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Eye, ShieldAlert, HeartPulse, TrendingUp, TrendingDown } from 'lucide-react';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { DonutChart } from '@/components/charts/DonutChart';
import { MiniAreaChart } from '@/components/charts/MiniAreaChart';
import { useMemo } from 'react';

export function KPICards() {
  const t = useTranslations('dashboard');

  const { data: safetyReports } = useSupabaseQuery(
    (supabase) => supabase.from('safety_reports').select('severity, status, created_at'),
  );

  const { data: actionPlans } = useSupabaseQuery(
    (supabase) => supabase.from('action_plans').select('status, created_at'),
  );

  const { data: profiles } = useSupabaseQuery(
    (supabase) => supabase.from('profiles').select('id, created_at').eq('is_active', true),
  );

  const reports = (safetyReports || []) as Record<string, any>[];
  const plans = (actionPlans || []) as Record<string, any>[];
  const activeProfiles = (profiles || []) as Record<string, any>[];

  const criticalReports = reports.filter((r) => r.severity === 'critique' || r.severity === 'eleve').length;
  const totalReports = reports.length;
  const closedPlans = plans.filter((p) => p.status === 'cloture').length;
  const totalPlans = plans.length;
  const closureRate = totalPlans > 0 ? Math.round((closedPlans / totalPlans) * 100) : 0;

  // Generate trend data (group by month for last 6 months)
  const trendData = useMemo(() => {
    const now = new Date();
    const generateMonthlyData = (items: Record<string, any>[], dateField: string) => {
      const data: { value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = items.filter((item) => {
          const itemDate = new Date(item[dateField] as string);
          return itemDate >= d && itemDate < nextMonth;
        }).length;
        data.push({ value: count });
      }
      return data;
    };

    return {
      reports: generateMonthlyData(reports, 'created_at'),
      plans: generateMonthlyData(plans, 'created_at'),
      profiles: generateMonthlyData(activeProfiles, 'created_at'),
    };
  }, [reports, plans, activeProfiles]);

  // Calculate month-over-month change
  const getChange = (data: { value: number }[]) => {
    if (data.length < 2) return null;
    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const kpis = [
    {
      titleKey: 'accidents',
      value: String(criticalReports),
      icon: <AlertTriangle size={20} strokeWidth={1.8} />,
      ringColor: criticalReports === 0 ? '#36B37E' : '#FF5630',
      ringValue: criticalReports,
      ringMax: Math.max(totalReports, 1),
      chartColor: criticalReports === 0 ? '#36B37E' : '#FF5630',
      trendData: trendData.reports,
      change: getChange(trendData.reports),
      invertTrend: true,
    },
    {
      titleKey: 'dangerousSituations',
      value: String(totalReports),
      icon: <ShieldAlert size={20} strokeWidth={1.8} />,
      ringColor: '#FFAB00',
      ringValue: totalReports,
      ringMax: Math.max(totalReports + 5, 10),
      chartColor: '#FFAB00',
      trendData: trendData.reports,
      change: getChange(trendData.reports),
      invertTrend: true,
    },
    {
      titleKey: 'managerialVisits',
      value: String(activeProfiles.length),
      icon: <Eye size={20} strokeWidth={1.8} />,
      ringColor: '#0052CC',
      ringValue: activeProfiles.length,
      ringMax: Math.max(activeProfiles.length + 5, 20),
      chartColor: '#0052CC',
      trendData: trendData.profiles,
      change: getChange(trendData.profiles),
      invertTrend: false,
    },
    {
      titleKey: 'sstRate',
      value: `${closureRate}%`,
      icon: <HeartPulse size={20} strokeWidth={1.8} />,
      ringColor: closureRate >= 80 ? '#36B37E' : closureRate >= 60 ? '#FFAB00' : '#FF5630',
      ringValue: closureRate,
      ringMax: 100,
      chartColor: '#1E3A5F',
      trendData: trendData.plans,
      change: getChange(trendData.plans),
      invertTrend: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, i) => {
        const isPositive = kpi.change !== null && (kpi.invertTrend ? kpi.change <= 0 : kpi.change >= 0);
        return (
          <div
            key={kpi.titleKey}
            className="bg-white rounded-2xl border border-white/80 p-5 opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden"
            style={{
              animationDelay: `${i * 80}ms`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted font-medium mb-1">{t(kpi.titleKey)}</p>
                <p className="text-2xl font-extrabold text-text-primary tracking-tight">{kpi.value}</p>
                {kpi.change !== null && (
                  <div className={`flex items-center gap-1 mt-1.5 ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span className="text-[11px] font-bold">{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                    <span className="text-[10px] text-text-muted font-normal">vs mois préc.</span>
                  </div>
                )}
              </div>
              <DonutChart
                value={kpi.ringValue}
                max={kpi.ringMax}
                size={56}
                strokeWidth={6}
                color={kpi.ringColor}
                showPercentage={kpi.titleKey === 'sstRate'}
                className="flex-shrink-0"
              />
            </div>
            <MiniAreaChart
              data={kpi.trendData}
              color={kpi.chartColor}
              height={36}
              gradientId={`kpi-${kpi.titleKey}`}
            />
          </div>
        );
      })}
    </div>
  );
}
