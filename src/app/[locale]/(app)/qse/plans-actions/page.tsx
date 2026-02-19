'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  ClipboardList,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Filter,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

// --- Types ---
interface ActionPlan {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  status: 'en_cours' | 'cloture' | 'en_retard';
  responsible: { first_name: string; last_name: string };
  origin: string;
  due_date: string;
  progress: number;
  created_at: string;
}

// --- Demo Data ---
const DEMO_ACTIONS: ActionPlan[] = [
  {
    id: '1',
    reference: 'PA-2026-018',
    title: 'Mise en place du blindage systematique',
    description:
      'Deployer le blindage de tranchee obligatoire pour toute fouille superieure a 1m30 sur l\'ensemble des chantiers FTTH.',
    priority: 'urgente',
    status: 'en_cours',
    responsible: { first_name: 'Pierre', last_name: 'Oliveira' },
    origin: 'SD-2026-042',
    due_date: '2026-02-28',
    progress: 60,
    created_at: '2026-02-18',
  },
  {
    id: '2',
    reference: 'PA-2026-017',
    title: 'Formation habilitation electrique B1V',
    description:
      'Organiser une session de formation habilitation electrique B1V pour les 8 techniciens de l\'equipe Telecom Rive Droite.',
    priority: 'haute',
    status: 'en_cours',
    responsible: { first_name: 'Sophie', last_name: 'Martin' },
    origin: 'Audit interne',
    due_date: '2026-03-15',
    progress: 35,
    created_at: '2026-02-10',
  },
  {
    id: '3',
    reference: 'PA-2026-016',
    title: 'Renouvellement des gilets haute visibilite',
    description:
      'Commander et distribuer 50 gilets HV classe 2 pour remplacer les gilets uses sur les chantiers zone nord.',
    priority: 'normale',
    status: 'cloture',
    responsible: { first_name: 'Claire', last_name: 'Petit' },
    origin: 'Visite de chantier',
    due_date: '2026-02-15',
    progress: 100,
    created_at: '2026-01-20',
  },
  {
    id: '4',
    reference: 'PA-2026-015',
    title: 'Revision des fiches de poste securite',
    description:
      'Mettre a jour les 12 fiches de poste securite suite aux evolutions reglementaires et aux retours terrain des chefs d\'equipe.',
    priority: 'haute',
    status: 'en_retard',
    responsible: { first_name: 'Maria', last_name: 'Silva' },
    origin: 'Revue de direction',
    due_date: '2026-02-01',
    progress: 45,
    created_at: '2025-12-15',
  },
  {
    id: '5',
    reference: 'PA-2026-014',
    title: 'Installation de bennes de tri sur 3 chantiers',
    description:
      'Deployer le nouveau systeme de tri selectif 4 flux (bois, metaux, plastiques, DIB) sur les chantiers Merignac, Pessac et Begles.',
    priority: 'normale',
    status: 'en_cours',
    responsible: { first_name: 'Claire', last_name: 'Petit' },
    origin: 'Plan environnement',
    due_date: '2026-03-31',
    progress: 20,
    created_at: '2026-02-01',
  },
  {
    id: '6',
    reference: 'PA-2026-013',
    title: 'Audit interne securite chantier Le Bouscat',
    description:
      'Realiser l\'audit interne securite du chantier FTTH Le Bouscat suite aux deux situations dangereuses declarees en janvier.',
    priority: 'urgente',
    status: 'en_retard',
    responsible: { first_name: 'Maria', last_name: 'Silva' },
    origin: 'SD-2026-036',
    due_date: '2026-02-10',
    progress: 30,
    created_at: '2026-01-28',
  },
  {
    id: '7',
    reference: 'PA-2026-012',
    title: 'Mise a jour du document unique (DUERP)',
    description:
      'Actualiser le Document Unique d\'Evaluation des Risques Professionnels avec les nouveaux risques identifies au T4 2025.',
    priority: 'haute',
    status: 'cloture',
    responsible: { first_name: 'Maria', last_name: 'Silva' },
    origin: 'Obligation legale',
    due_date: '2026-01-31',
    progress: 100,
    created_at: '2025-11-15',
  },
  {
    id: '8',
    reference: 'PA-2026-011',
    title: 'Campagne de sensibilisation bruit chantier',
    description:
      'Organiser une campagne de sensibilisation sur les nuisances sonores pour les equipes intervenant en zone residentielle.',
    priority: 'basse',
    status: 'en_cours',
    responsible: { first_name: 'Thomas', last_name: 'Ferreira' },
    origin: 'Plainte riverains',
    due_date: '2026-04-15',
    progress: 10,
    created_at: '2026-02-05',
  },
  {
    id: '9',
    reference: 'PA-2026-010',
    title: 'Controle annuel des extincteurs vehicules',
    description:
      'Planifier et realiser le controle annuel des 35 extincteurs embarques dans les vehicules de chantier.',
    priority: 'normale',
    status: 'cloture',
    responsible: { first_name: 'Carlos', last_name: 'Santos' },
    origin: 'Maintenance preventive',
    due_date: '2026-01-15',
    progress: 100,
    created_at: '2025-12-01',
  },
  {
    id: '10',
    reference: 'PA-2026-009',
    title: 'Procedure d\'accueil interimaires chantier gaz',
    description:
      'Creer une procedure specifique d\'accueil securite pour les interimaires affectes aux chantiers gaz. Inclut test de competences.',
    priority: 'haute',
    status: 'en_cours',
    responsible: { first_name: 'Sophie', last_name: 'Martin' },
    origin: 'REX chantier Pessac',
    due_date: '2026-03-01',
    progress: 55,
    created_at: '2026-01-15',
  },
];

