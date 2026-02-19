'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  HardHat,
  Flame,
  Activity,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  previousValue: number;
  icon: typeof Shield;
  color: string;
  bgColor: string;
}

interface MonthlyMetric {
  month: string;
  accidents_travail: number;
  situations_dangereuses: number;
  quarts_heure: number;
  visites_securite: number;
  formations: number;
  jours_sans_accident: number;
}

interface ActionItem {
  id: string;
  label: string;
  value: number;
  total: number;
  color: string;
}

// --- Demo Data ---
const DEMO_KPIS: KPI[] = [
  {
    id: 'tf',
    label: 'Taux de Frequence (TF)',
    value: 8.2,
    unit: '',
    target: 10.0,
    previousValue: 9.5,
    icon: Activity,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'tg',
    label: 'Taux de Gravite (TG)',
    value: 0.45,
    unit: '',
    target: 0.60,
    previousValue: 0.52,
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'jsa',
    label: 'Jours sans accident',
    value: 47,
    unit: 'jours',
    target: 90,
    previousValue: 32,
    icon: Award,
    color: 'text-primary',
    bgColor: 'bg-primary-50',
  },
  {
    id: 'sd',
    label: 'Situations dangereuses',
    value: 12,
    unit: 'ce mois',
    target: 15,
    previousValue: 8,
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'qh',
    label: 'Quarts d\'heure securite',
    value: 28,
    unit: 'realises',
    target: 32,
    previousValue: 24,
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'form',
    label: 'Formations securite',
    value: 6,
    unit: 'sessions',
    target: 8,
    previousValue: 5,
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const DEMO_MONTHLY_DATA: MonthlyMetric[] = [
  { month: 'Sept', accidents_travail: 1, situations_dangereuses: 6, quarts_heure: 24, visites_securite: 8, formations: 3, jours_sans_accident: 18 },
  { month: 'Oct', accidents_travail: 0, situations_dangereuses: 9, quarts_heure: 26, visites_securite: 10, formations: 4, jours_sans_accident: 31 },
  { month: 'Nov', accidents_travail: 1, situations_dangereuses: 8, quarts_heure: 24, visites_securite: 7, formations: 5, jours_sans_accident: 15 },
  { month: 'Dec', accidents_travail: 0, situations_dangereuses: 7, quarts_heure: 22, visites_securite: 6, formations: 2, jours_sans_accident: 31 },
  { month: 'Jan', accidents_travail: 0, situations_dangereuses: 10, quarts_heure: 28, visites_securite: 9, formations: 6, jours_sans_accident: 31 },
  { month: 'Fev', accidents_travail: 0, situations_dangereuses: 12, quarts_heure: 28, visites_securite: 11, formations: 6, jours_sans_accident: 19 },
];

const DEMO_ACTION_STATS: ActionItem[] = [
  { id: '1', label: 'Plans d\'actions clotures', value: 18, total: 28, color: 'bg-emerald-500' },
  { id: '2', label: 'Situations dangereuses traitees', value: 42, total: 52, color: 'bg-blue-500' },
  { id: '3', label: 'Formations realisees', value: 24, total: 32, color: 'bg-purple-500' },
  { id: '4', label: 'Visites securite effectuees', value: 51, total: 60, color: 'bg-orange-500' },
  { id: '5', label: 'Audits internes realises', value: 3, total: 6, color: 'bg-cyan-500' },
];

const DEMO_TOP_RISKS = [
  { label: 'Chutes de hauteur', count: 8, percentage: 25, color: 'bg-red-500' },
  { label: 'Risque electrique', count: 6, percentage: 19, color: 'bg-orange-500' },
  { label: 'Manutention manuelle', count: 5, percentage: 16, color: 'bg-amber-500' },
  { label: 'Eboulement de tranchee', count: 4, percentage: 13, color: 'bg-yellow-500' },
  { label: 'Circulation engins', count: 3, percentage: 9, color: 'bg-blue-500' },
  { label: 'Risque chimique', count: 2, percentage: 6, color: 'bg-purple-500' },
  { label: 'Autres', count: 4, percentage: 12, color: 'bg-gray-400' },
];

// --- Component ---
export default function TableauSSEPage() {
  const t = useTranslations('qse');
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  const maxBarValue = Math.max(
    ...DEMO_MONTHLY_DATA.map((d) =>
      Math.max(d.situations_dangereuses, d.quarts_heure, d.visites_securite)
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10">
              <Activity size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Tableau de Bord SSE
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Indicateurs Sante, Securite et Environnement
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white border border-border rounded-button px-2 py-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft size={14} className="text-text-secondary" />
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm font-medium text-text-primary bg-transparent border-none focus:outline-none px-2"
            >
              <option value="2026">2025-2026</option>
              <option value="2025">2024-2025</option>
            </select>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight size={14} className="text-text-secondary" />
            </button>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {DEMO_KPIS.map((kpi) => {
          const KpiIcon = kpi.icon;
          const trend = kpi.value - kpi.previousValue;
          const isPositiveTrend =
            kpi.id === 'sd' || kpi.id === 'qh' || kpi.id === 'form' || kpi.id === 'jsa'
              ? trend > 0
              : trend < 0;
          const progressPercent = Math.min(
            (kpi.value / kpi.target) * 100,
            100
          );

          return (
            <div
              key={kpi.id}
              className="card p-5 hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-card',
                    kpi.bgColor
                  )}
                >
                  <KpiIcon size={18} className={kpi.color} />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                    isPositiveTrend
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  )}
                >
                  {isPositiveTrend ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {trend > 0 ? '+' : ''}
                  {kpi.id === 'tg'
                    ? trend.toFixed(2)
                    : trend.toFixed(1)}
                </div>
              </div>

              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={cn('text-2xl font-bold', kpi.color)}>
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-xs text-text-muted">{kpi.unit}</span>
                )}
              </div>

              {/* Progress to target */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">
                    Objectif : {kpi.target}
                    {kpi.id === 'tg' ? '' : kpi.unit ? ` ${kpi.unit}` : ''}
                  </span>
                  <span className="text-[10px] font-medium text-text-secondary">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      progressPercent >= 100
                        ? 'bg-emerald-500'
                        : progressPercent >= 70
                        ? 'bg-blue-500'
                        : progressPercent >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution Chart (bar chart with progress bars) */}
        <div
          className="card p-5 animate-fade-in-up"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">
              Evolution mensuelle
            </h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Accidents
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Situations Dang.
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Quarts d&apos;heure
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {DEMO_MONTHLY_DATA.map((data) => (
              <div key={data.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-text-primary w-10">
                    {data.month}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>AT: {data.accidents_travail}</span>
                    <span>SD: {data.situations_dangereuses}</span>
                    <span>QH: {data.quarts_heure}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-4">
                  {/* Accidents */}
                  <div
                    className="bg-red-500 rounded-bar transition-all duration-500"
                    style={{
                      width: `${Math.max((data.accidents_travail / 3) * 15, data.accidents_travail > 0 ? 4 : 0)}%`,
                    }}
                  />
                  {/* Situations dangereuses */}
                  <div
                    className="bg-amber-500 rounded-bar transition-all duration-500"
                    style={{
                      width: `${(data.situations_dangereuses / maxBarValue) * 60}%`,
                    }}
                  />
                  {/* Quarts d'heure */}
                  <div
                    className="bg-blue-500 rounded-bar transition-all duration-500"
                    style={{
                      width: `${(data.quarts_heure / maxBarValue) * 60}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risks Distribution */}
        <div
          className="card p-5 animate-fade-in-up"
          style={{ animationDelay: '180ms' }}
        >
          <h2 className="text-sm font-bold text-text-primary mb-4">
            Repartition des risques identifies
          </h2>

          <div className="space-y-3">
            {DEMO_TOP_RISKS.map((risk) => (
              <div key={risk.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">
                    {risk.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {risk.count}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      ({risk.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      risk.color
                    )}
                    style={{ width: `${risk.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border-light">
            <p className="text-xs text-text-muted">
              Total : 32 risques identifies sur la periode
            </p>
          </div>
        </div>
      </div>

      {/* Action progress + Additional stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action completion */}
        <div
          className="card p-5 animate-fade-in-up"
          style={{ animationDelay: '240ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">
              Taux de realisation
            </h2>
            <span className="text-xs text-text-muted">
              Annee en cours
            </span>
          </div>

          <div className="space-y-4">
            {DEMO_ACTION_STATS.map((action) => {
              const percentage = Math.round(
                (action.value / action.total) * 100
              );
              return (
                <div key={action.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text-secondary">
                      {action.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        {action.value}/{action.total}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-medium rounded-full px-1.5 py-0.5',
                          percentage >= 80
                            ? 'text-emerald-600 bg-emerald-50'
                            : percentage >= 50
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-red-600 bg-red-50'
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        action.color
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary metrics */}
        <div
          className="card p-5 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <h2 className="text-sm font-bold text-text-primary mb-4">
            Bilan annuel cumule
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Accidents du travail',
                value: '2',
                subtext: 'vs 5 l\'an dernier',
                icon: Flame,
                color: 'text-red-600',
                bg: 'bg-red-50',
              },
              {
                label: 'Presqu\'accidents',
                value: '4',
                subtext: 'declares et traites',
                icon: AlertTriangle,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                label: 'Heures de formation',
                value: '248h',
                subtext: 'objectif 320h',
                icon: Users,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                label: 'Visites securite',
                value: '51',
                subtext: 'objectif 60',
                icon: HardHat,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Actions correctives',
                value: '42',
                subtext: '18 en cours',
                icon: Target,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Documents mis a jour',
                value: '14',
                subtext: 'sur 18 prevus',
                icon: FileText,
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
              },
            ].map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={cn(
                    'rounded-button p-3 border border-transparent hover:border-border-light transition-colors',
                    metric.bg
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MetricIcon size={14} className={metric.color} />
                    <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                      {metric.label}
                    </span>
                  </div>
                  <p className={cn('text-xl font-bold', metric.color)}>
                    {metric.value}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {metric.subtext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly detail table */}
      <div
        className="card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '360ms' }}
      >
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">
              Detail mensuel
            </h2>
            <button className="btn-secondary flex items-center gap-2 text-xs py-1.5 px-3">
              <Download size={12} />
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border-light bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Mois
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  AT
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Sit. Dang.
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Quarts H.
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Visites
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Formations
                </th>
                <th className="text-center px-3 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Jours sans AT
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_MONTHLY_DATA.map((row, index) => (
                <tr
                  key={row.month}
                  className={cn(
                    'border-b border-border-light hover:bg-gray-50 transition-colors',
                    index === DEMO_MONTHLY_DATA.length - 1 && 'bg-primary-50/30 font-medium'
                  )}
                >
                  <td className="px-5 py-3 font-medium text-text-primary">
                    {row.month}
                    {index === DEMO_MONTHLY_DATA.length - 1 && (
                      <span className="ml-2 text-[10px] text-primary font-bold">
                        En cours
                      </span>
                    )}
                  </td>
                  <td className="text-center px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        row.accidents_travail > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      )}
                    >
                      {row.accidents_travail}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3 text-text-primary">
                    {row.situations_dangereuses}
                  </td>
                  <td className="text-center px-3 py-3 text-text-primary">
                    {row.quarts_heure}
                  </td>
                  <td className="text-center px-3 py-3 text-text-primary">
                    {row.visites_securite}
                  </td>
                  <td className="text-center px-3 py-3 text-text-primary">
                    {row.formations}
                  </td>
                  <td className="text-center px-3 py-3">
                    <span
                      className={cn(
                        'font-bold',
                        row.jours_sans_accident >= 30
                          ? 'text-emerald-600'
                          : row.jours_sans_accident >= 15
                          ? 'text-amber-600'
                          : 'text-red-600'
                      )}
                    >
                      {row.jours_sans_accident}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-5 py-3 text-text-primary text-xs uppercase">
                  Total / Cumul
                </td>
                <td className="text-center px-3 py-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.accidents_travail, 0)}
                  </span>
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.situations_dangereuses, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.quarts_heure, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.visites_securite, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.formations, 0)}
                </td>
                <td className="text-center px-3 py-3 text-emerald-600 text-xs">
                  {DEMO_MONTHLY_DATA.reduce((s, d) => s + d.jours_sans_accident, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
