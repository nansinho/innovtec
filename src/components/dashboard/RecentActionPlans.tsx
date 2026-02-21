'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, User, ClipboardList } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import { DonutChart } from '@/components/charts/DonutChart';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const STATUS_LABELS: Record<string, string> = {
  en_cours: 'En cours',
  cloture: 'Cloturé',
  en_retard: 'En retard',
  annule: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  en_cours: '#0052CC',
  cloture: '#36B37E',
  en_retard: '#FF5630',
  annule: '#97A0AF',
};

const STATUS_BORDER: Record<string, string> = {
  en_cours: 'border-l-primary',
  cloture: 'border-l-success',
  en_retard: 'border-l-danger',
  annule: 'border-l-text-muted',
};

export function RecentActionPlans() {
  const t = useTranslations('dashboard');

  const { data: allPlans } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('status'),
  );

  const { data: plans } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('*, responsible:profiles!action_plans_responsible_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
  );

  const items = (plans || []) as Record<string, any>[];
  const allItems = (allPlans || []) as Record<string, any>[];

  // Distribution stats for mini donut
  const statusCounts = {
    en_cours: allItems.filter((p) => p.status === 'en_cours').length,
    cloture: allItems.filter((p) => p.status === 'cloture').length,
    en_retard: allItems.filter((p) => p.status === 'en_retard').length,
  };
  const closureRate = allItems.length > 0 ? Math.round((statusCounts.cloture / allItems.length) * 100) : 0;

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '620ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600">
            <ClipboardList size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('recentActionPlans')}</h2>
            <p className="text-xs text-text-muted">{allItems.length} total</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini distribution */}
          <div className="hidden md:flex items-center gap-3">
            <DonutChart
              value={closureRate}
              max={100}
              size={40}
              strokeWidth={5}
              color="#36B37E"
              showPercentage={false}
              className="flex-shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-text-muted">{statusCounts.en_cours} en cours</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-text-muted">{statusCounts.cloture} cloturés</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2 w-2 rounded-full bg-danger" />
                <span className="text-text-muted">{statusCounts.en_retard} en retard</span>
              </div>
            </div>
          </div>

          <Link href="/qse/plans-actions" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors group">
            {t('viewAll')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((plan) => {
            const responsible = plan.responsible as { first_name: string; last_name: string } | null;
            const status = (plan.status as string) || 'en_cours';
            const borderClass = STATUS_BORDER[status] || 'border-l-primary';

            return (
              <Link key={plan.id as string} href={`/qse/plans-actions/${plan.id}`}>
                <div className={cn(
                  'flex items-center gap-4 p-3.5 rounded-xl border-l-4 hover:bg-background/50 transition-all cursor-pointer group',
                  borderClass
                )}>
                  {/* Status indicator */}
                  <div
                    className="flex-shrink-0 h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] || '#0052CC' }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {plan.title as string}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                      {responsible && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {responsible.first_name} {responsible.last_name}
                        </span>
                      )}
                      {plan.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(plan.due_date as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={cn('badge text-[10px]', getStatusColor(status))}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <ClipboardList size={28} className="text-text-muted/30 mb-2" />
          <p className="text-sm text-text-muted">Aucun plan d&apos;action récent</p>
        </div>
      )}
    </div>
  );
}
