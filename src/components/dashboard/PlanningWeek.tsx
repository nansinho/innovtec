'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getEventColor } from '@/lib/utils';

interface WeekEvent {
  id: string;
  title: string;
  type: string;
  time: string;
  day: number; // 0=lundi, 4=vendredi
}

const DEMO_EVENTS: WeekEvent[] = [
  { id: '1', title: 'Réunion QSE hebdo', type: 'reunion', time: '09:00', day: 0 },
  { id: '2', title: 'Formation SST - Groupe A', type: 'formation', time: '08:30', day: 0 },
  { id: '3', title: 'Visite chantier Mérignac', type: 'visite', time: '14:00', day: 1 },
  { id: '4', title: 'Point d\'avancement projets', type: 'reunion', time: '10:00', day: 2 },
  { id: '5', title: 'Formation habilitation élec.', type: 'formation', time: '09:00', day: 3 },
  { id: '6', title: 'Deadline rapport mensuel SSE', type: 'deadline', time: '17:00', day: 4 },
  { id: '7', title: 'Congé - P. Oliveira', type: 'conge', time: '', day: 4 },
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

export function PlanningWeek() {
  const t = useTranslations('dashboard');

  const today = new Date();
  const dayOfWeek = today.getDay();
  // Adjust to get Monday (0) - Sunday was 0, Monday was 1
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays = DAYS_FR.map((name, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + idx);
    return {
      name,
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      events: DEMO_EVENTS.filter((e) => e.day === idx),
    };
  });

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('weekPlanning')}</h2>
        <Link
          href="/planning"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {weekDays.map((day) => (
          <div key={day.name} className="min-h-[120px]">
            <div className={`text-center mb-2 pb-2 border-b ${day.isToday ? 'border-primary' : 'border-border-light'}`}>
              <p className={`text-xs font-semibold ${day.isToday ? 'text-primary' : 'text-text-muted'}`}>
                {day.name}
              </p>
              <p className={`text-lg font-bold ${day.isToday ? 'text-primary' : 'text-text-primary'}`}>
                {day.date}
              </p>
            </div>
            <div className="space-y-1">
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg px-2 py-1.5 text-[11px]"
                  style={{
                    backgroundColor: `${getEventColor(event.type)}10`,
                    borderLeft: `3px solid ${getEventColor(event.type)}`,
                  }}
                >
                  {event.time && (
                    <p className="font-bold" style={{ color: getEventColor(event.type) }}>
                      {event.time}
                    </p>
                  )}
                  <p className="text-text-secondary font-medium leading-tight line-clamp-2">
                    {event.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
