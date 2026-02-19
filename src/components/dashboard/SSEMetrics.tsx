'use client';

import { useTranslations } from 'next-intl';

interface MetricItem {
  label: string;
  value: number;
  target: number;
  unit: string;
}

const DEMO_METRICS: MetricItem[] = [
  { label: 'Taux de fréquence', value: 12.5, target: 15, unit: '' },
  { label: 'Taux de gravité', value: 0.8, target: 1.0, unit: '' },
  { label: 'Conformité EPI', value: 92, target: 100, unit: '%' },
  { label: 'Plans d\'actions clôturés', value: 78, target: 90, unit: '%' },
  { label: 'Formations réalisées', value: 85, target: 95, unit: '%' },
  { label: 'Visites sécurité', value: 42, target: 50, unit: '' },
];

function getMetricProgressColor(value: number, target: number): string {
  const ratio = value / target;
  if (ratio >= 0.9) return 'bg-success';
  if (ratio >= 0.7) return 'bg-warning';
  return 'bg-danger';
}

export function SSEMetrics() {
  const t = useTranslations('dashboard');

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '480ms' }}>
      <h2 className="text-lg font-bold text-text-primary mb-4">{t('sseOverview')}</h2>

      <div className="space-y-3.5">
        {DEMO_METRICS.map((metric) => {
          const progress = Math.min((metric.value / metric.target) * 100, 100);

          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-secondary">{metric.label}</span>
                <span className="text-xs font-bold text-text-primary">
                  {metric.value}{metric.unit} / {metric.target}{metric.unit}
                </span>
              </div>
              <div className="h-2 rounded-bar bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-bar transition-all duration-500 ${getMetricProgressColor(metric.value, metric.target)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
