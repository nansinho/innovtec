'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  ThumbsUp,
  Eye,
  Calendar,
  Filter,
  Image as ImageIcon,
  Bookmark,
  Tag,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';

// --- Category filter config ---
const CATEGORIES = [
  { name: 'Toutes', value: 'all', color: '#0052CC' },
  { name: 'QSE', value: 'qse', color: '#D14900' },
  { name: 'REX', value: 'rex', color: '#00875A' },
  { name: 'Info', value: 'info', color: '#0052CC' },
  { name: 'Securite', value: 'securite', color: '#FF5630' },
  { name: 'Blog', value: 'blog', color: '#6B21A8' },
];

// --- Component ---
export default function BonnesPratiquesPage() {
  const t = useTranslations('qse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: articles, loading } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('articles')
        .select('*, category:article_categories(*), author:profiles!articles_author_id_fkey(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
  );

  const allArticles = (articles || []) as Record<string, any>[];

  const filteredArticles = allArticles.filter((article) => {
    const category = article.category as { type?: string } | null;
    const matchesCategory =
      selectedCategory === 'all' || category?.type === selectedCategory;
    const title = (article.title as string) || '';
    const excerpt = (article.excerpt as string) || '';
    const content = (article.content as string) || '';
    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-accent/10">
              <BookOpen size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Bonnes Pratiques
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Partagez et consultez les bonnes pratiques terrain
              </p>
            </div>
          </div>
        </div>
        <button className="btn-accent flex items-center gap-2 w-fit">
          <Plus size={16} />
          Partager une pratique
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
            placeholder="Rechercher par titre, description ou tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Category filter */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <Filter size={14} className="text-text-muted mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
              selectedCategory === cat.value
                ? 'text-white shadow-sm'
                : 'bg-white text-text-secondary border border-border hover:border-primary/30'
            )}
            style={
              selectedCategory === cat.value
                ? { backgroundColor: cat.color }
                : {}
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary">
        {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouve{filteredArticles.length > 1 ? 's' : ''}
      </p>

      {/* Articles grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
          {filteredArticles.map((article) => {
            const author = article.author as { first_name: string; last_name: string } | null;
            const category = article.category as { name: string; type: string; color: string } | null;
            const firstName = author?.first_name || '';
            const lastName = author?.last_name || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = getInitials(firstName, lastName);
            const hasImage = !!(article.cover_image_url as string);
            const catColor = category?.color || '#0052CC';
            const catName = category?.name || 'Info';

            return (
              <Link key={article.id as string} href={`/actualites/${article.id}`}>
                <article className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  {/* Image placeholder */}
                  {hasImage ? (
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                      <div className="absolute top-3 right-3">
                        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-text-secondary hover:text-primary transition-colors shadow-sm">
                          <Bookmark size={13} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span
                          className="badge text-white text-[10px] shadow-sm"
                          style={{ backgroundColor: catColor }}
                        >
                          {catName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-2"
                      style={{ backgroundColor: catColor }}
                    />
                  )}

                  <div className="p-5">
                    {!hasImage && (
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="badge text-white text-[10px]"
                          style={{ backgroundColor: catColor }}
                        >
                          {catName}
                        </span>
                      </div>
                    )}

                    <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {article.title as string}
                    </h2>

                    <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                      {(article.excerpt as string) || ''}
                    </p>

                    {/* Tags */}
                    {article.tags && Array.isArray(article.tags) && (article.tags as string[]).length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-4">
                        {(article.tags as string[]).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-text-secondary text-[10px] rounded-full font-medium"
                          >
                            <Tag size={8} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}
                        >
                          {initials}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-text-secondary">
                            {firstName} {lastName}
                          </span>
                          <span className="text-[10px] text-text-muted ml-2 hidden sm:inline">
                            <Calendar size={9} className="inline mr-0.5" />
                            {article.published_at
                              ? new Date(article.published_at as string).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {(article.views_count as number) || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} />
                          {(article.likes_count as number) || 0}
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
        <EmptyState
          message="Aucune bonne pratique trouvee pour ces criteres"
          description="Essayez de modifier vos filtres ou partagez une nouvelle bonne pratique."
        />
      )}
    </div>
  );
}
