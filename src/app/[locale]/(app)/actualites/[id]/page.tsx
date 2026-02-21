'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState } from '@/components/ui/DataStates';
import { getCategoryBadgeClass, formatRelativeDate, getAvatarGradient, getInitials } from '@/lib/utils';

export default function ArticleDetailPage() {
  const params = useParams();
  const t = useTranslations('news');
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: article, loading, error } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('articles')
        .select('*, category:article_categories(*), author:profiles!articles_author_id_fkey(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  if (loading) return <LoadingState />;
  if (error || !article) return <ErrorState message="Article introuvable" />;
  const author = article.author as { first_name: string; last_name: string } | null;
  const category = article.category as { name: string; type: string; color: string } | null;
  const firstName = author?.first_name || '';
  const lastName = author?.last_name || '';
  const gradient = getAvatarGradient(firstName + lastName);
  const initials = getInitials(firstName, lastName);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <Link href="/actualites" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        {t('title')}
      </Link>

      <div>
        {category && (
          <span className={`badge ${getCategoryBadgeClass(category.type)} mb-3`}>
            <Tag size={12} className="mr-1" />
            {category.name}
          </span>
        )}
        <h1 className="text-2xl font-bold text-text-primary mt-2">{article.title}</h1>
        {article.excerpt && (
          <p className="text-base text-text-secondary mt-2">{article.excerpt}</p>
        )}
      </div>

      <div className="flex items-center gap-4 py-4 border-y border-border-light">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{firstName} {lastName}</p>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeDate(article.published_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="prose prose-sm max-w-none text-text-primary whitespace-pre-wrap">
          {article.content || 'Aucun contenu.'}
        </div>
      </div>
    </div>
  );
}
