'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock, Newspaper, BookOpen } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const COVER_GRADIENTS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-sky-600 via-sky-500 to-blue-400',
  'from-emerald-600 via-emerald-500 to-teal-400',
  'from-amber-600 via-amber-500 to-yellow-400',
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
  const heroArticle = news[0] || null;
  const sideArticles = news.slice(1, 4);

  return (
    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '260ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600">
            <Newspaper size={20} strokeWidth={1.8} />
          </div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">{t('latestNews')}</h2>
        </div>
        <Link href="/actualites" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          {t('viewAll')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Hero article - large card */}
          {heroArticle && (
            <Link href={`/actualites/${heroArticle.id}`} className="md:col-span-2 group">
              <div className="card-elevated overflow-hidden h-full">
                <div className={`relative h-64 bg-gradient-to-br ${COVER_GRADIENTS[0]} overflow-hidden`}>
                  {/* Decorative orbs */}
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
                  <div className="absolute left-1/4 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
                  <div className="absolute right-1/3 top-1/4 h-24 w-24 rounded-full bg-white/5" />

                  {/* Category badge */}
                  {(heroArticle.category as any)?.name && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-white backdrop-blur-md border border-white/20" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        {(heroArticle.category as any).name}
                      </span>
                    </div>
                  )}

                  {/* Bottom gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
                      {heroArticle.title as string}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">
                      {heroArticle.excerpt as string}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
                      {(heroArticle.author as any) && (
                        <span className="font-medium text-white/70">
                          {(heroArticle.author as any).first_name} {(heroArticle.author as any).last_name}
                        </span>
                      )}
                      {heroArticle.published_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatRelativeDate(heroArticle.published_at as string)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Side articles - stacked compact cards */}
          <div className="space-y-4 flex flex-col">
            {sideArticles.map((article, index) => {
              const category = article.category as { name: string; type: string } | null;
              const author = article.author as { first_name: string; last_name: string } | null;
              const gradientIdx = (index + 1) % COVER_GRADIENTS.length;

              return (
                <Link key={article.id as string} href={`/actualites/${article.id}`} className="card-elevated group overflow-hidden flex-1">
                  <div className="flex h-full">
                    {/* Mini gradient cover */}
                    <div className={`relative w-28 flex-shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[gradientIdx]} flex items-center justify-center`}>
                      <BookOpen size={24} className="text-white/40" />
                      <div className="absolute inset-0 bg-black/5" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                      {category && (
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1">{category.name}</span>
                      )}
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {article.title as string}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
                        {author && <span>{author.first_name} {author.last_name}</span>}
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
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
        </div>
      ) : (
        <div className="card-elevated p-12 flex flex-col items-center justify-center">
          <Newspaper size={40} className="text-text-muted/20 mb-3" />
          <p className="text-sm text-text-muted">Aucune actualité publiée</p>
        </div>
      )}
    </div>
  );
}
