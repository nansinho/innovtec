'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Lightbulb, Clock, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState } from '@/components/ui/DataStates';
import { getAvatarGradient, getInitials, formatRelativeDate } from '@/lib/utils';

export default function RexDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: report, loading, error } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('rex_reports')
        .select('*, author:profiles!rex_reports_author_id_fkey(*), category:article_categories(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  if (loading) return <LoadingState />;
  if (error || !report) return <ErrorState message="REX introuvable" />;
  const author = report.author as { first_name: string; last_name: string } | null;
  const category = report.category as { name: string } | null;
  const firstName = author?.first_name || '';
  const lastName = author?.last_name || '';
  const gradient = getAvatarGradient(firstName + lastName);
  const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';

  const sections = [
    { label: 'Description', content: report.description },
    { label: 'Causes identifiées', content: report.causes },
    { label: 'Actions menées', content: report.actions_taken },
    { label: 'Leçons apprises', content: report.lessons_learned },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <Link href="/qse/rex" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        Retours d&apos;Expérience
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-success" />
          {category && <span className="badge bg-emerald-50 text-emerald-700">{category.name}</span>}
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{report.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white`}>{initials}</div>
            <span className="text-sm text-text-secondary">{firstName} {lastName}</span>
          </div>
          {report.created_at && (
            <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={12} />{formatRelativeDate(report.created_at)}</span>
          )}
        </div>
      </div>

      {sections.map((section) => section.content && (
        <div key={section.label} className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">{section.label}</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
