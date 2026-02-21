'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock } from 'lucide-react';
import { getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

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
    <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('latestNews')}</h2>
        <Link href="/actualites" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((article) => {
            const category = article.category as { name: string; type: string } | null;
            const author = article.author as { first_name: string; last_name: string } | null;

            return (
              <Link key={article.id as string} href={`/actualites/${article.id}`} className="card group p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {category && (
                      <span className={`badge ${getCategoryBadgeClass(category.type)} mb-2`}>
                        {category.name}
                      </span>
                    )}
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
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-8">Aucune actualité publiée</p>
      )}
    </div>
  );
}