// --- Helpers ---
function getPriorityConfig(priority: ActionPlan['priority']) {
  const map = {
    basse: { label: 'Basse', color: 'text-blue-600 bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' },
    normale: { label: 'Normale', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
    haute: { label: 'Haute', color: 'text-orange-600 bg-orange-50 border-orange-200', dotColor: 'bg-orange-500' },
    urgente: { label: 'Urgente', color: 'text-red-600 bg-red-50 border-red-200', dotColor: 'bg-red-500' },
  };
  return map[priority];
}

function getColumnConfig(status: string) {
  const map: Record<string, { title: string; icon: typeof Clock; color: string; headerBg: string }> = {
    en_cours: { title: 'En cours', icon: Clock, color: 'text-blue-600', headerBg: 'bg-blue-500' },
    cloture: { title: 'Cloture', icon: CheckCircle2, color: 'text-emerald-600', headerBg: 'bg-emerald-500' },
    en_retard: { title: 'En retard', icon: AlertTriangle, color: 'text-red-600', headerBg: 'bg-red-500' },
  };
  return map[status];
}

function getDaysRemaining(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// --- Component ---
export default function PlansActionsPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredActions = DEMO_ACTIONS.filter((action) => {
    const matchesPriority =
      priorityFilter === 'all' || action.priority === priorityFilter;
    const matchesSearch =
      searchQuery === '' ||
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const columns: Array<'en_cours' | 'cloture' | 'en_retard'> = ['en_cours', 'cloture', 'en_retard'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10">
              <Target size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Plans d&apos;Actions
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Suivi et gestion des plans d&apos;actions QSE
              </p>
            </div>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Nouveau plan d&apos;action
        </button>
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par reference ou titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-text-muted" />
          {[
            { label: 'Toutes', value: 'all' },
            { label: 'Basse', value: 'basse' },
            { label: 'Normale', value: 'normale' },
            { label: 'Haute', value: 'haute' },
            { label: 'Urgente', value: 'urgente' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPriorityFilter(p.value)}
              className={cn(
                'rounded-button px-3 py-1.5 text-xs font-medium transition-all duration-200',
                priorityFilter === p.value
                  ? p.value === 'all'
                    ? 'bg-primary text-white'
                    : cn(getPriorityConfig(p.value as ActionPlan['priority']).color, 'border')
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        {columns.map((colStatus) => {
          const config = getColumnConfig(colStatus);
          const ColIcon = config.icon;
          const colActions = filteredActions.filter(
            (a) => a.status === colStatus
          );

          return (
            <div key={colStatus} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: colStatus === 'en_cours' ? '#0052CC' : colStatus === 'cloture' ? '#36B37E' : '#FF5630' }}>
                <ColIcon size={16} className={config.color} />
                <h2 className={cn('text-sm font-bold', config.color)}>
                  {config.title}
                </h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-text-secondary">
                  {colActions.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {colActions.map((action) => {
                  const priorityConfig = getPriorityConfig(action.priority);
                  const gradient = getAvatarGradient(
                    action.responsible.first_name + action.responsible.last_name
                  );
                  const initials = getInitials(
                    action.responsible.first_name,
                    action.responsible.last_name
                  );
                  const daysRemaining = getDaysRemaining(action.due_date);

                  return (
                    <div
                      key={action.id}
                      className="card p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
                    >
                      {/* Reference + Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                          {action.reference}
                        </span>
                        <span
                          className={cn(
                            'badge gap-1 text-[10px] border',
                            priorityConfig.color
                          )}
                        >
                          <Flag size={9} />
                          {priorityConfig.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                        {action.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                        {action.description}
                      </p>

                      {/* Origin */}
                      <div className="flex items-center gap-1 mb-3">
                        <ArrowRight size={10} className="text-text-muted" />
                        <span className="text-[10px] text-text-muted">
                          Origine : {action.origin}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-text-secondary">
                            Progression
                          </span>
                          <span className="text-[10px] font-bold text-text-primary">
                            {action.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              action.progress === 100
                                ? 'bg-emerald-500'
                                : action.status === 'en_retard'
                                ? 'bg-red-500'
                                : 'bg-primary'
                            )}
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border-light">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                          >
                            {initials}
                          </div>
                          <span className="text-[10px] text-text-secondary">
                            {action.responsible.first_name} {action.responsible.last_name}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'flex items-center gap-1 text-[10px] font-medium',
                            action.status === 'cloture'
                              ? 'text-emerald-600'
                              : daysRemaining < 0
                              ? 'text-red-600'
                              : daysRemaining <= 7
                              ? 'text-amber-600'
                              : 'text-text-muted'
                          )}
                        >
                          <Calendar size={10} />
                          {action.status === 'cloture'
                            ? 'Termine'
                            : daysRemaining < 0
                            ? `${Math.abs(daysRemaining)}j en retard`
                            : daysRemaining === 0
                            ? "Aujourd'hui"
                            : `${daysRemaining}j restants`}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colActions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border-light rounded-card">
                    <p className="text-xs text-text-muted">
                      Aucun plan d&apos;action
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
