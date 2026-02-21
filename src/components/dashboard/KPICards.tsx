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
      icon: <AlertTriangle size={22} />,
      gradient: criticalReports === 0
        ? 'from-emerald-500/15 to-emerald-600/15'
        : 'from-red-500/15 to-red-600/15',
      iconColor: criticalReports === 0 ? 'text-emerald-600' : 'text-red-600',
      trend: criticalReports === 0 ? 'Excellent' : null,
      trendColor: 'text-emerald-500',
    },
    {
      titleKey: 'dangerousSituations',
      value: String(totalReports),
      icon: <ShieldAlert size={22} />,
      gradient: 'from-amber-500/15 to-orange-500/15',
      iconColor: 'text-amber-600',
      trend: null,
      trendColor: '',
    },
    {
      titleKey: 'managerialVisits',
      value: String(activeProfiles.length),
      icon: <Eye size={22} />,
      gradient: 'from-blue-500/15 to-indigo-500/15',
      iconColor: 'text-blue-600',
      trend: null,
      trendColor: '',
    },
    {
      titleKey: 'sstRate',
      value: `${closureRate}%`,
      icon: <HeartPulse size={22} />,
      gradient: 'from-purple-500/15 to-violet-500/15',
      iconColor: 'text-purple-600',
      trend: closureRate >= 80 ? 'Bon' : null,
      trendColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.titleKey}
          className="bg-white rounded-2xl border border-white/80 p-6 opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          style={{
            animationDelay: `${i * 80}ms`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.iconColor}`}>
              {kpi.icon}
            </div>
            {kpi.trend && (
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${kpi.trendColor} bg-emerald-50 px-2 py-0.5 rounded-full`}>
                <TrendingUp size={12} />
                {kpi.trend}
              </span>
            )}
          </div>
          <div className="mt-5">
            <p className="text-3xl font-extrabold text-text-primary tracking-tight">{kpi.value}</p>
            <p className="mt-1.5 text-sm text-text-secondary font-medium">{t(kpi.titleKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
