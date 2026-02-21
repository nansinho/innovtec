'use client';

import { useState } from 'react';
import {
  Users,
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
  Plus,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { createLeaveRequest, updateLeaveRequestStatus } from '@/lib/actions';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';
import { useToast } from '@/components/ui/Toast';

type LeaveStatus = 'approuve' | 'en_attente' | 'refuse';

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

const LEAVE_TYPE_LABELS: Record<string, string> = {
  conge_paye: 'Congés payés',
  rtt: 'RTT',
  maladie: 'Congé maladie',
  sans_solde: 'Sans solde',
  autre: 'Autre',
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: 'Demandes de congés',
    description: 'Gérer les demandes de congés et absences',
    icon: CalendarDays,
    color: 'text-primary',
    bg: 'bg-primary-50',
  },
  {
    label: 'Notes de frais',
    description: 'Soumettre et suivre vos notes de frais',
    icon: Receipt,
    color: 'text-accent',
    bg: 'bg-accent-50',
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
    color: 'text-slate-600',
    bg: 'bg-slate-50',
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
  { id: '4', type: 'Entretien', description: 'Entretien annuel planifié le 15 mars', date: '2026-01-25', icon: MessageSquare, color: 'text-slate-600' },
];

function getDayCount(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
}

export default function RHPage() {
  const [leaveFilter, setLeaveFilter] = useState<'all' | LeaveStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch leave requests with user/approver profiles
  const { data: leaveRequests, loading: loadingLeaves, refetch: refetchLeaves } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('leave_requests')
        .select('*, user:profiles!leave_requests_user_id_fkey(*), approver:profiles!leave_requests_approved_by_fkey(*)')
        .order('created_at', { ascending: false }),
  );

  // Fetch expense reports for KPI
  const { data: expenseReports, loading: loadingExpenses } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('expense_reports')
        .select('*')
        .order('submitted_at', { ascending: false }),
  );

  // Fetch active profiles count for KPI
  const { data: activeProfiles, loading: loadingProfiles } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true),
  );

  const allLeaveRequests = (leaveRequests || []) as Record<string, any>[];
  const allExpenseReports = (expenseReports || []) as Record<string, any>[];
  const allActiveProfiles = (activeProfiles || []) as Record<string, any>[];

  const filteredRequests = allLeaveRequests.filter(
    (req) => leaveFilter === 'all' || (req.status as string) === leaveFilter,
  );

  // Compute KPIs from real data
  const totalEffectifs = allActiveProfiles.length;
  const pendingLeaves = allLeaveRequests.filter((r) => (r.status as string) === 'en_attente').length;
  const pendingExpenses = allExpenseReports.filter((r) => (r.status as string) === 'en_attente').length;
  const approvedLeavesThisMonth = allLeaveRequests.filter((r) => {
    if ((r.status as string) !== 'approuve') return false;
    const createdAt = r.created_at as string;
    if (!createdAt) return false;
    const d = new Date(createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Dynamic quick link counts from real data
  const quickLinksWithCounts = QUICK_LINKS.map((link) => {
    if (link.label === 'Demandes de congés') {
      return { ...link, count: pendingLeaves || undefined };
    }
    if (link.label === 'Notes de frais') {
      return { ...link, count: pendingExpenses || undefined };
    }
    return link;
  });

  const kpis = [
    {
      label: 'Effectifs total',
      value: String(totalEffectifs),
      sublabel: 'collaborateurs actifs',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary-50',
      trend: `${totalEffectifs}`,
      trendUp: true,
    },
    {
      label: 'Congés en attente',
      value: String(pendingLeaves),
      sublabel: 'demandes à traiter',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: `${pendingLeaves}`,
      trendUp: false,
    },
    {
      label: 'Congés approuvés',
      value: String(approvedLeavesThisMonth),
      sublabel: 'ce mois-ci',
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-emerald-50',
      trend: `+${approvedLeavesThisMonth}`,
      trendUp: true,
    },
    {
      label: 'Notes de frais',
      value: String(allExpenseReports.length),
      sublabel: `dont ${pendingExpenses} en attente`,
      icon: Receipt,
      color: 'text-accent',
      bg: 'bg-accent-50',
      trend: `${pendingExpenses} en attente`,
      trendUp: false,
    },
  ];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createLeaveRequest({
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        reason: (formData.get('reason') as string) || undefined,
      });
      toast('Demande de congé créée avec succès', 'success');
      setShowCreateModal(false);
      refetchLeaves();
    } catch {
      toast('Erreur lors de la création de la demande', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await updateLeaveRequestStatus(id, 'approuve');
      toast('Demande approuvée', 'success');
      refetchLeaves();
    } catch {
      toast("Erreur lors de l'approbation", 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await updateLeaveRequestStatus(id, 'refuse');
      toast('Demande refusée', 'success');
      refetchLeaves();
    } catch {
      toast('Erreur lors du refus', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const isLoading = loadingLeaves || loadingExpenses || loadingProfiles;

  if (isLoading) return <PageSkeleton variant="cards" />;

  return (
    <div className="space-y-6">
      <PageBanner
        icon={Users}
        title="Ressources Humaines"
        subtitle="Tableau de bord RH et gestion administrative"
      >
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-fit rounded-xl px-5 py-2.5 font-semibold text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Plus size={16} />
          Nouvelle demande de congé
        </button>
      </PageBanner>

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
                <span className="text-xs text-text-muted ml-1">ce mois</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <h2 className="text-base font-bold text-text-primary mb-4">Acc&egrave;s rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinksWithCounts.map((link) => {
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
                  Acc&eacute;der
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
              Demandes de cong&eacute;s r&eacute;centes
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

          {allLeaveRequests.length > 0 ? (
            <div className="space-y-2">
              {filteredRequests.map((request) => {
                const status = (request.status as LeaveStatus) || 'en_attente';
                const statusConfig = LEAVE_STATUS_CONFIG[status];
                const StatusIcon = statusConfig.icon;
                const user = request.user as Record<string, any> | null;
                const firstName = (user?.first_name as string) || '';
                const lastName = (user?.last_name as string) || '';
                const gradient = getAvatarGradient(firstName + lastName);
                const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';
                const leaveType = LEAVE_TYPE_LABELS[(request.type as string) || ''] || (request.type as string) || '';
                const startDate = request.start_date as string;
                const endDate = request.end_date as string;
                const days = startDate && endDate ? getDayCount(startDate, endDate) : 1;
                const requestId = request.id as string;
                const isActionPending = actionLoading === requestId;

                return (
                  <div
                    key={requestId}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white text-xs font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {firstName} {lastName}
                        </span>
                        <span className="text-xs text-text-muted">
                          {leaveType}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Du {startDate ? new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'} au {endDate ? new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} ({days} jour{days > 1 ? 's' : ''})
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {status === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleApprove(requestId)}
                            disabled={isActionPending}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-success transition-colors disabled:opacity-50"
                            title="Approuver"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(requestId)}
                            disabled={isActionPending}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-danger transition-colors disabled:opacity-50"
                            title="Refuser"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <span className={cn('badge flex items-center gap-1', statusConfig.color)}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm">Aucune demande de cong&eacute; trouv&eacute;e pour ce filtre</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              message="Aucune demande de congé"
              description="Les demandes de congés apparaîtront ici une fois soumises."
            />
          )}
        </div>

        {/* Recent Activities */}
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-accent" />
            Activit&eacute; r&eacute;cente
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

      {/* Create Leave Request Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvelle demande de congé" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type de cong&eacute; *</label>
            <select name="type" required className="input w-full">
              <option value="">-- S&eacute;lectionner --</option>
              <option value="conge_paye">Cong&eacute;s pay&eacute;s</option>
              <option value="rtt">RTT</option>
              <option value="maladie">Cong&eacute; maladie</option>
              <option value="sans_solde">Sans solde</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de d&eacute;but *</label>
              <input name="start_date" type="date" required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de fin *</label>
              <input name="end_date" type="date" required className="input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Motif</label>
            <textarea name="reason" rows={3} className="input w-full" placeholder="Pr&eacute;cisez le motif de votre demande..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
