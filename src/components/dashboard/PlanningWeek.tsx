'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, getEventColor } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

const EVENT_ICONS: Record<string, string> = {
  formation: 'F',
  reunion: 'R',
  visite: 'V',
  deadline: 'D',
  conge: 'C',
};

export function PlanningWeek() {
  const t = useTranslations('dashboard');
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const mondayISO = monday.toISOString();
  const fridayISO = friday.toISOString();

  const { data: events } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('events')
        .select('id, title, type, start_date')
        .gte('start_date', mondayISO)
        .lte('start_date', fridayISO)
        .order('start_date'),
    [mondayISO, fridayISO],
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
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, monday.toISOString()]);

  const totalEvents = allEvents.length;

  return (
    <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 text-cyan-600">
            <CalendarDays size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('weekPlanning')}</h2>
            <p className="text-xs text-text-muted">{totalEvents} {t('eventsThisWeek')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Week navigation */}
          <div className="flex items-center gap-1 rounded-xl bg-background/80 p-1 border border-border-light/40">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-text-muted hover:text-text-primary"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all',
                weekOffset === 0 ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {t('thisWeek')}
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-text-muted hover:text-text-primary"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <Link href="/planning" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors group">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {weekDays.map((day) => (
          <div
            key={day.name}
            className={cn(
              'min-h-[140px] rounded-xl p-3 transition-all',
              day.isToday
                ? 'bg-primary/5 border-2 border-primary/20 shadow-sm'
                : 'bg-background/40 border border-border-light/30 hover:bg-background/70'
            )}
          >
            <div className="text-center mb-3">
              <p className={cn('text-[10px] font-bold uppercase tracking-wider', day.isToday ? 'text-primary' : 'text-text-muted')}>
                {day.name}
              </p>
              <p className={cn('text-xl font-extrabold', day.isToday ? 'text-primary' : 'text-text-primary')}>
                {day.date}
              </p>
              {day.events.length > 0 && (
                <div className={cn('mx-auto mt-1 h-1 w-6 rounded-full', day.isToday ? 'bg-primary' : 'bg-text-muted/30')} />
              )}
            </div>
            <div className="space-y-1.5">
              {day.events.map((event) => {
                const type = (event.type as string) || 'reunion';
                const startDate = new Date(event.start_date as string);
                const time = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                const color = getEventColor(type);
                return (
                  <div
                    key={event.id as string}
                    className="rounded-lg px-2 py-1.5 text-[10px] transition-all hover:scale-[1.03] cursor-pointer"
                    style={{ backgroundColor: `${color}12`, borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[9px] rounded px-1 py-0.5 text-white" style={{ backgroundColor: color }}>
                        {EVENT_ICONS[type] || 'E'}
                      </span>
                      <span className="font-bold" style={{ color }}>{time}</span>
                    </div>
                    <p className="text-text-secondary font-medium leading-tight line-clamp-1 mt-0.5">{event.title as string}</p>
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
