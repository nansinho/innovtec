'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';
import { getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const COVER_GRADIENTS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-indigo-600 via-purple-500 to-pink-400',
  'from-emerald-600 via-emerald-500 to-teal-400',
  'from-orange-600 via-orange-500 to-amber-400',
];

export function NewsSection() {
  const t = useTranslations('dashboard');

  const { data: articles } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('articles')
        .select('id, title, excerpt, published_at, category:article_categories(name, type), author:profiles!articles_author_id_fkey(first_name, last_name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4),
  );

  const news = (articles || []) as Record<string, any>[];

  return (
    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '260ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{t('latestNews')}</h2>
        <Link href="/actualites" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          Voir tout <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((article, index) => {
            const category = article.category as { name: string; type: string } | null;
            const author = article.author as { first_name: string; last_name: string } | null;
            const gradientIdx = index % COVER_GRADIENTS.length;

            return (
              <Link key={article.id as string} href={`/actualites/${article.id}`} className="card-elevated group overflow-hidden hover:-translate-y-1">
                {/* Cover image area with gradient placeholder */}
                <div className={`relative h-44 bg-gradient-to-br ${COVER_GRADIENTS[gradientIdx]} overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
                    <div className="absolute left-1/3 bottom-0 h-24 w-24 rounded-full bg-white/10" />
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

                  {/* Icon decoration */}
                  <div className="absolute bottom-3 right-3 opacity-40">
                    <Newspaper size={28} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                    {article.title as string}
                  </h3>
                  <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                    {article.excerpt as string}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                    {author && <span className="font-medium">{author.first_name} {author.last_name}</span>}
                    {article.published_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeDate(article.published_at as string)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-8">Aucune actualit&eacute; publi&eacute;e</p>
      )}
    </div>
  );
}
