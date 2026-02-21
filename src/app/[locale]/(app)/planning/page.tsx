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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseQuery, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import { createEvent } from '@/lib/actions';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';
import { useToast } from '@/components/ui/Toast';

type EventType = 'formation' | 'reunion' | 'visite' | 'deadline' | 'conge';
type ViewMode = 'week' | 'month';

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; border: string }> = {
  formation: { label: 'Formation', color: '#0052CC', bg: 'bg-blue-50', border: 'border-l-[#0052CC]' },
  reunion: { label: 'Réunion', color: '#1E3A5F', bg: 'bg-slate-50', border: 'border-l-slate-700' },
  visite: { label: 'Visite', color: '#D4A017', bg: 'bg-amber-50', border: 'border-l-amber-500' },
  deadline: { label: 'Deadline', color: '#FF5630', bg: 'bg-red-50', border: 'border-l-red-500' },
  conge: { label: 'Congé', color: '#36B37E', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
};

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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function PlanningPage() {
  const t = useTranslations('planning');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: events, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('events')
        .select('*, team:teams(*)')
        .order('start_date'),
  );

  const { data: teams } = useSupabaseQuery(
    (supabase) => supabase.from('teams').select('id, name').order('name'),
  );

  useRealtimeSubscription('events', refetch);

  const allEvents = (events || []) as Record<string, any>[];
  const allTeams = (teams || []) as Record<string, any>[];

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesTeam = selectedTeam === 'all' || (event.team_id as string) === selectedTeam;
      const matchesType = selectedType === 'all' || (event.type as string) === selectedType;
      return matchesTeam && matchesType;
    });
  }, [allEvents, selectedTeam, selectedType]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Record<string, any>[]> = {};
    filteredEvents.forEach((event) => {
      const startDate = event.start_date as string;
      if (!startDate) return;
      const dateKey = startDate.split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createEvent({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: (formData.get('end_date') as string) || undefined,
        location: (formData.get('location') as string) || undefined,
        team_id: (formData.get('team_id') as string) || undefined,
      });
      toast('Événement créé avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  };

  const headerLabel = viewMode === 'week'
    ? `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()].substring(0, 3)} - ${weekDates[6].getDate()} ${MONTH_NAMES[weekDates[6].getMonth()].substring(0, 3)} ${weekDates[6].getFullYear()}`
    : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const todayKey = formatDateKey(new Date());

  if (loading) return <PageSkeleton variant="calendar" overlapping />;

  return (
    <div className="space-y-6">
      <PageBanner
        icon={Calendar}
        title="Planning d'équipe"
        subtitle={`${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''} planifié${filteredEvents.length > 1 ? 's' : ''}`}
        overlapping
      >
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-fit rounded-xl px-5 py-2.5 font-semibold text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Plus size={16} />
          Nouvel événement
        </button>
      </PageBanner>

      {/* Toolbar - overlapping the banner */}
      <div className="-mt-20 relative z-10 mb-6 flex flex-col lg:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
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
            <option value="all">Toutes les équipes</option>
            {allTeams.map((team) => (
              <option key={team.id as string} value={team.id as string}>{team.name as string}</option>
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

      {allEvents.length === 0 ? (
        <EmptyState
          message="Aucun événement"
          description="Créez votre premier événement en cliquant sur le bouton ci-dessus."
        />
      ) : (
        <>
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
                        const eventType = (event.type as EventType) || 'reunion';
                        const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.reunion;
                        const startDate = event.start_date as string;
                        const endDate = event.end_date as string | null;
                        return (
                          <div
                            key={event.id as string}
                            className={cn(
                              'rounded-lg p-2 border-l-[3px] cursor-pointer hover:shadow-sm transition-shadow',
                              config.bg
                            )}
                            style={{ borderLeftColor: config.color }}
                          >
                            <div className="text-xs font-bold text-text-primary line-clamp-2">
                              {event.title as string}
                            </div>
                            {eventType !== 'conge' && startDate && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} className="text-text-muted" />
                                <span className="text-[10px] text-text-muted">
                                  {formatTime(startDate)}{endDate ? ` - ${formatTime(endDate)}` : ''}
                                </span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin size={10} className="text-text-muted" />
                                <span className="text-[10px] text-text-muted line-clamp-1">
                                  {event.location as string}
                                </span>
                              </div>
                            )}
                            {event.team && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-text-muted">
                                  {((event.team as Record<string, any>).name as string)}
                                </span>
                              </div>
                            )}
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
                          const eventType = (event.type as EventType) || 'reunion';
                          const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.reunion;
                          return (
                            <div
                              key={event.id as string}
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white truncate cursor-pointer"
                              style={{ backgroundColor: config.color }}
                              title={event.title as string}
                            >
                              {event.title as string}
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
                .sort((a, b) => {
                  const aDate = (a.start_date as string) || '';
                  const bDate = (b.start_date as string) || '';
                  return aDate.localeCompare(bDate);
                })
                .slice(0, 6)
                .map((event) => {
                  const eventType = (event.type as EventType) || 'reunion';
                  const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.reunion;
                  const startDate = event.start_date as string;
                  const endDate = event.end_date as string | null;
                  const eventDate = new Date(startDate);
                  return (
                    <div
                      key={event.id as string}
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
                        <div className="text-sm font-semibold text-text-primary">{event.title as string}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                          {eventType !== 'conge' && startDate && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(startDate)}{endDate ? ` - ${formatTime(endDate)}` : ''}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {event.location as string}
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
                          {event.team && (
                            <span className="text-[10px] text-text-muted">
                              {((event.team as Record<string, any>).name as string)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvel événement" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre de l'événement" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Description détaillée..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type *</label>
              <select name="type" required className="input w-full">
                {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Équipe</label>
              <select name="team_id" className="input w-full">
                <option value="">-- Sélectionner --</option>
                {allTeams.map((team) => (
                  <option key={team.id as string} value={team.id as string}>{team.name as string}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de début *</label>
              <input name="start_date" type="datetime-local" required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de fin</label>
              <input name="end_date" type="datetime-local" className="input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Lieu</label>
            <input name="location" className="input w-full" placeholder="Lieu de l'événement" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
