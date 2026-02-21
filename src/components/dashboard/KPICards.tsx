'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Eye, ShieldAlert, HeartPulse, TrendingUp } from 'lucide-react';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

export function KPICards() {
  const t = useTranslations('dashboard');

  const { data: safetyReports } = useSupabaseQuery(
    (supabase) => supabase.from('safety_reports').select('severity, status'),
  );

  const { data: actionPlans } = useSupabaseQuery(
    (supabase) => supabase.from('action_plans').select('status'),
  );

  const { data: profiles } = useSupabaseQuery(
    (supabase) => supabase.from('profiles').select('id').eq('is_active', true),
  );

  const reports = (safetyReports || []) as Record<string, any>[];
  const plans = (actionPlans || []) as Record<string, any>[];
  const activeProfiles = (profiles || []) as Record<string, any>[];

  const criticalReports = reports.filter((r) => r.severity === 'critique' || r.severity === 'eleve').length;
  const totalReports = reports.length;
  const closedPlans = plans.filter((p) => p.status === 'cloture').length;
  const totalPlans = plans.length;
  const closureRate = totalPlans > 0 ? Math.round((closedPlans / totalPlans) * 100) : 0;

  const kpis = [
    {
      titleKey: 'accidents',
      value: String(criticalReports),
      icon: <AlertTriangle size={20} />,
      gradient: criticalReports === 0
        ? 'from-emerald-500/15 to-emerald-600/15'
        : 'from-red-500/15 to-red-600/15',
      iconColor: criticalReports === 0 ? 'text-emerald-600' : 'text-red-600',
      borderAccent: criticalReports === 0 ? 'border-emerald-200/50' : 'border-red-200/50',
      trend: criticalReports === 0 ? 'Excellent' : null,
      trendColor: 'text-emerald-500',
    },
    {
      titleKey: 'dangerousSituations',
      value: String(totalReports),
      icon: <ShieldAlert size={20} />,
      gradient: 'from-amber-500/15 to-orange-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-200/50',
      trend: null,
      trendColor: '',
    },
    {
      titleKey: 'managerialVisits',
      value: String(activeProfiles.length),
      icon: <Eye size={20} />,
      gradient: 'from-blue-500/15 to-indigo-500/15',
      iconColor: 'text-blue-600',
      borderAccent: 'border-blue-200/50',
      trend: null,
      trendColor: '',
    },
    {
      titleKey: 'sstRate',
      value: `${closureRate}%`,
      icon: <HeartPulse size={20} />,
      gradient: 'from-purple-500/15 to-violet-500/15',
      iconColor: 'text-purple-600',
      borderAccent: 'border-purple-200/50',
      trend: closureRate >= 80 ? 'Bon' : null,
      trendColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.titleKey}
          className="card-elevated group p-5 opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className={`icon-glass-colored h-11 w-11 rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.iconColor}`}>
              {kpi.icon}
            </div>
            {kpi.trend && (
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${kpi.trendColor}`}>
                <TrendingUp size={12} />
                {kpi.trend}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-text-primary tracking-tight">{kpi.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{t(kpi.titleKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
