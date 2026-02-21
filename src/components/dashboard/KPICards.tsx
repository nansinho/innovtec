'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Eye, ShieldAlert, HeartPulse } from 'lucide-react';
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
      color: criticalReports === 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: criticalReports === 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
    {
      titleKey: 'dangerousSituations',
      value: String(totalReports),
      icon: <ShieldAlert size={22} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      titleKey: 'managerialVisits',
      value: String(activeProfiles.length),
      icon: <Eye size={22} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      titleKey: 'sstRate',
      value: `${closureRate}%`,
      icon: <HeartPulse size={22} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
      <h2 className="text-lg font-bold text-text-primary mb-4">{t('kpiTitle')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.titleKey} className="card p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-text-primary">{kpi.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{t(kpi.titleKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
