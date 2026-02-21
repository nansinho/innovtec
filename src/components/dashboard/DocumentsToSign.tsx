'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, FileText, Clock, AlertCircle, CheckCircle, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  en_attente: { label: 'En attente', icon: Clock, className: 'text-amber-600 bg-amber-50 border-amber-200' },
  signe: { label: 'Sign\u00e9', icon: CheckCircle, className: 'text-success bg-emerald-50 border-emerald-200' },
  refuse: { label: 'Refus\u00e9', icon: AlertCircle, className: 'text-danger bg-red-50 border-red-200' },
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
    <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 text-orange-600">
            <PenTool size={18} strokeWidth={1.8} />
          </div>
          <h2 className="section-title">{t('documentsToSign')}</h2>
        </div>
        <Link href="/signatures" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          Voir tout <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map((doc) => {
            const status = statusConfig[(doc.status as string)] || statusConfig.en_attente;
            const StatusIcon = status.icon;
            const requester = doc.requester as { first_name: string; last_name: string } | null;

            return (
              <div key={doc.id as string} className="flex items-center gap-3 rounded-xl border border-border-light/60 p-3.5 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-blue-50 text-primary flex-shrink-0">
                  <FileText size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{doc.title as string}</p>
                  {requester && <p className="text-xs text-text-muted">Demand\u00e9 par {requester.first_name} {requester.last_name}</p>}
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
