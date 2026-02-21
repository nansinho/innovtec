'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  MapPin,
  Calendar,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  FileWarning,
} from 'lucide-react';
import { cn, getStatusColor, getSeverityColor, getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { createSafetyReport } from '@/lib/actions';

// --- Helpers ---
function getSeverityLabel(severity: string) {
  const map: Record<string, string> = {
    faible: 'Faible',
    moyen: 'Moyen',
    eleve: 'Elevé',
    critique: 'Critique',
  };
  return map[severity] || severity;
}

function getSeverityIcon(severity: string) {
  const map: Record<string, typeof AlertCircle> = {
    faible: AlertCircle,
    moyen: AlertTriangle,
    eleve: TriangleAlert,
    critique: FileWarning,
  };
  return map[severity] || AlertCircle;
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    en_cours: 'En cours',
    cloture: 'Cloturé',
    en_retard: 'En retard',
    annule: 'Annulé',
  };
  return map[status] || status;
}

function getStatusIcon(status: string) {
  const map: Record<string, typeof Clock> = {
    en_cours: Clock,
    cloture: CheckCircle2,
    en_retard: AlertTriangle,
    annule: AlertCircle,
  };
  return map[status] || Clock;
}

// --- Component ---
export default function SituationsDangereusesPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: reports, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('safety_reports')
        .select('*, reporter:profiles!safety_reports_reporter_id_fkey(*), assignee:profiles!safety_reports_assigned_to_fkey(*)')
        .order('created_at', { ascending: false }),
  );

  const allReports = (reports || []) as Record<string, any>[];

  const filteredSituations = allReports.filter((sd) => {
    const severity = (sd.severity as string) || '';
    const status = (sd.status as string) || '';
    const title = (sd.title as string) || '';
    const description = (sd.description as string) || '';
    const location = (sd.location as string) || '';
    const matchesSeverity = severityFilter === 'all' || severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const stats = {
    total: allReports.length,
    en_cours: allReports.filter((s) => s.status === 'en_cours').length,
    en_retard: allReports.filter((s) => s.status === 'en_retard').length,
    critique: allReports.filter((s) => s.severity === 'critique').length,
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createSafetyReport({
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        location: formData.get('location') as string || undefined,
        severity: formData.get('severity') as string || undefined,
      });
      toast('Déclaration créée avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la création', 'error');
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
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-danger/10">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Situations Dangereuses
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Déclaration et suivi des situations dangereuses sur les chantiers
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 w-fit bg-danger hover:bg-danger-dark"
        >
          <Plus size={16} />
          Nouvelle déclaration
        </button>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {[
          { label: 'Total déclarations', value: stats.total, color: 'text-text-primary', bg: 'bg-gray-50', borderColor: 'border-l-gray-400' },
          { label: 'En cours', value: stats.en_cours, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-l-blue-500' },
          { label: 'En retard', value: stats.en_retard, color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-l-red-500' },
          { label: 'Critiques', value: stats.critique, color: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-l-red-700' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn('card p-4 border-l-4 hover:shadow-card-hover transition-shadow', stat.borderColor)}
          >
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col gap-4 animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-1">
              <Filter size={12} className="inline mr-1" />
              Gravité :
            </span>
            {[
              { label: 'Toutes', value: 'all' },
              { label: 'Faible', value: 'faible' },
              { label: 'Moyen', value: 'moyen' },
              { label: 'Elevé', value: 'eleve' },
              { label: 'Critique', value: 'critique' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverityFilter(s.value)}
                className={cn(
                  'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
                  severityFilter === s.value
                    ? s.value === 'all'
                      ? 'bg-primary text-white'
                      : cn(getSeverityColor(s.value), 'border')
                    : 'bg-white text-text-secondary border border-border hover:border-primary/30'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-1">
              Statut :
            </span>
            {[
              { label: 'Tous', value: 'all' },
              { label: 'En cours', value: 'en_cours' },
              { label: 'Cloturé', value: 'cloture' },
              { label: 'En retard', value: 'en_retard' },
              { label: 'Annulé', value: 'annule' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
                  statusFilter === s.value
                    ? s.value === 'all'
                      ? 'bg-primary text-white'
                      : cn(getStatusColor(s.value === 'cloture' ? 'cloture' : s.value))
                    : 'bg-white text-text-secondary border border-border hover:border-primary/30'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary">
        {filteredSituations.length} déclaration{filteredSituations.length > 1 ? 's' : ''}
      </p>

      {/* Situations list */}
      {allReports.length > 0 ? (
        <div className="space-y-3 animate-stagger">
          {filteredSituations.map((sd) => {
            const severity = (sd.severity as string) || 'faible';
            const status = (sd.status as string) || 'en_cours';
            const title = (sd.title as string) || '';
            const description = (sd.description as string) || '';
            const location = (sd.location as string) || '';
            const createdAt = (sd.created_at as string) || '';
            const reporter = sd.reporter as { first_name: string; last_name: string } | null;
            const firstName = reporter?.first_name || '';
            const lastName = reporter?.last_name || '';
            const SeverityIcon = getSeverityIcon(severity);
            const StatusIcon = getStatusIcon(status);
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';

            return (
              <Link key={sd.id as string} href={`/qse/situations-dangereuses/${sd.id}`}>
                <div className="card group p-0 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer mb-3">
                  <div className="flex items-stretch">
                    {/* Severity color bar */}
                    <div
                      className={cn(
                        'w-1.5 shrink-0',
                        severity === 'critique' && 'bg-red-600',
                        severity === 'eleve' && 'bg-orange-500',
                        severity === 'moyen' && 'bg-amber-500',
                        severity === 'faible' && 'bg-blue-500'
                      )}
                    />

                    <div className="flex-1 p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={cn(
                                'badge gap-1 text-[10px] border',
                                getSeverityColor(severity)
                              )}
                            >
                              <SeverityIcon size={10} />
                              {getSeverityLabel(severity)}
                            </span>
                            <span
                              className={cn(
                                'badge gap-1 text-[10px]',
                                getStatusColor(status)
                              )}
                            >
                              <StatusIcon size={10} />
                              {getStatusLabel(status)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                            {title}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {description}
                          </p>

                          {/* Meta */}
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
                            {location && (
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <MapPin size={11} />
                                {location}
                              </span>
                            )}
                            {createdAt && (
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Calendar size={11} />
                                {new Date(createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3 shrink-0 lg:pt-2">
                          <ChevronRight
                            size={16}
                            className="text-text-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredSituations.length === 0 && (
            <div className="text-center py-16">
              <AlertTriangle size={40} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm">
                Aucune situation dangereuse trouvée pour ces critères
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          message="Aucune situation dangereuse"
          description="Créez votre première déclaration en cliquant sur le bouton ci-dessus."
        />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvelle déclaration" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre de la situation dangereuse" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Décrivez la situation dangereuse en détail..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Lieu</label>
              <input name="location" className="input w-full" placeholder="Lieu de la situation" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Gravité</label>
              <select name="severity" className="input w-full">
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="eleve">Elevé</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary bg-danger hover:bg-danger-dark">
              {saving ? 'Enregistrement...' : 'Créer la déclaration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
