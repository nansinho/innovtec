'use client';

import { useTranslations } from 'next-intl';
import { BarChart3, Download, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';

interface Metric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

const MONTHLY_METRICS: Metric[] = [
  { name: 'Taux de fréquence (TF)', value: 12.5, target: 15, unit: '', trend: 'down', trendValue: '-18%' },
  { name: 'Taux de gravité (TG)', value: 0.8, target: 1.0, unit: '', trend: 'down', trendValue: '-12%' },
  { name: 'Accidents avec arrêt', value: 0, target: 0, unit: '', trend: 'stable', trendValue: '0' },
  { name: 'Accidents sans arrêt', value: 2, target: 3, unit: '', trend: 'down', trendValue: '-1' },
  { name: 'Situations dangereuses déclarées', value: 8, target: 10, unit: '', trend: 'up', trendValue: '+3' },
  { name: 'Visites managériales', value: 12, target: 15, unit: '', trend: 'up', trendValue: '+4' },
  { name: 'Quarts d\'heure sécurité', value: 18, target: 20, unit: '', trend: 'up', trendValue: '+2' },
  { name: 'Plans d\'actions clôturés', value: 78, target: 90, unit: '%', trend: 'up', trendValue: '+8%' },
  { name: 'Conformité EPI', value: 92, target: 100, unit: '%', trend: 'up', trendValue: '+3%' },
  { name: 'Taux SST', value: 94, target: 95, unit: '%', trend: 'up', trendValue: '+1%' },
  { name: 'Formations réalisées', value: 85, target: 95, unit: '%', trend: 'up', trendValue: '+5%' },
  { name: 'Jours sans accident', value: 127, target: 365, unit: 'j', trend: 'up', trendValue: 'En cours' },
];

function getProgressColor(value: number, target: number, lowerIsBetter = false): string {
  const ratio = lowerIsBetter ? (target === 0 ? (value === 0 ? 1 : 0) : 1 - value / target) : value / target;
  if (ratio >= 0.9) return 'bg-success';
  if (ratio >= 0.7) return 'bg-warning';
  return 'bg-danger';
}

export default function TableauSSEPage() {
  const t = useTranslations('qse');

  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary-50">
            <BarChart3 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Tableau de bord SSE</h1>
            <p className="text-sm text-text-secondary capitalize">{currentMonth}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-auto text-sm">
            <option>Janvier 2025</option>
            <option>Décembre 2024</option>
            <option>Novembre 2024</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: 'Jours sans accident', value: '127', icon: Target, color: 'text-success bg-emerald-50' },
          { label: 'Taux de fréquence', value: '12.5', icon: TrendingDown, color: 'text-primary bg-primary-50' },
          { label: 'SD déclarées', value: '8', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Conformité EPI', value: '92%', icon: Target, color: 'text-purple-600 bg-purple-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color} mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="p-5 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary">Indicateurs mensuels détaillés</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Indicateur</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Valeur</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Objectif</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-1/4">Progression</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {MONTHLY_METRICS.map((metric) => {
                const progress = metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 100;
                const lowerIsBetter = ['Taux de fréquence', 'Taux de gravité', 'Accidents'].some((s) =>
                  metric.name.includes(s)
                );

                return (
                  <tr key={metric.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-text-primary">{metric.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-bold text-text-primary">
                        {metric.value}{metric.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-text-secondary">
                        {metric.target}{metric.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-bar bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-bar transition-all duration-500 ${getProgressColor(metric.value, metric.target, lowerIsBetter)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-text-muted w-10 text-right">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        metric.trend === 'up' ? (lowerIsBetter ? 'text-danger' : 'text-success') :
                        metric.trend === 'down' ? (lowerIsBetter ? 'text-success' : 'text-danger') :
                        'text-text-muted'
                      }`}>
                        {metric.trend === 'up' && <TrendingUp size={12} />}
                        {metric.trend === 'down' && <TrendingDown size={12} />}
                        {metric.trendValue}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
