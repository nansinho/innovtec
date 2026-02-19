'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignDoc {
  id: string;
  title: string;
  requested_by: string;
  status: 'urgent' | 'en_attente' | 'signe';
  due_date: string;
}

const DEMO_DOCS: SignDoc[] = [
  {
    id: '1',
    title: 'Contrat sous-traitance Electra Pro',
    requested_by: 'Sophie Martin',
    status: 'urgent',
    due_date: '2025-01-20',
  },
  {
    id: '2',
    title: 'Avenant plan de prévention chantier #42',
    requested_by: 'Maria Silva',
    status: 'en_attente',
    due_date: '2025-01-25',
  },
  {
    id: '3',
    title: 'Attestation formation SST - Lot 3',
    requested_by: 'Jean Dupont',
    status: 'signe',
    due_date: '2025-01-15',
  },
];

const statusConfig = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    className: 'text-danger bg-red-50 border-red-200',
  },
  en_attente: {
    label: 'En attente',
    icon: Clock,
    className: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  signe: {
    label: 'Signé',
    icon: CheckCircle,
    className: 'text-success bg-emerald-50 border-emerald-200',
  },
};

export function DocumentsToSign() {
  const t = useTranslations('dashboard');

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('documentsToSign')}</h2>
        <Link
          href="/signatures"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {DEMO_DOCS.map((doc) => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-border-light p-3 hover:border-primary/20 transition-colors cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{doc.title}</p>
                <p className="text-xs text-text-muted">Demandé par {doc.requested_by}</p>
              </div>
              <div className={cn('badge border', status.className)}>
                <StatusIcon size={12} className="mr-1" />
                {status.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
