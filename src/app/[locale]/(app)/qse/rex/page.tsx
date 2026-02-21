'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Plus, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getAvatarGradient, getInitials, formatRelativeDate } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';
import { createRexReport } from '@/lib/actions';

export default function RexPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: reports, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('rex_reports')
        .select('*, author:profiles!rex_reports_author_id_fkey(*), category:article_categories(*)')
        .order('created_at', { ascending: false }),
  );

  const { data: categories } = useSupabaseQuery(
    (supabase) => supabase.from('article_categories').select('*').order('name'),
  );

  const allReports = (reports || []) as Record<string, any>[];

  const filteredReports = allReports.filter((r) => {
    const title = (r.title as string) || '';
    const description = (r.description as string) || '';
    return searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase()) || description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createRexReport({
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        causes: formData.get('causes') as string || undefined,
        actions_taken: formData.get('actions_taken') as string || undefined,
        lessons_learned: formData.get('lessons_learned') as string || undefined,
        category_id: formData.get('category_id') as string || undefined,
      });
      toast('REX créé avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton variant="cards" overlapping />;

  return (
    <div className="space-y-6">
      <PageBanner
        icon={Lightbulb}
        title="Retours d'Expérience (REX)"
        subtitle="Capitaliser sur les expériences terrain pour progresser ensemble"
        overlapping
      >
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-fit rounded-xl px-5 py-2.5 font-semibold text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <Plus size={16} />
          Nouveau REX
        </button>
      </PageBanner>

      <div className="-mt-20 relative z-10 mb-6 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Rechercher un REX..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <p className="text-sm text-text-secondary">{filteredReports.length} retour{filteredReports.length > 1 ? 's' : ''} d&apos;expérience</p>

      {filteredReports.length > 0 ? (
        <div className="space-y-4 animate-stagger">
          {filteredReports.map((report) => {
            const author = report.author as { first_name: string; last_name: string } | null;
            const category = report.category as { name: string; color: string } | null;
            const firstName = author?.first_name || '';
            const lastName = author?.last_name || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';
            const isExpanded = expandedId === (report.id as string);

            return (
              <div key={report.id as string} className="card overflow-hidden hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-stretch">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: category?.color || '#36B37E' }} />
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {category && (
                        <span className="badge text-white text-[10px]" style={{ backgroundColor: category.color }}>
                          {category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : report.id as string)}>
                      {report.title as string}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">{report.description as string}</p>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                        {report.causes && (
                          <div className="bg-gray-50 rounded-button p-4">
                            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1.5">Causes identifiées</h4>
                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{report.causes as string}</p>
                          </div>
                        )}
                        {report.actions_taken && (
                          <div className="bg-blue-50 rounded-button p-4 border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5">Actions menées</h4>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{report.actions_taken as string}</p>
                          </div>
                        )}
                        {report.lessons_learned && (
                          <div className="bg-emerald-50 rounded-button p-4 border border-emerald-100">
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1.5">Leçons apprises</h4>
                            <p className="text-sm text-emerald-800 whitespace-pre-wrap">{report.lessons_learned as string}</p>
                          </div>
                        )}
                        <Link href={`/qse/rex/${report.id}`} className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                          Voir le détail complet
                        </Link>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
                      <div className="flex items-center gap-1.5">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}>{initials}</div>
                        <span className="text-xs text-text-secondary">{firstName} {lastName}</span>
                        {report.created_at && <span className="text-xs text-text-muted ml-2">{formatRelativeDate(report.created_at as string)}</span>}
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : report.id as string)} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                        {isExpanded ? 'Réduire' : 'Voir le détail'}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Aucun retour d'expérience" description="Partagez votre premier REX en cliquant sur le bouton ci-dessus." />
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouveau REX" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre du retour d'expérience" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Contexte et description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Causes identifiées</label>
            <textarea name="causes" rows={2} className="input w-full" placeholder="Causes identifiées..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Actions menées</label>
            <textarea name="actions_taken" rows={2} className="input w-full" placeholder="Actions correctives menées..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Leçons apprises</label>
            <textarea name="lessons_learned" rows={2} className="input w-full" placeholder="Enseignements tirés..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Catégorie</label>
            <select name="category_id" className="input w-full">
              <option value="">-- Sélectionner --</option>
              {(categories || []).map((cat: Record<string, any>) => (
                <option key={cat.id as string} value={cat.id as string}>{cat.name as string}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : 'Créer le REX'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
