'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, User, ClipboardList } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const COVER_GRADIENTS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-red-500 via-rose-500 to-pink-400',
  'from-emerald-600 via-emerald-500 to-teal-400',
  'from-amber-500 via-orange-500 to-red-400',
  'from-purple-600 via-violet-500 to-indigo-400',
];

const STATUS_LABELS: Record<string, string> = {
  en_cours: 'En cours',
  cloture: 'Clotur\u00e9',
  en_retard: 'En retard',
  annule: 'Annul\u00e9',
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
    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '620ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600">
            <ClipboardList size={18} strokeWidth={1.8} />
          </div>
          <h2 className="section-title">{t('recentActionPlans')}</h2>
        </div>
        <Link href="/qse/plans-actions" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          Voir tout <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((plan, index) => {
            const responsible = plan.responsible as { first_name: string; last_name: string } | null;
            const status = (plan.status as string) || 'en_cours';

            return (
              <Link key={plan.id as string} href={`/qse/plans-actions/${plan.id}`}>
                <div className="card-elevated overflow-hidden group cursor-pointer hover:-translate-y-1">
                  {/* Gradient top bar */}
                  <div className={`relative h-20 bg-gradient-to-br ${COVER_GRADIENTS[index % COVER_GRADIENTS.length]} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20" />
                      <div className="absolute left-1/4 bottom-0 h-16 w-16 rounded-full bg-white/10" />
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <ClipboardList size={24} className="text-white" />
                    </div>
                  </div>
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
        <p className="text-sm text-text-muted text-center py-4">Aucun plan d&apos;action r&eacute;cent</p>
      )}
    </div>
  );
}
