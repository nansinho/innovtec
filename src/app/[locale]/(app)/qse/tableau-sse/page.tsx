'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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
import { useSupabaseQuery, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';

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

// --- Helpers ---
const MONTH_NAMES: Record<number, string> = {
  1: 'Jan',
  2: 'Fev',
  3: 'Mar',
  4: 'Avr',
  5: 'Mai',
  6: 'Juin',
  7: 'Juil',
  8: 'Aout',
  9: 'Sept',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
};

const RISK_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-blue-500',
  'bg-slate-500',
  'bg-gray-400',
];

function getMetricValue(
  rows: Record<string, any>[],
  metricName: string,
  month?: number
): number {
  const match = rows.find(
    (r) =>
      r.metric_name === metricName &&
      (month === undefined || Number(r.month) === month)
  );
  return match ? Number(match.value) : 0;
}

function getMetricTarget(
  rows: Record<string, any>[],
  metricName: string
): number {
  const match = rows.find((r) => r.metric_name === metricName);
  return match && match.target != null ? Number(match.target) : 0;
}

// --- Component ---
export default function TableauSSEPage() {
  const t = useTranslations('qse');
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  const selectedYear = Number(selectedPeriod);

  // Query sse_metrics for the selected year and previous year
  const {
    data: rawMetrics,
    loading: loadingMetrics,
  } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('sse_metrics')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false }),
    [selectedYear]
  );

  // Query action_plans for stats
  const {
    data: rawActionPlans,
    loading: loadingActions,
  } = useSupabaseQuery(
    (supabase) => supabase.from('action_plans').select('status')
  );

  // Query safety_reports for risk distribution
  const {
    data: rawSafetyReports,
    loading: loadingReports,
  } = useSupabaseQuery(
    (supabase) =>
      supabase.from('safety_reports').select('severity, status')
  );

  useRealtimeSubscription('sse_metrics', () => { /* refetch handled by query deps */ });
  useRealtimeSubscription('action_plans', () => { /* refetch handled by query deps */ });
  useRealtimeSubscription('safety_reports', () => { /* refetch handled by query deps */ });

  // Cast all data as Record<string, any>[]
  const metrics = (rawMetrics ?? []) as Record<string, any>[];
  const actionPlans = (rawActionPlans ?? []) as Record<string, any>[];
  const safetyReports = (rawSafetyReports ?? []) as Record<string, any>[];

  // Filter metrics for selected year and previous year
  const currentYearMetrics = useMemo(
    () => metrics.filter((m) => Number(m.year) === selectedYear),
    [metrics, selectedYear]
  );
  const previousYearMetrics = useMemo(
    () => metrics.filter((m) => Number(m.year) === selectedYear - 1),
    [metrics, selectedYear]
  );

  // Compute aggregate value for a metric across all months of a year
  function sumMetric(rows: Record<string, any>[], metricName: string): number {
    return rows
      .filter((r) => r.metric_name === metricName)
      .reduce((sum, r) => sum + Number(r.value), 0);
  }

  function avgMetric(rows: Record<string, any>[], metricName: string): number {
    const matched = rows.filter((r) => r.metric_name === metricName);
    if (matched.length === 0) return 0;
    return matched.reduce((sum, r) => sum + Number(r.value), 0) / matched.length;
  }

  // Build KPIs from real data
  const kpis: KPI[] = useMemo(() => {
    const tf = avgMetric(currentYearMetrics, 'taux_frequence');
    const tfPrev = avgMetric(previousYearMetrics, 'taux_frequence');
    const tg = avgMetric(currentYearMetrics, 'taux_gravite');
    const tgPrev = avgMetric(previousYearMetrics, 'taux_gravite');
    const jsa = getMetricValue(
      currentYearMetrics,
      'jours_sans_accident',
      currentYearMetrics.length > 0
        ? Number(currentYearMetrics[0].month)
        : undefined
    );
    const jsaPrev = getMetricValue(
      previousYearMetrics,
      'jours_sans_accident',
      previousYearMetrics.length > 0
        ? Number(previousYearMetrics[0].month)
        : undefined
    );
    const sd = currentYearMetrics.length > 0
      ? getMetricValue(currentYearMetrics, 'situations_dangereuses', Number(currentYearMetrics[0].month))
      : 0;
    const sdPrev = previousYearMetrics.length > 0
      ? getMetricValue(previousYearMetrics, 'situations_dangereuses', Number(previousYearMetrics[0].month))
      : 0;
    const qh = sumMetric(currentYearMetrics, 'quarts_heure');
    const qhPrev = sumMetric(previousYearMetrics, 'quarts_heure');
    const form = sumMetric(currentYearMetrics, 'formations');
    const formPrev = sumMetric(previousYearMetrics, 'formations');

    return [
      {
        id: 'tf',
        label: 'Taux de Fréquence (TF)',
        value: Number(tf.toFixed(2)),
        unit: '',
        target: getMetricTarget(currentYearMetrics, 'taux_frequence'),
        previousValue: Number(tfPrev.toFixed(2)),
        icon: Activity,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      },
      {
        id: 'tg',
        label: 'Taux de Gravité (TG)',
        value: Number(tg.toFixed(2)),
        unit: '',
        target: getMetricTarget(currentYearMetrics, 'taux_gravite'),
        previousValue: Number(tgPrev.toFixed(2)),
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'jsa',
        label: 'Jours sans accident',
        value: jsa,
        unit: 'jours',
        target: getMetricTarget(currentYearMetrics, 'jours_sans_accident'),
        previousValue: jsaPrev,
        icon: Award,
        color: 'text-primary',
        bgColor: 'bg-primary-50',
      },
      {
        id: 'sd',
        label: 'Situations dangereuses',
        value: sd,
        unit: 'ce mois',
        target: getMetricTarget(currentYearMetrics, 'situations_dangereuses'),
        previousValue: sdPrev,
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      },
      {
        id: 'qh',
        label: 'Quarts d\'heure sécurité',
        value: qh,
        unit: 'réalisés',
        target: getMetricTarget(currentYearMetrics, 'quarts_heure'),
        previousValue: qhPrev,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
      {
        id: 'form',
        label: 'Formations sécurité',
        value: form,
        unit: 'sessions',
        target: getMetricTarget(currentYearMetrics, 'formations'),
        previousValue: formPrev,
        icon: Users,
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
      },
    ];
  }, [currentYearMetrics, previousYearMetrics]);

  // Build monthly data from metrics
  const monthlyData: MonthlyMetric[] = useMemo(() => {
    const monthsInData = Array.from(
      new Set(currentYearMetrics.map((m) => Number(m.month)))
    ).sort((a, b) => a - b);

    return monthsInData.map((month) => {
      const monthRows = currentYearMetrics.filter(
        (m) => Number(m.month) === month
      );
      return {
        month: MONTH_NAMES[month] || String(month),
        accidents_travail: getMetricValue(monthRows, 'accidents_travail'),
        situations_dangereuses: getMetricValue(monthRows, 'situations_dangereuses'),
        quarts_heure: getMetricValue(monthRows, 'quarts_heure'),
        visites_securite: getMetricValue(monthRows, 'visites_securite'),
        formations: getMetricValue(monthRows, 'formations'),
        jours_sans_accident: getMetricValue(monthRows, 'jours_sans_accident'),
      };
    });
  }, [currentYearMetrics]);

  // Build action stats from action_plans
  const actionStats: ActionItem[] = useMemo(() => {
    const totalPlans = actionPlans.length;
    const closedPlans = actionPlans.filter((a) => a.status === 'cloture').length;
    const inProgressPlans = actionPlans.filter((a) => a.status === 'en_cours').length;

    const totalSD = sumMetric(currentYearMetrics, 'situations_dangereuses');
    const sdTarget = getMetricTarget(currentYearMetrics, 'situations_dangereuses') || Math.max(totalSD, 1);

    const totalFormations = sumMetric(currentYearMetrics, 'formations');
    const formTarget = getMetricTarget(currentYearMetrics, 'formations') || Math.max(totalFormations, 1);

    const totalVisites = sumMetric(currentYearMetrics, 'visites_securite');
    const visitesTarget = getMetricTarget(currentYearMetrics, 'visites_securite') || Math.max(totalVisites, 1);

    return [
      {
        id: '1',
        label: 'Plans d\'actions clôturés',
        value: closedPlans,
        total: totalPlans || 1,
        color: 'bg-emerald-500',
      },
      {
        id: '2',
        label: 'Actions en cours',
        value: inProgressPlans,
        total: totalPlans || 1,
        color: 'bg-blue-500',
      },
      {
        id: '3',
        label: 'Formations réalisées',
        value: totalFormations,
        total: formTarget,
        color: 'bg-sky-500',
      },
      {
        id: '4',
        label: 'Visites sécurité effectuées',
        value: totalVisites,
        total: visitesTarget,
        color: 'bg-orange-500',
      },
      {
        id: '5',
        label: 'Situations dangereuses traitées',
        value: totalSD,
        total: sdTarget,
        color: 'bg-cyan-500',
      },
    ];
  }, [actionPlans, currentYearMetrics]);

  // Build top risks from safety_reports
  const topRisks = useMemo(() => {
    const severityCounts: Record<string, number> = {};
    safetyReports.forEach((r) => {
      const sev = String(r.severity || 'autres');
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });

    const totalReports = safetyReports.length || 1;
    const sorted = Object.entries(severityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    return sorted.map(([label, count], idx) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count,
      percentage: Math.round((count / totalReports) * 100),
      color: RISK_COLORS[idx] || 'bg-gray-400',
    }));
  }, [safetyReports]);

  // Compute summary metrics
  const summaryMetrics = useMemo(() => {
    const totalAT = sumMetric(currentYearMetrics, 'accidents_travail');
    const prevAT = sumMetric(previousYearMetrics, 'accidents_travail');
    const totalPresquAcc = sumMetric(currentYearMetrics, 'presqu_accidents');
    const totalFormationHrs = sumMetric(currentYearMetrics, 'heures_formation');
    const formHrsTarget = getMetricTarget(currentYearMetrics, 'heures_formation');
    const totalVisites = sumMetric(currentYearMetrics, 'visites_securite');
    const visitesTarget = getMetricTarget(currentYearMetrics, 'visites_securite');
    const closedActions = actionPlans.filter((a) => a.status === 'cloture').length;
    const inProgressActions = actionPlans.filter((a) => a.status === 'en_cours').length;
    const totalDocs = sumMetric(currentYearMetrics, 'documents_maj');
    const docsTarget = getMetricTarget(currentYearMetrics, 'documents_maj');

    return [
      {
        label: 'Accidents du travail',
        value: String(totalAT),
        subtext: `vs ${prevAT} l'an dernier`,
        icon: Flame,
        color: 'text-red-600',
        bg: 'bg-red-50',
      },
      {
        label: 'Presqu\'accidents',
        value: String(totalPresquAcc),
        subtext: 'déclarés et traités',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
      {
        label: 'Heures de formation',
        value: totalFormationHrs > 0 ? `${totalFormationHrs}h` : '0h',
        subtext: formHrsTarget > 0 ? `objectif ${formHrsTarget}h` : '',
        icon: Users,
        color: 'text-sky-600',
        bg: 'bg-sky-50',
      },
      {
        label: 'Visites sécurité',
        value: String(totalVisites),
        subtext: visitesTarget > 0 ? `objectif ${visitesTarget}` : '',
        icon: HardHat,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: 'Actions correctives',
        value: String(closedActions + inProgressActions),
        subtext: `${inProgressActions} en cours`,
        icon: Target,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        label: 'Documents mis à jour',
        value: String(totalDocs),
        subtext: docsTarget > 0 ? `sur ${docsTarget} prévus` : '',
        icon: FileText,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
      },
    ];
  }, [currentYearMetrics, previousYearMetrics, actionPlans]);

  const isLoading = loadingMetrics || loadingActions || loadingReports;

  const maxBarValue = monthlyData.length > 0
    ? Math.max(
        ...monthlyData.map((d) =>
          Math.max(d.situations_dangereuses, d.quarts_heure, d.visites_securite)
        ),
        1
      )
    : 1;

  if (isLoading) {
    return <PageSkeleton variant="cards" />;
  }

  if (!rawMetrics || metrics.length === 0) {
    return (
      <div className="space-y-6">
        <PageBanner
          icon={Activity}
          title="Tableau de Bord SSE"
          subtitle="Indicateurs Santé, Sécurité et Environnement"
        />
        <EmptyState
          message="Aucune donnée SSE disponible"
          description="Les indicateurs apparaîtront ici une fois les premières données saisies dans le système."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBanner
        icon={Activity}
        title="Tableau de Bord SSE"
        subtitle="Indicateurs Santé, Sécurité et Environnement"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5">
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <ChevronLeft size={14} className="text-white/70" />
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm font-medium text-white bg-transparent border-none focus:outline-none px-2"
            >
              <option value="2026" className="text-text-primary">2025-2026</option>
              <option value="2025" className="text-text-primary">2024-2025</option>
            </select>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <ChevronRight size={14} className="text-white/70" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Download size={14} />
            Exporter PDF
          </button>
        </div>
      </PageBanner>

      {/* KPI Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {kpis.map((kpi) => {
          const KpiIcon = kpi.icon;
          const trend = kpi.value - kpi.previousValue;
          const isPositiveTrend =
            kpi.id === 'sd' || kpi.id === 'qh' || kpi.id === 'form' || kpi.id === 'jsa'
              ? trend > 0
              : trend < 0;
          const progressPercent = kpi.target > 0
            ? Math.min((kpi.value / kpi.target) * 100, 100)
            : 0;

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
              Évolution mensuelle
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
            {monthlyData.map((data) => (
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
            Répartition des risques identifiés
          </h2>

          <div className="space-y-3">
            {topRisks.map((risk) => (
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
              Total : {safetyReports.length} risques identifiés sur la période
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
              Taux de réalisation
            </h2>
            <span className="text-xs text-text-muted">
              Année en cours
            </span>
          </div>

          <div className="space-y-4">
            {actionStats.map((action) => {
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
            Bilan annuel cumulé
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {summaryMetrics.map((metric) => {
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
              Détail mensuel
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
              {monthlyData.map((row, index) => (
                <tr
                  key={row.month}
                  className={cn(
                    'border-b border-border-light hover:bg-gray-50 transition-colors',
                    index === monthlyData.length - 1 && 'bg-primary-50/30 font-medium'
                  )}
                >
                  <td className="px-5 py-3 font-medium text-text-primary">
                    {row.month}
                    {index === monthlyData.length - 1 && (
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
                    {monthlyData.reduce((s, d) => s + d.accidents_travail, 0)}
                  </span>
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {monthlyData.reduce((s, d) => s + d.situations_dangereuses, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {monthlyData.reduce((s, d) => s + d.quarts_heure, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {monthlyData.reduce((s, d) => s + d.visites_securite, 0)}
                </td>
                <td className="text-center px-3 py-3 text-text-primary text-xs">
                  {monthlyData.reduce((s, d) => s + d.formations, 0)}
                </td>
                <td className="text-center px-3 py-3 text-emerald-600 text-xs">
                  {monthlyData.reduce((s, d) => s + d.jours_sans_accident, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
