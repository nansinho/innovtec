'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getEventColor } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useMemo } from 'react';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

export function PlanningWeek() {
  const t = useTranslations('dashboard');

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const { data: events } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('events')
        .select('id, title, type, start_date')
        .gte('start_date', monday.toISOString())
        .lte('start_date', friday.toISOString())
        .order('start_date'),
  );

  const allEvents = (events || []) as Record<string, any>[];

  const weekDays = useMemo(() => {
    return DAYS_FR.map((name, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      const dayEvents = allEvents.filter((e) => {
        const eventDate = new Date(e.start_date as string);
        return eventDate.getDate() === date.getDate() && eventDate.getMonth() === date.getMonth();
      });

      return {
        name,
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents]);

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('weekPlanning')}</h2>
        <Link href="/planning" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {weekDays.map((day) => (
          <div key={day.name} className="min-h-[120px]">
            <div className={`text-center mb-2 pb-2 border-b ${day.isToday ? 'border-primary' : 'border-border-light'}`}>
              <p className={`text-xs font-semibold ${day.isToday ? 'text-primary' : 'text-text-muted'}`}>{day.name}</p>
              <p className={`text-lg font-bold ${day.isToday ? 'text-primary' : 'text-text-primary'}`}>{day.date}</p>
            </div>
            <div className="space-y-1">
              {day.events.map((event) => {
                const type = (event.type as string) || 'reunion';
                const startDate = new Date(event.start_date as string);
                const time = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={event.id as string}
                    className="rounded-lg px-2 py-1.5 text-[11px]"
                    style={{ backgroundColor: `${getEventColor(type)}10`, borderLeft: `3px solid ${getEventColor(type)}` }}
                  >
                    <p className="font-bold" style={{ color: getEventColor(type) }}>{time}</p>
                    <p className="text-text-secondary font-medium leading-tight line-clamp-2">{event.title as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
