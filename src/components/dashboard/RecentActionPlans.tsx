'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';

interface ActionPlanItem {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  priority: string;
  due_date: string;
  responsible: string;
  cover_color: string;
}

const DEMO_PLANS: ActionPlanItem[] = [
  {
    id: '1',
    title: 'Mise en conformité EPI chantier Nord',
    status: 'en_cours',
    statusLabel: 'En cours',
    priority: 'haute',
    due_date: '15 Jan 2025',
    responsible: 'Jean Dupont',
    cover_color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    title: 'Audit sécurité tranchée - Lot 7',
    status: 'en_retard',
    statusLabel: 'En retard',
    priority: 'urgente',
    due_date: '10 Jan 2025',
    responsible: 'Pierre Oliveira',
    cover_color: 'from-red-500 to-rose-600',
  },
  {
    id: '3',
    title: 'Installation signalisation chantier A63',
    status: 'en_cours',
    statusLabel: 'En cours',
    priority: 'normale',
    due_date: '28 Jan 2025',
    responsible: 'Maria Silva',
    cover_color: 'from-emerald-500 to-teal-600',
  },
];

export function RecentActionPlans() {
  const t = useTranslations('dashboard');

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '540ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('recentActionPlans')}</h2>
        <Link
          href="/qse/plans-actions"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_PLANS.map((plan) => (
          <div key={plan.id} className="card overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
            {/* Color header */}
            <div className={`h-2 bg-gradient-to-r ${plan.cover_color}`} />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('badge', getStatusColor(plan.status))}>
                  {plan.statusLabel}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-3">
                {plan.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {plan.responsible}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {plan.due_date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
