'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingDown,
  CalendarDays,
  Receipt,
  FolderOpen,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Briefcase,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

type LeaveStatus = 'approuve' | 'en_attente' | 'refuse';

interface LeaveRequest {
  id: string;
  employee: { first_name: string; last_name: string };
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: LeaveStatus;
  submitted_at: string;
}

interface QuickLink {
  label: string;
  description: string;
  icon: typeof CalendarDays;
  color: string;
  bg: string;
  count?: number;
}

const LEAVE_STATUS_CONFIG: Record<LeaveStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  approuve: { label: 'Approuvé', icon: CheckCircle2, color: 'text-success bg-emerald-50' },
  en_attente: { label: 'En attente', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  refuse: { label: 'Refusé', icon: XCircle, color: 'text-danger bg-red-50' },
};

const DEMO_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    employee: { first_name: 'Thomas', last_name: 'Ferreira' },
    type: 'Congés payés',
    start_date: '2026-03-02',
    end_date: '2026-03-06',
    days: 5,
    status: 'en_attente',
    submitted_at: '2026-02-17',
  },
  {
    id: '2',
    employee: { first_name: 'Carlos', last_name: 'Santos' },
    type: 'RTT',
    start_date: '2026-02-27',
    end_date: '2026-02-27',
    days: 1,
    status: 'approuve',
    submitted_at: '2026-02-14',
  },
  {
    id: '3',
    employee: { first_name: 'Isabelle', last_name: 'Dubois' },
    type: 'Congés payés',
    start_date: '2026-02-24',
    end_date: '2026-02-28',
    days: 5,
    status: 'approuve',
    submitted_at: '2026-02-10',
  },
  {
    id: '4',
    employee: { first_name: 'Miguel', last_name: 'Rodrigues' },
    type: 'Congé maladie',
    start_date: '2026-02-18',
    end_date: '2026-02-19',
    days: 2,
    status: 'approuve',
    submitted_at: '2026-02-18',
  },
  {
    id: '5',
    employee: { first_name: 'Jean', last_name: 'Dupont' },
    type: 'Congés payés',
    start_date: '2026-04-13',
    end_date: '2026-04-24',
    days: 10,
    status: 'en_attente',
    submitted_at: '2026-02-15',
  },
  {
    id: '6',
    employee: { first_name: 'Claire', last_name: 'Petit' },
    type: 'RTT',
    start_date: '2026-03-14',
    end_date: '2026-03-14',
    days: 1,
    status: 'refuse',
    submitted_at: '2026-02-12',
  },
  {
    id: '7',
    employee: { first_name: 'Pierre', last_name: 'Oliveira' },
    type: 'Congé formation',
    start_date: '2026-03-10',
    end_date: '2026-03-12',
    days: 3,
    status: 'en_attente',
    submitted_at: '2026-02-16',
  },
];

const QUICK_LINKS: QuickLink[] = [
  {
    label: 'Demandes de congés',
    description: 'Gérer les demandes de congés et absences',
    icon: CalendarDays,
    color: 'text-primary',
    bg: 'bg-primary-50',
    count: 3,
  },
  {
    label: 'Notes de frais',
    description: 'Soumettre et suivre vos notes de frais',
    icon: Receipt,
    color: 'text-accent',
    bg: 'bg-accent-50',
    count: 5,
  },
  {
    label: 'Documents administratifs',
    description: 'Accéder à vos bulletins de paie et contrats',
    icon: FolderOpen,
    color: 'text-success',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Entretiens',
    description: 'Planifier et consulter vos entretiens annuels',
    icon: MessageSquare,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    count: 1,
  },
];

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  icon: typeof FileText;
  color: string;
}

