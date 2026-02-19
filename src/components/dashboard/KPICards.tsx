'use client';

import { useTranslations } from 'next-intl';
import { TrendingDown, TrendingUp, AlertTriangle, Eye, ShieldAlert, HeartPulse } from 'lucide-react';

interface KPICard {
  titleKey: string;
  value: string;
  trendKey: string;
  trend: 'up' | 'down';
  trendValue: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const kpis: KPICard[] = [
  {
    titleKey: 'accidents',
    value: '0',
    trendKey: 'accidentsTrend',
    trend: 'down',
    trendValue: '-100%',
    icon: <AlertTriangle size={22} />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    titleKey: 'managerialVisits',
    value: '12',
    trendKey: 'managerialVisitsTrend',
    trend: 'up',
    trendValue: '+20%',
    icon: <Eye size={22} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    titleKey: 'dangerousSituations',
    value: '8',
    trendKey: 'dangerousSituationsTrend',
    trend: 'up',
    trendValue: '+33%',
    icon: <ShieldAlert size={22} />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    titleKey: 'sstRate',
    value: '94%',
    trendKey: 'sstRateTrend',
    trend: 'up',
    trendValue: '95%',
    icon: <HeartPulse size={22} />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function KPICards() {
  const t = useTranslations('dashboard');

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
      <h2 className="text-lg font-bold text-text-primary mb-4">{t('kpiTitle')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.titleKey}
            className="card p-5 hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-emerald-600'}`}>
                {kpi.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trendValue}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-text-primary">{kpi.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{t(kpi.titleKey)}</p>
              <p className="text-xs text-text-muted mt-0.5">{t(kpi.trendKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
