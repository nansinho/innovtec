'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, FileText, Clock, AlertCircle, CheckCircle, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  en_attente: { label: 'En attente', color: 'text-amber-600', bgColor: 'bg-amber-500', icon: Clock },
  signe: { label: 'Signé', color: 'text-success', bgColor: 'bg-success', icon: CheckCircle },
  refuse: { label: 'Refusé', color: 'text-danger', bgColor: 'bg-danger', icon: AlertCircle },
};

export function DocumentsToSign() {
  const t = useTranslations('dashboard');

  const { data: requests } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('signature_requests')
        .select('id, title, status, due_date, requester:profiles!signature_requests_requested_by_fkey(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
  );

  const docs = (requests || []) as Record<string, any>[];
  const signedCount = docs.filter((d) => d.status === 'signe').length;
  const totalCount = docs.length;

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 text-orange-600">
            <PenTool size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('documentsToSign')}</h2>
            <p className="text-xs text-text-muted">{signedCount}/{totalCount} {t('signed')}</p>
          </div>
        </div>
        <Link href="/signatures" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors group">
          {t('viewAll')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400 transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (signedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {docs.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-border-light/60" />

          <div className="space-y-1">
            {docs.map((doc) => {
              const status = statusConfig[(doc.status as string)] || statusConfig.en_attente;
              const StatusIcon = status.icon;
              const requester = doc.requester as { first_name: string; last_name: string } | null;

              return (
                <div key={doc.id as string} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-background/50 transition-colors cursor-pointer group relative">
                  {/* Timeline dot */}
                  <div className={cn('flex-shrink-0 h-[34px] w-[34px] rounded-full flex items-center justify-center border-2 border-white z-10', status.bgColor)}>
                    <StatusIcon size={14} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {doc.title as string}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {requester && (
                        <span className="text-[11px] text-text-muted">{requester.first_name} {requester.last_name}</span>
                      )}
                      {doc.due_date && (
                        <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                          <Clock size={10} />
                          {new Date(doc.due_date as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-1', status.color, `${status.bgColor}/10`)}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <FileText size={28} className="text-text-muted/30 mb-2" />
          <p className="text-sm text-text-muted">Aucun document en attente</p>
        </div>
      )}
    </div>
  );
}
