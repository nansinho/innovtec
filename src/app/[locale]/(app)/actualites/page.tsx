'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Plus, Clock, MessageCircle } from 'lucide-react';
import { cn, getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { createArticle } from '@/lib/actions';

const CATEGORIES = [
  { name: 'Toutes', type: 'all', color: '#0052CC' },
  { name: 'QSE', type: 'qse', color: '#D14900' },
  { name: 'REX', type: 'rex', color: '#00875A' },
  { name: 'Info', type: 'info', color: '#0052CC' },
  { name: 'Sécurité', type: 'securite', color: '#FF5630' },
  { name: 'Blog', type: 'blog', color: '#6B21A8' },
];

export default function ActualitesPage() {
  const t = useTranslations('news');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: articles, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('articles')
        .select('*, category:article_categories(*), author:profiles!articles_author_id_fkey(*)')
        .order('published_at', { ascending: false }),
  );

  const { data: categories } = useSupabaseQuery(
    (supabase) =>
      supabase.from('article_categories').select('*').order('name'),
  );

  const filteredArticles = (articles || []).filter((article: Record<string, any>) => {
    const category = article.category as { type?: string } | null;
    const matchesCategory = selectedCategory === 'all' || category?.type === selectedCategory;
    const title = (article.title as string) || '';
    const excerpt = (article.excerpt as string) || '';
    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createArticle({
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        excerpt: formData.get('excerpt') as string,
        category_id: formData.get('category_id') as string || undefined,
        status: formData.get('status') as string || 'draft',
      });
      toast('Article créé avec succès', 'success');
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
          <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          {t('newArticle')}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('categories') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setSelectedCategory(cat.type)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                selectedCategory === cat.type
                  ? 'text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
              style={selectedCategory === cat.type ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
          {filteredArticles.map((article: Record<string, any>) => {
            const author = article.author as { first_name: string; last_name: string } | null;
            const category = article.category as { name: string; type: string; color: string } | null;
            const firstName = author?.first_name || '';
            const lastName = author?.last_name || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = getInitials(firstName, lastName);

            return (
              <Link key={article.id as string} href={`/actualites/${article.id}`}>
                <article className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: category?.color || '#0052CC' }}
                  />
                  <div className="p-5">
                    <span className={`badge ${getCategoryBadgeClass(category?.type || 'info')} mb-3`}>
                      {category?.name || 'Info'}
                    </span>
                    <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {article.title as string}
                    </h2>
                    <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                      {article.excerpt as string}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white`}>
                          {initials}
                        </div>
                        <span className="text-xs font-medium text-text-secondary">
                          {firstName} {lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {article.published_at ? formatRelativeDate(article.published_at as string) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState message={t('noArticles')} description="Créez votre premier article en cliquant sur le bouton ci-dessus." />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvel article" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre de l'article" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Résumé</label>
            <input name="excerpt" className="input w-full" placeholder="Résumé court" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contenu *</label>
            <textarea name="content" required rows={6} className="input w-full" placeholder="Contenu de l'article..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Catégorie</label>
              <select name="category_id" className="input w-full">
                <option value="">-- Sélectionner --</option>
                {(categories || []).map((cat: Record<string, any>) => (
                  <option key={cat.id as string} value={cat.id as string}>{cat.name as string}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Statut</label>
              <select name="status" className="input w-full">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