const RECENT_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'Bulletin de paie', description: 'Bulletin de paie janvier 2026 disponible', date: '2026-02-05', icon: FileText, color: 'text-primary' },
  { id: '2', type: 'Contrat', description: 'Avenant au contrat de travail signé', date: '2026-02-01', icon: Briefcase, color: 'text-success' },
  { id: '3', type: 'Formation', description: 'Attestation AIPR ajoutée au dossier', date: '2026-01-28', icon: FileText, color: 'text-accent' },
  { id: '4', type: 'Entretien', description: 'Entretien annuel planifié le 15 mars', date: '2026-01-25', icon: MessageSquare, color: 'text-purple-600' },
];

export default function RHPage() {
  const t = useTranslations('rh');
  const [leaveFilter, setLeaveFilter] = useState<'all' | LeaveStatus>('all');

  const filteredRequests = DEMO_LEAVE_REQUESTS.filter(
    (req) => leaveFilter === 'all' || req.status === leaveFilter
  );

  const kpis = [
    {
      label: 'Effectifs total',
      value: '47',
      sublabel: 'collaborateurs actifs',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary-50',
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Entrées du mois',
      value: '2',
      sublabel: 'nouveaux collaborateurs',
      icon: UserPlus,
      color: 'text-success',
      bg: 'bg-emerald-50',
      trend: '+2',
      trendUp: true,
    },
    {
      label: 'Sorties du mois',
      value: '1',
      sublabel: 'départ ce mois',
      icon: UserMinus,
      color: 'text-danger',
      bg: 'bg-red-50',
      trend: '-1',
      trendUp: false,
    },
    {
      label: 'Taux d\'absentéisme',
      value: '3.2%',
      sublabel: 'moyenne mensuelle',
      icon: TrendingDown,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: '-0.5%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">Ressources Humaines</h1>
        <p className="text-sm text-text-secondary mt-1">
          Tableau de bord RH et gestion administrative
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{kpi.label}</p>
                  <p className={cn('text-3xl font-bold mt-2', kpi.color)}>{kpi.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{kpi.sublabel}</p>
                </div>
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', kpi.bg)}>
                  <Icon size={22} className={kpi.color} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border-light">
                {kpi.trendUp ? (
                  <ArrowUpRight size={14} className="text-success" />
                ) : (
                  <ArrowDownRight size={14} className="text-danger" />
                )}
                <span className={cn('text-xs font-semibold', kpi.trendUp ? 'text-success' : 'text-danger')}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-text-muted ml-1">vs mois précédent</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <h2 className="text-base font-bold text-text-primary mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.label}
                className="card p-5 group cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', link.bg)}>
                    <Icon size={20} className={link.color} />
                  </div>
                  {link.count && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white text-xs font-bold">
                      {link.count}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <p className="text-xs text-text-secondary mt-1">{link.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Accéder
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Requests */}
        <div className="lg:col-span-2 card p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              Demandes de congés récentes
            </h2>
            <div className="flex items-center gap-1">
              {(['all', 'en_attente', 'approuve', 'refuse'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLeaveFilter(filter)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    leaveFilter === filter
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-50'
                  )}
                >
                  {filter === 'all' ? 'Toutes' : LEAVE_STATUS_CONFIG[filter].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredRequests.map((request) => {
              const statusConfig = LEAVE_STATUS_CONFIG[request.status];
              const StatusIcon = statusConfig.icon;
              const gradient = getAvatarGradient(request.employee.first_name + request.employee.last_name);
              const initials = getInitials(request.employee.first_name, request.employee.last_name);

              return (
                <div
                  key={request.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white text-xs font-bold shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {request.employee.first_name} {request.employee.last_name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {request.type}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      Du {new Date(request.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {new Date(request.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} ({request.days} jour{request.days > 1 ? 's' : ''})
                    </div>
                  </div>
                  <span className={cn('badge flex items-center gap-1', statusConfig.color)}>
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">Aucune demande de congé trouvée</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-accent" />
            Activité récente
          </h2>

          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 shrink-0">
                    <Icon size={16} className={activity.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{activity.description}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(activity.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-semibold text-primary hover:bg-primary-50 rounded-button transition-colors flex items-center justify-center gap-1">
            Voir tout l&apos;historique
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
