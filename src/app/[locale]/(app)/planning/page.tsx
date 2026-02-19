'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EventType = 'formation' | 'reunion' | 'visite' | 'deadline' | 'conge';
type ViewMode = 'week' | 'month';

interface PlanningEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  team: string;
  participants: string[];
}

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; border: string }> = {
  formation: { label: 'Formation', color: '#0052CC', bg: 'bg-blue-50', border: 'border-l-[#0052CC]' },
  reunion: { label: 'Réunion', color: '#6B21A8', bg: 'bg-purple-50', border: 'border-l-purple-700' },
  visite: { label: 'Visite', color: '#FF6B35', bg: 'bg-orange-50', border: 'border-l-orange-500' },
  deadline: { label: 'Deadline', color: '#FF5630', bg: 'bg-red-50', border: 'border-l-red-500' },
  conge: { label: 'Congé', color: '#36B37E', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
};

const TEAMS = ['Toutes les équipes', 'Direction', 'QSE', 'Travaux', 'Administration', 'Bureau d\'études'];

function getWeekDates(baseDate: Date): Date[] {
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMonthDates(baseDate: Date): Date[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const diff = startDay === 0 ? -6 : 1 - startDay;
  const startDate = new Date(year, month, 1 + diff);

  const dates: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const today = new Date();
const monday = new Date(today);
const dayOfWeek = monday.getDay();
const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
monday.setDate(monday.getDate() + mondayDiff);

function dateOffset(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

const DEMO_EVENTS: PlanningEvent[] = [
  {
    id: '1',
    title: 'Formation Habilitation Électrique B1V',
    type: 'formation',
    date: dateOffset(monday, 0),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Salle A - Siège Bordeaux',
    team: 'Travaux',
    participants: ['Jean Dupont', 'Thomas Ferreira', 'Carlos Santos'],
  },
  {
    id: '2',
    title: 'Réunion hebdomadaire Direction',
    type: 'reunion',
    date: dateOffset(monday, 0),
    startTime: '10:00',
    endTime: '11:30',
    location: 'Salle de conférence',
    team: 'Direction',
    participants: ['Nicolas Bernard', 'Ana Costa'],
  },
  {
    id: '3',
    title: 'Visite chantier Mérignac - Fibre FTTH',
    type: 'visite',
    date: dateOffset(monday, 1),
    startTime: '08:30',
    endTime: '12:00',
    location: 'Chantier Mérignac Lot 3',
    team: 'Travaux',
    participants: ['Pierre Oliveira', 'Maria Silva'],
  },
  {
    id: '4',
    title: 'Remise DOE Chantier Talence',
    type: 'deadline',
    date: dateOffset(monday, 2),
    startTime: '18:00',
    endTime: '18:00',
    team: 'Bureau d\'études',
    participants: ['Sophie Martin'],
  },
  {
    id: '5',
    title: 'Congé annuel - Thomas Ferreira',
    type: 'conge',
    date: dateOffset(monday, 3),
    startTime: '00:00',
    endTime: '23:59',
    team: 'Travaux',
    participants: ['Thomas Ferreira'],
  },
  {
    id: '6',
    title: 'Formation CACES Nacelle R486',
    type: 'formation',
    date: dateOffset(monday, 3),
    startTime: '08:00',
    endTime: '16:30',
    location: 'Centre de formation AFPA',
    team: 'Travaux',
    participants: ['Miguel Rodrigues', 'Carlos Santos'],
  },
  {
    id: '7',
    title: 'Réunion QSE mensuelle',
    type: 'reunion',
    date: dateOffset(monday, 4),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Salle B - Siège',
    team: 'QSE',
    participants: ['Maria Silva', 'Claire Petit', 'Nicolas Bernard'],
  },
  {
    id: '8',
    title: 'Visite sécurité chantier Pessac Gaz',
    type: 'visite',
    date: dateOffset(monday, 4),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Chantier Pessac - Réseau Gaz',
    team: 'QSE',
    participants: ['Maria Silva', 'Jean Dupont'],
  },
  {
    id: '9',
    title: 'Date limite inscription formations Q2',
    type: 'deadline',
    date: dateOffset(monday, 5),
    startTime: '23:59',
    endTime: '23:59',
    team: 'Administration',
    participants: ['Lucie Moreau'],
  },
  {
    id: '10',
    title: 'Congé annuel - Isabelle Dubois',
    type: 'conge',
    date: dateOffset(monday, 1),
    startTime: '00:00',
    endTime: '23:59',
    team: 'Administration',
    participants: ['Isabelle Dubois'],
  },
  {
    id: '11',
    title: 'Réunion de lancement chantier Bègles',
    type: 'reunion',
    date: dateOffset(monday, 2),
    startTime: '09:00',
    endTime: '10:30',
    location: 'Visioconférence Teams',
    team: 'Travaux',
    participants: ['Pierre Oliveira', 'Jean Dupont', 'Nicolas Bernard'],
  },
  {
    id: '12',
    title: 'Formation SST Recyclage',
    type: 'formation',
    date: dateOffset(monday, 8),
    startTime: '08:30',
    endTime: '17:00',
    location: 'Salle A - Siège Bordeaux',
    team: 'Travaux',
    participants: ['Miguel Rodrigues', 'Thomas Ferreira'],
  },
];

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function PlanningPage() {
  const t = useTranslations('planning');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState('Toutes les équipes');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return DEMO_EVENTS.filter((event) => {
      const matchesTeam = selectedTeam === 'Toutes les équipes' || event.team === selectedTeam;
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesTeam && matchesType;
    });
  }, [selectedTeam, selectedType]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, PlanningEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [filteredEvents]);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  function navigateDate(direction: number) {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const headerLabel = viewMode === 'week'
    ? `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()].substring(0, 3)} - ${weekDates[6].getDate()} ${MONTH_NAMES[weekDates[6].getMonth()].substring(0, 3)} ${weekDates[6].getFullYear()}`
    : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const todayKey = formatDateKey(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Planning d&apos;équipe</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} planifié{filteredEvents.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Nouvel événement
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {/* View toggle and navigation */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-button border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                viewMode === 'week' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-l border-border',
                viewMode === 'month' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              Mois
            </button>
          </div>

          <button
            onClick={goToToday}
            className="btn-secondary text-xs px-3 py-2"
          >
            Aujourd&apos;hui
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-button border border-border bg-white text-text-secondary hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-text-primary min-w-[200px] text-center">
              {headerLabel}
            </span>
            <button
              onClick={() => navigateDate(1)}
              className="flex h-9 w-9 items-center justify-center rounded-button border border-border bg-white text-text-secondary hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 ml-auto">
          <Filter size={16} className="text-text-muted" />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="input w-auto text-sm"
          >
            {TEAMS.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">Tous les types</option>
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event type legend */}
      <div className="flex items-center gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs text-text-secondary">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="grid grid-cols-7 border-b border-border-light">
            {weekDates.map((date, idx) => {
              const isToday = formatDateKey(date) === todayKey;
              return (
                <div
                  key={idx}
                  className={cn(
                    'p-3 text-center border-r border-border-light last:border-r-0',
                    isToday && 'bg-primary-50'
                  )}
                >
                  <div className="text-xs font-medium text-text-muted uppercase">
                    {DAY_NAMES_SHORT[idx]}
                  </div>
                  <div
                    className={cn(
                      'text-lg font-bold mt-1',
                      isToday ? 'text-primary' : 'text-text-primary'
                    )}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDates.map((date, idx) => {
              const dateKey = formatDateKey(date);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={idx}
                  className={cn(
                    'border-r border-border-light last:border-r-0 p-2 space-y-1.5',
                    isToday && 'bg-primary-50/30'
                  )}
                >
                  {dayEvents.map((event) => {
                    const config = EVENT_TYPE_CONFIG[event.type];
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'rounded-lg p-2 border-l-[3px] cursor-pointer hover:shadow-sm transition-shadow',
                          config.bg
                        )}
                        style={{ borderLeftColor: config.color }}
                      >
                        <div className="text-xs font-bold text-text-primary line-clamp-2">
                          {event.title}
                        </div>
                        {event.type !== 'conge' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={10} className="text-text-muted" />
                            <span className="text-[10px] text-text-muted">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-text-muted" />
                            <span className="text-[10px] text-text-muted line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Users size={10} className="text-text-muted" />
                          <span className="text-[10px] text-text-muted">
                            {event.participants.length} participant{event.participants.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="grid grid-cols-7 border-b border-border-light">
            {DAY_NAMES_SHORT.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-text-muted uppercase border-r border-border-light last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {monthDates.map((date, idx) => {
              const dateKey = formatDateKey(date);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[100px] border-r border-b border-border-light p-1.5',
                    !isCurrentMonth && 'bg-gray-50/50',
                    isToday && 'bg-primary-50/30'
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-medium mb-1',
                      isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                    )}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => {
                      const config = EVENT_TYPE_CONFIG[event.type];
                      return (
                        <div
                          key={event.id}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white truncate cursor-pointer"
                          style={{ backgroundColor: config.color }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-text-muted font-medium pl-1">
                        +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming events sidebar list */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          Prochains événements
        </h2>
        <div className="space-y-3">
          {filteredEvents
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
            .slice(0, 6)
            .map((event) => {
              const config = EVENT_TYPE_CONFIG[event.type];
              const eventDate = new Date(event.date);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-center min-w-[48px]">
                    <span className="text-xs font-medium text-text-muted uppercase">
                      {DAY_NAMES_SHORT[(eventDate.getDay() + 6) % 7]}
                    </span>
                    <span className="text-lg font-bold text-text-primary">{eventDate.getDate()}</span>
                    <span className="text-[10px] text-text-muted">
                      {MONTH_NAMES[eventDate.getMonth()].substring(0, 3)}
                    </span>
                  </div>
                  <div
                    className="w-1 self-stretch rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">{event.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                      {event.type !== 'conge' && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.startTime} - {event.endTime}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="badge text-white text-[10px]"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.label}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {event.participants.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
