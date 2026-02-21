'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Monitor,
  MapPin,
  Shuffle,
  Award,
  Filter,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';
import { createFormation, enrollInFormation } from '@/lib/actions';

type FormationType = 'presentiel' | 'elearning' | 'mixte';
type FormationStatus = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

const TYPE_CONFIG: Record<FormationType, { label: string; icon: typeof Monitor; color: string; bg: string }> = {
  presentiel: { label: 'Présentiel', icon: MapPin, color: '#0052CC', bg: 'bg-blue-50 text-blue-700' },
  elearning: { label: 'E-learning', icon: Monitor, color: '#36B37E', bg: 'bg-emerald-50 text-emerald-700' },
  mixte: { label: 'Mixte', icon: Shuffle, color: '#1E3A5F', bg: 'bg-slate-50 text-slate-700' },
};

const STATUS_CONFIG: Record<FormationStatus, { label: string; color: string }> = {
  planifiee: { label: 'Planifiée', color: 'bg-blue-50 text-blue-700' },
  en_cours: { label: 'En cours', color: 'bg-primary-50 text-primary' },
  terminee: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-700' },
  annulee: { label: 'Annulée', color: 'bg-gray-100 text-gray-500' },
};

const CATEGORIES = ['Toutes', 'Sécurité', 'Habilitations', 'CACES', 'Management', 'Technique', 'Qualité'];

type Tab = 'catalogue' | 'en_cours' | 'planifiee' | 'terminee';

export default function FormationsPage() {
  const t = useTranslations('formations');
  const [activeTab, setActiveTab] = useState<Tab>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: formations, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('formations')
        .select('*')
        .order('start_date', { ascending: false }),
  );

  useRealtimeSubscription('formations', refetch);

  const allFormations = (formations || []) as Record<string, any>[];

  const filteredFormations = allFormations.filter((f) => {
    const title = (f.title as string) || '';
    const description = (f.description as string) || '';
    const instructor = (f.instructor as string) || '';
    const category = (f.category as string) || '';
    const status = (f.status as string) || '';

    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Toutes' || category === selectedCategory;

    let matchesTab = true;
    if (activeTab !== 'catalogue') {
      matchesTab = status === activeTab;
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  const totalHours = allFormations
    .filter((f) => ['en_cours', 'terminee'].includes(f.status as string))
    .reduce((sum, f) => sum + ((f.duration_hours as number) || 0), 0);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'catalogue', label: 'Catalogue', count: allFormations.length },
    { key: 'en_cours', label: 'En cours', count: allFormations.filter((f) => f.status === 'en_cours').length },
    { key: 'planifiee', label: 'Planifiées', count: allFormations.filter((f) => f.status === 'planifiee').length },
    { key: 'terminee', label: 'Terminées', count: allFormations.filter((f) => f.status === 'terminee').length },
  ];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createFormation({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string || undefined,
        type: formData.get('type') as string || undefined,
        duration_hours: Number(formData.get('duration_hours')) || undefined,
        max_participants: Number(formData.get('max_participants')) || undefined,
        start_date: formData.get('start_date') as string || undefined,
        end_date: formData.get('end_date') as string || undefined,
        location: formData.get('location') as string || undefined,
        instructor: formData.get('instructor') as string || undefined,
      });
      toast('Formation créée avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async (formationId: string) => {
    setEnrolling(formationId);
    try {
      await enrollInFormation(formationId);
      toast('Inscription confirmée', 'success');
      refetch();
    } catch {
      toast('Erreur lors de l\'inscription', 'error');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <PageSkeleton variant="cards" />;

  return (
    <div className="space-y-6">
      <PageBanner
        icon={BookOpen}
        title="Formations"
        subtitle={`Catalogue de formations et suivi de vos parcours — ${totalHours}h de formation`}
      >
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-fit rounded-xl px-5 py-2.5 font-semibold text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Plus size={16} />
          Nouvelle formation
        </button>
      </PageBanner>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: 'Total formations', value: allFormations.length, color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'En cours', value: allFormations.filter((f) => f.status === 'en_cours').length, color: 'text-accent', bg: 'bg-accent-50' },
          { label: 'Planifiées', value: allFormations.filter((f) => f.status === 'planifiee').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Terminées', value: allFormations.filter((f) => f.status === 'terminee').length, color: 'text-success', bg: 'bg-emerald-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className="text-xs text-text-muted font-medium">{kpi.label}</div>
            <div className={cn('text-2xl font-bold mt-1', kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-light animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              activeTab === tab.key ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-text-muted'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formations Grid */}
      {filteredFormations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger">
          {filteredFormations.map((formation) => {
            const type = (formation.type as FormationType) || 'presentiel';
            const status = (formation.status as FormationStatus) || 'planifiee';
            const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.presentiel;
            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.planifiee;
            const TypeIcon = typeConfig.icon;

            return (
              <Link key={formation.id as string} href={`/formations/${formation.id}`}>
                <div className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
                  <div className="h-1.5" style={{ backgroundColor: typeConfig.color }} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn('badge', typeConfig.bg)}>
                        <TypeIcon size={12} className="mr-1" />
                        {typeConfig.label}
                      </span>
                      <span className={cn('badge', statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {formation.title as string}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {formation.description as string}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-text-muted" />
                        <span>{formation.duration_hours as number}h</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-text-muted" />
                        <span>{formation.max_participants as number || '?'} places</span>
                      </div>
                      {formation.category && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={12} className="text-text-muted" />
                          <span>{formation.category as string}</span>
                        </div>
                      )}
                      {formation.instructor && (
                        <div className="flex items-center gap-1.5">
                          <Award size={12} className="text-text-muted" />
                          <span className="truncate">{formation.instructor as string}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <div className="text-xs text-text-muted">
                        {formation.start_date
                          ? new Date(formation.start_date as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Date à définir'}
                      </div>
                      {status === 'planifiee' && (
                        <button
                          onClick={(e) => { e.preventDefault(); handleEnroll(formation.id as string); }}
                          disabled={enrolling === formation.id}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          {enrolling === formation.id ? 'Inscription...' : "S'inscrire"}
                          <ChevronRight size={14} />
                        </button>
                      )}
                      {status === 'terminee' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success">
                          <Award size={14} />
                          Terminée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Aucune formation trouvée" description="Créez une formation en cliquant sur le bouton ci-dessus." />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvelle formation" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre de la formation" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
              <select name="type" className="input w-full">
                <option value="presentiel">Présentiel</option>
                <option value="elearning">E-learning</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Catégorie</label>
              <select name="category" className="input w-full">
                {CATEGORIES.filter((c) => c !== 'Toutes').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Durée (heures)</label>
              <input name="duration_hours" type="number" className="input w-full" placeholder="14" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Places max</label>
              <input name="max_participants" type="number" className="input w-full" placeholder="12" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de début</label>
              <input name="start_date" type="date" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date de fin</label>
              <input name="end_date" type="date" className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Lieu</label>
              <input name="location" className="input w-full" placeholder="Lieu de la formation" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Formateur</label>
              <input name="instructor" className="input w-full" placeholder="Nom du formateur" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
