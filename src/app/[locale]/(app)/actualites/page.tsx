'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Plus, Clock, Newspaper } from 'lucide-react';
import { cn, getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { createArticle } from '@/lib/actions';

const CATEGORIES = [
  { name: 'Toutes', type: 'all', color: '#0052CC' },
  { name: 'QSE', type: 'qse', color: '#D14900' },
  { name: 'REX', type: 'rex', color: '#00875A' },
  { name: 'Info', type: 'info', color: '#0052CC' },
  { name: 'S\u00e9curit\u00e9', type: 'securite', color: '#FF5630' },
  { name: 'Blog', type: 'blog', color: '#6B21A8' },
];

const COVER_GRADIENTS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-indigo-600 via-purple-500 to-pink-400',
  'from-emerald-600 via-emerald-500 to-teal-400',
  'from-orange-600 via-orange-500 to-amber-400',
  'from-rose-600 via-pink-500 to-fuchsia-400',
  'from-violet-600 via-purple-500 to-indigo-400',
];

function getCoverGradient(index: number, categoryType?: string): string {
  const catMap: Record<string, string> = {
    qse: 'from-orange-600 via-orange-500 to-amber-400',
    rex: 'from-emerald-600 via-emerald-500 to-teal-400',
    info: 'from-blue-600 via-blue-500 to-cyan-400',
    securite: 'from-red-600 via-rose-500 to-pink-400',
    blog: 'from-purple-600 via-violet-500 to-indigo-400',
  };
  if (categoryType && catMap[categoryType]) return catMap[categoryType];
  return COVER_GRADIENTS[index % COVER_GRADIENTS.length];
}

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

  useRealtimeSubscription('articles', refetch);

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
      toast('Article cr\u00e9\u00e9 avec succ\u00e8s', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de la cr\u00e9ation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Page Header with gradient banner */}
      <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-[#0A1F44] via-primary to-[#1A6FFF] p-6 md:p-8 text-white shadow-banner">
        <div className="banner-grid absolute inset-0" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 animate-float" />
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-white/60 mt-1">
              {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-fit rounded-xl px-5 py-2.5 font-semibold text-sm text-white backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Plus size={16} />
            {t('newArticle')}
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un article..."
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
                  ? 'text-white shadow-md'
                  : 'bg-white text-text-secondary border border-border-light hover:border-primary/30 hover:shadow-sm'
              )}
              style={selectedCategory === cat.type ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid with photo cards */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
          {filteredArticles.map((article: Record<string, any>, index: number) => {
            const author = article.author as { first_name: string; last_name: string; avatar_url?: string } | null;
            const category = article.category as { name: string; type: string; color: string } | null;
            const firstName = author?.first_name || '';
            const lastName = author?.last_name || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = getInitials(firstName, lastName);
            const coverGradient = getCoverGradient(index, category?.type);

            return (
              <Link key={article.id as string} href={`/actualites/${article.id}`}>
                <article className="card-elevated group overflow-hidden hover:-translate-y-1 cursor-pointer">
                  {/* Photo/gradient cover */}
                  <div className={`relative h-40 bg-gradient-to-br ${coverGradient} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
                      <div className="absolute left-1/4 bottom-0 h-20 w-20 rounded-full bg-white/10" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Category badge on image */}
                    {category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold text-white backdrop-blur-md border border-white/20" style={{ background: 'rgba(255,255,255,0.15)' }}>
                          {category.name}
                        </span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <Newspaper size={28} className="text-white" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {article.title as string}
                    </h2>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {article.excerpt as string}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light/50">
                      <div className="flex items-center gap-2">
                        {author?.avatar_url ? (
                          <img
                            src={author.avatar_url}
                            alt={`${firstName} ${lastName}`}
                            className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white ring-2 ring-white shadow-sm`}>
                            {initials}
                          </div>
                        )}
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
        <EmptyState message={t('noArticles')} description="Cr\u00e9ez votre premier article en cliquant sur le bouton ci-dessus." />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvel article" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre de l'article" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">R&eacute;sum&eacute;</label>
            <input name="excerpt" className="input w-full" placeholder="R\u00e9sum\u00e9 court" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contenu *</label>
            <textarea name="content" required rows={6} className="input w-full" placeholder="Contenu de l'article..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Cat&eacute;gorie</label>
              <select name="category_id" className="input w-full">
                <option value="">-- S&eacute;lectionner --</option>
                {(categories || []).map((cat: Record<string, any>) => (
                  <option key={cat.id as string} value={cat.id as string}>{cat.name as string}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Statut</label>
              <select name="status" className="input w-full">
                <option value="draft">Brouillon</option>
                <option value="published">Publi&eacute;</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Cr\u00e9er l\'article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
