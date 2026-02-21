'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  Edit3,
  Download,
  Eye,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { createQSEPolicy } from '@/lib/actions';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';

// --- Helpers ---
function getStatusConfig(status: string) {
  const map: Record<string, { label: string; icon: typeof Edit3; classes: string }> = {
    draft: {
      label: 'Brouillon',
      icon: Edit3,
      classes: 'text-amber-600 bg-amber-50 border border-amber-200',
    },
    active: {
      label: 'Active',
      icon: CheckCircle2,
      classes: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
    },
    archived: {
      label: 'Archivee',
      icon: Archive,
      classes: 'text-gray-500 bg-gray-50 border border-gray-200',
    },
  };
  return map[status] || map['draft'];
}

// --- Component ---
export default function PolitiquePage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: policies, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('qse_policies')
        .select('*, author:profiles!qse_policies_author_id_fkey(*)')
        .order('updated_at', { ascending: false }),
  );

  const allPolicies = (policies || []) as Record<string, any>[];

  const filteredPolicies = allPolicies.filter((policy) => {
    const title = (policy.title as string) || '';
    const content = (policy.content as string) || '';
    const status = (policy.status as string) || '';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: allPolicies.length,
    active: allPolicies.filter((p) => (p.status as string) === 'active').length,
    draft: allPolicies.filter((p) => (p.status as string) === 'draft').length,
    archived: allPolicies.filter((p) => (p.status as string) === 'archived').length,
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createQSEPolicy({
        title: formData.get('title') as string,
        content: (formData.get('content') as string) || undefined,
        version: (formData.get('version') as string) || undefined,
        status: (formData.get('status') as string) || undefined,
      });
      toast('Politique creee avec succes', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la creation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Politiques QSE
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Gestion des documents de politique qualite, securite et environnement
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          Nouveau document
        </button>
      </div>

      {/* Stats cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {[
          { label: 'Total', value: stats.total, color: 'text-text-primary', bg: 'bg-gray-50' },
          { label: 'Actives', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Brouillons', value: stats.draft, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Archivees', value: stats.archived, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 hover:shadow-card-hover transition-shadow">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Status Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Status filter */}
      <div
        className="flex items-center gap-2 animate-fade-in-up"
        style={{ animationDelay: '180ms' }}
      >
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-2">
          Statut :
        </span>
        {[
          { label: 'Tous', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Brouillon', value: 'draft' },
          { label: 'Archivee', value: 'archived' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
              statusFilter === s.value
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary border border-border hover:border-primary/30'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Policy List */}
      {filteredPolicies.length > 0 ? (
        <div className="space-y-3 animate-stagger">
          {filteredPolicies.map((policy) => {
            const status = (policy.status as string) || 'draft';
            const statusConfig = getStatusConfig(status);
            const StatusIcon = statusConfig.icon;
            const author = policy.author as { first_name: string; last_name: string } | null;
            const firstName = author?.first_name || '';
            const lastName = author?.last_name || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';

            return (
              <div
                key={policy.id as string}
                className="card group p-0 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-stretch">
                  {/* Color indicator */}
                  <div
                    className="w-1.5 shrink-0 bg-primary"
                  />

                  <div className="flex-1 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={cn(
                              'badge gap-1 text-[10px]',
                              statusConfig.classes
                            )}
                          >
                            <StatusIcon size={10} />
                            {statusConfig.label}
                          </span>
                          {policy.version && (
                            <span className="text-[10px] font-mono text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                              v{policy.version as string}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                          {policy.title as string}
                        </h3>
                        {policy.content && (
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {policy.content as string}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                            >
                              {initials}
                            </div>
                            <span className="text-xs text-text-secondary">
                              {firstName} {lastName}
                            </span>
                          </div>
                          {policy.updated_at && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock size={11} />
                              Mis a jour le{' '}
                              {new Date(policy.updated_at as string).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                          {policy.published_at && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <FileText size={11} />
                              Publie le{' '}
                              {new Date(policy.published_at as string).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 lg:pt-2">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                          title="Visualiser"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast('Apercu du document : ' + (policy.title as string), 'info');
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                          title="Telecharger"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast('Telechargement de : ' + (policy.title as string), 'info');
                          }}
                        >
                          <Download size={14} />
                        </button>
                        <ChevronRight
                          size={16}
                          className="text-text-muted ml-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          message="Aucun document trouve"
          description="Aucun document ne correspond a ces criteres. Creez-en un en cliquant sur le bouton ci-dessus."
        />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouveau document de politique" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre du document" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contenu</label>
            <textarea name="content" rows={4} className="input w-full" placeholder="Description ou contenu du document..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Version</label>
              <input name="version" className="input w-full" placeholder="ex: 1.0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Statut</label>
              <select name="status" className="input w-full">
                <option value="draft">Brouillon</option>
                <option value="active">Active</option>
                <option value="archived">Archivee</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : 'Creer le document'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
