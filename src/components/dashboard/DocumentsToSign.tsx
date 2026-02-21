'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  en_attente: { label: 'En attente', icon: Clock, className: 'text-amber-600 bg-amber-50 border-amber-200' },
  signe: { label: 'Signé', icon: CheckCircle, className: 'text-success bg-emerald-50 border-emerald-200' },
  refuse: { label: 'Refusé', icon: AlertCircle, className: 'text-danger bg-red-50 border-red-200' },
};

export function DocumentsToSign() {
  const t = useTranslations('dashboard');

  const { data: requests } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('signature_requests')
        .select('id, title, status, due_date, requester:profiles!signature_requests_requested_by_fkey(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(3),
  );

  const docs = (requests || []) as Record<string, any>[];

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('documentsToSign')}</h2>
        <Link href="/signatures" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map((doc) => {
            const status = statusConfig[(doc.status as string)] || statusConfig.en_attente;
            const StatusIcon = status.icon;
            const requester = doc.requester as { first_name: string; last_name: string } | null;

            return (
              <div key={doc.id as string} className="flex items-center gap-3 rounded-xl border border-border-light p-3 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{doc.title as string}</p>
                  {requester && <p className="text-xs text-text-muted">Demandé par {requester.first_name} {requester.last_name}</p>}
                </div>
                <div className={cn('badge border', status.className)}>
                  <StatusIcon size={12} className="mr-1" />
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucun document en attente</p>
      )}
    </div>
  );
}
