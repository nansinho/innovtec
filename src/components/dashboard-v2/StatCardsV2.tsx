'use client';

import { DollarSign, Users, ShoppingBag, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statCards, type StatCardData } from './mock-data';

const iconMap = {
  dollarSign: DollarSign,
  users: Users,
  shoppingBag: ShoppingBag,
  refreshCw: RefreshCw,
} as const;

export function StatCardsV2() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((card: StatCardData, i: number) => {
        const IconComponent = iconMap[card.icon];
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-border-light/60 p-5 opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            style={{
              animationDelay: `${i * 80}ms`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.iconBgColor)}>
                <IconComponent size={20} className={card.iconColor} />
              </div>
              <p className="text-sm font-medium text-text-muted">{card.title}</p>
            </div>
            <p className="text-2xl font-extrabold text-text-primary tracking-tight">{card.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {card.trend >= 0 ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-danger" />
              )}
              <span className={cn('text-xs font-bold', card.trend >= 0 ? 'text-success' : 'text-danger')}>
                {card.trend > 0 ? '+' : ''}{card.trend}%
              </span>
              <span className="text-xs text-text-muted">{card.trendLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
