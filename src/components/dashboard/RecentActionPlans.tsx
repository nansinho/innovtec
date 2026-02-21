'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const COVER_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-red-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-violet-600',
];

const STATUS_LABELS: Record<string, string> = {
  en_cours: 'En cours',
  cloture: 'Cloturé',
  en_retard: 'En retard',
  annule: 'Annulé',
};

export function RecentActionPlans() {
  const t = useTranslations('dashboard');

  const { data: plans } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('*, responsible:profiles!action_plans_responsible_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(3),
  );

  const items = (plans || []) as Record<string, any>[];

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '540ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('recentActionPlans')}</h2>
        <Link href="/qse/plans-actions" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((plan, index) => {
            const responsible = plan.responsible as { first_name: string; last_name: string } | null;
            const status = (plan.status as string) || 'en_cours';

            return (
              <Link key={plan.id as string} href={`/qse/plans-actions/${plan.id}`}>
                <div className="card overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
                  <div className={`h-2 bg-gradient-to-r ${COVER_COLORS[index % COVER_COLORS.length]}`} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('badge', getStatusColor(status))}>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {plan.title as string}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      {responsible && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {responsible.first_name} {responsible.last_name}
                        </span>
                      )}
                      {plan.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(plan.due_date as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucun plan d&apos;action récent</p>
      )}
    </div>
  );
}
