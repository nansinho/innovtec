'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Filter,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { createActionPlan } from '@/lib/actions';

function getPriorityConfig(priority: string) {
  const map: Record<string, { label: string; color: string; dotColor: string }> = {
    basse: { label: 'Basse', color: 'text-blue-600 bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' },
    normale: { label: 'Normale', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
    haute: { label: 'Haute', color: 'text-orange-600 bg-orange-50 border-orange-200', dotColor: 'bg-orange-500' },
    urgente: { label: 'Urgente', color: 'text-red-600 bg-red-50 border-red-200', dotColor: 'bg-red-500' },
  };
  return map[priority] || map.normale;
}

function getColumnConfig(status: string) {
  const map: Record<string, { title: string; icon: typeof Clock; color: string }> = {
    en_cours: { title: 'En cours', icon: Clock, color: 'text-blue-600' },
    cloture: { title: 'Cloturé', icon: CheckCircle2, color: 'text-emerald-600' },
    en_retard: { title: 'En retard', icon: AlertTriangle, color: 'text-red-600' },
  };
  return map[status] || map.en_cours;
}

function getDaysRemaining(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PlansActionsPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: plans, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('*, responsible:profiles!action_plans_responsible_id_fkey(*), team:teams(*)')
        .order('created_at', { ascending: false }),
  );

  const { data: profiles } = useSupabaseQuery(
    (supabase) => supabase.from('profiles').select('id, first_name, last_name').eq('is_active', true).order('last_name'),
  );

  const { data: teams } = useSupabaseQuery(
    (supabase) => supabase.from('teams').select('id, name').order('name'),
  );

  const allPlans = (plans || []) as Record<string, any>[];

  const filteredActions = allPlans.filter((action) => {
    const priority = (action.priority as string) || '';
    const title = (action.title as string) || '';
    const description = (action.description as string) || '';
    const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createActionPlan({
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        priority: formData.get('priority') as string || undefined,
        due_date: formData.get('due_date') as string || undefined,
        responsible_id: formData.get('responsible_id') as string || undefined,
        team_id: formData.get('team_id') as string || undefined,
      });
      toast("Plan d'action créé avec succès", 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: string[] = ['en_cours', 'cloture', 'en_retard'];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10">
            <Target size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Plans d&apos;Actions</h1>
            <p className="text-sm text-text-secondary mt-0.5">Suivi et gestion des plans d&apos;actions QSE</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Nouveau plan d&apos;action
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-text-muted" />
          {[{ label: 'Toutes', value: 'all' }, { label: 'Basse', value: 'basse' }, { label: 'Normale', value: 'normale' }, { label: 'Haute', value: 'haute' }, { label: 'Urgente', value: 'urgente' }].map((p) => (
            <button
              key={p.value}
              onClick={() => setPriorityFilter(p.value)}
              className={cn(
                'rounded-button px-3 py-1.5 text-xs font-medium transition-all duration-200',
                priorityFilter === p.value
                  ? p.value === 'all' ? 'bg-primary text-white' : cn(getPriorityConfig(p.value).color, 'border')
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {allPlans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          {columns.map((colStatus) => {
            const config = getColumnConfig(colStatus);
            const ColIcon = config.icon;
            const colActions = filteredActions.filter((a) => a.status === colStatus);

            return (
              <div key={colStatus} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: colStatus === 'en_cours' ? '#0052CC' : colStatus === 'cloture' ? '#36B37E' : '#FF5630' }}>
                  <ColIcon size={16} className={config.color} />
                  <h2 className={cn('text-sm font-bold', config.color)}>{config.title}</h2>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-text-secondary">{colActions.length}</span>
                </div>
                <div className="space-y-3">
                  {colActions.map((action) => {
                    const responsible = action.responsible as { first_name: string; last_name: string } | null;
                    const priority = (action.priority as string) || 'normale';
                    const priorityConfig = getPriorityConfig(priority);
                    const firstName = responsible?.first_name || '';
                    const lastName = responsible?.last_name || '';
                    const gradient = getAvatarGradient(firstName + lastName);
                    const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';
                    const dueDate = action.due_date as string;
                    const daysRemaining = dueDate ? getDaysRemaining(dueDate) : null;

                    return (
                      <Link key={action.id as string} href={`/qse/plans-actions/${action.id}`}>
                        <div className="card p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn('badge gap-1 text-[10px] border', priorityConfig.color)}>
                              <Flag size={9} />
                              {priorityConfig.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                            {action.title as string}
                          </h3>
                          <p className="text-xs text-text-secondary line-clamp-2 mb-3">{action.description as string}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-border-light">
                            <div className="flex items-center gap-1.5">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}>
                                {initials}
                              </div>
                              <span className="text-[10px] text-text-secondary">{firstName} {lastName}</span>
                            </div>
                            {daysRemaining !== null && (
                              <span className={cn('flex items-center gap-1 text-[10px] font-medium',
                                action.status === 'cloture' ? 'text-emerald-600'
                                  : daysRemaining < 0 ? 'text-red-600'
                                  : daysRemaining <= 7 ? 'text-amber-600'
                                  : 'text-text-muted'
                              )}>
                                <Calendar size={10} />
                                {action.status === 'cloture' ? 'Terminé' : daysRemaining < 0 ? `${Math.abs(daysRemaining)}j en retard` : daysRemaining === 0 ? "Aujourd'hui" : `${daysRemaining}j restants`}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {colActions.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border-light rounded-card">
                      <p className="text-xs text-text-muted">Aucun plan d&apos;action</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Aucun plan d'action" description="Créez votre premier plan d'action en cliquant sur le bouton ci-dessus." />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouveau plan d'action" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre du plan d'action" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Description détaillée..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Priorité</label>
              <select name="priority" className="input w-full">
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Échéance</label>
              <input name="due_date" type="date" className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Responsable</label>
              <select name="responsible_id" className="input w-full">
                <option value="">-- Sélectionner --</option>
                {(profiles || []).map((p: Record<string, any>) => (
                  <option key={p.id as string} value={p.id as string}>{p.first_name as string} {p.last_name as string}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Équipe</label>
              <select name="team_id" className="input w-full">
                <option value="">-- Sélectionner --</option>
                {(teams || []).map((t: Record<string, any>) => (
                  <option key={t.id as string} value={t.id as string}>{t.name as string}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : "Créer le plan d'action"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
