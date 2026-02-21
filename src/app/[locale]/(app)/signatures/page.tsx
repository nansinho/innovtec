'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  PenTool,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  CalendarDays,
  Eye,
  Download,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { signDocument, rejectDocument } from '@/lib/actions';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';

type SignatureStatus = 'en_attente' | 'signe' | 'refuse';

const STATUS_CONFIG: Record<SignatureStatus, { label: string; icon: typeof Clock; color: string; badgeColor: string }> = {
  en_attente: {
    label: 'En attente',
    icon: Clock,
    color: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  signe: {
    label: 'Sign\u00e9',
    icon: CheckCircle2,
    color: 'text-success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  refuse: {
    label: 'Refus\u00e9',
    icon: XCircle,
    color: 'text-danger',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
};

const SIGNER_STATUS_CONFIG: Record<SignatureStatus, { icon: typeof CheckCircle2; color: string }> = {
  signe: { icon: CheckCircle2, color: 'text-success' },
  en_attente: { icon: Clock, color: 'text-amber-500' },
  refuse: { icon: XCircle, color: 'text-danger' },
};

type Tab = 'all' | 'en_attente' | 'signe' | 'refuse';

export default function SignaturesPage() {
  const t = useTranslations('signatures');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { toast } = useToast();

  const { data, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('signature_requests')
        .select('*, document:documents(*), requester:profiles!signature_requests_requested_by_fkey(*), items:signature_items(*, signer:profiles!signature_items_signer_id_fkey(*))')
        .order('created_at', { ascending: false }),
  );

  const allRequests = (data || []) as Record<string, any>[];

  const getStatus = (req: Record<string, any>): SignatureStatus => {
    return (req.status as SignatureStatus) || 'en_attente';
  };

  const getItems = (req: Record<string, any>): Record<string, any>[] => {
    return (req.items as Record<string, any>[]) || [];
  };

  const getRequester = (req: Record<string, any>): { first_name: string; last_name: string } => {
    const r = req.requester as Record<string, any> | null;
    return {
      first_name: (r?.first_name as string) || '',
      last_name: (r?.last_name as string) || '',
    };
  };

  const getItemSigner = (item: Record<string, any>): { first_name: string; last_name: string; position: string | null } => {
    const s = item.signer as Record<string, any> | null;
    return {
      first_name: (s?.first_name as string) || '',
      last_name: (s?.last_name as string) || '',
      position: (s?.position as string) || null,
    };
  };

  const pendingCount = allRequests.filter(r => getStatus(r) === 'en_attente').length;
  const signedCount = allRequests.filter(r => getStatus(r) === 'signe').length;
  const refusedCount = allRequests.filter(r => getStatus(r) === 'refuse').length;

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'Toutes', count: allRequests.length, color: 'text-text-primary' },
    { key: 'en_attente', label: 'En attente', count: pendingCount, color: 'text-amber-600' },
    { key: 'signe', label: 'Sign\u00e9s', count: signedCount, color: 'text-success' },
    { key: 'refuse', label: 'Refus\u00e9s', count: refusedCount, color: 'text-danger' },
  ];

  const filteredSignatures = allRequests.filter((req) => {
    if (activeTab === 'all') return true;
    return getStatus(req) === activeTab;
  });

  const selectedDoc = selectedRequest ? allRequests.find(r => (r.id as string) === selectedRequest) : null;

  const handleSign = async (itemId: string) => {
    setSigning(true);
    try {
      await signDocument(itemId, 'signature_placeholder');
      toast('Document sign\u00e9 avec succ\u00e8s', 'success');
      refetch();
    } catch {
      toast('Erreur lors de la signature', 'error');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async (itemId: string) => {
    setRejecting(true);
    try {
      await rejectDocument(itemId, 'Refus\u00e9 par le signataire');
      toast('Document refus\u00e9', 'success');
      refetch();
    } catch {
      toast('Erreur lors du refus', 'error');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Signatures \u00e9lectroniques</h1>
          <p className="text-sm text-text-secondary mt-1">
            {pendingCount} document{pendingCount > 1 ? 's' : ''} en attente de signature
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Nouvelle demande
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: 'Total', value: allRequests.length, icon: FileText, color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'En attente', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sign\u00e9s', value: signedCount, icon: CheckCircle2, color: 'text-success', bg: 'bg-emerald-50' },
          { label: 'Refus\u00e9s', value: refusedCount, icon: XCircle, color: 'text-danger', bg: 'bg-red-50' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4 flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.bg)}>
                <Icon size={20} className={card.color} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
                <p className="text-xs text-text-muted">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-light animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedRequest(null); }}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              activeTab === tab.key ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-text-muted'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {allRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          {/* Document List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredSignatures.map((req) => {
              const status = getStatus(req);
              const statusConfig = STATUS_CONFIG[status];
              const StatusIcon = statusConfig.icon;
              const requester = getRequester(req);
              const gradient = getAvatarGradient(requester.first_name + requester.last_name);
              const initials = getInitials(requester.first_name, requester.last_name);
              const items = getItems(req);
              const itemSignedCount = items.filter(i => (i.status as string) === 'signe').length;
              const isSelected = selectedRequest === (req.id as string);
              const dueDate = req.due_date as string | null;
              const isOverdue = dueDate ? new Date(dueDate) < new Date() && status !== 'signe' : false;
              const title = (req.title as string) || '';
              const message = (req.message as string) || '';
              const document = req.document as Record<string, any> | null;
              const documentTitle = (document?.title as string) || title;

              return (
                <div
                  key={req.id as string}
                  onClick={() => setSelectedRequest(req.id as string)}
                  className={cn(
                    'card p-4 cursor-pointer transition-all duration-200',
                    isSelected ? 'ring-2 ring-primary shadow-card-hover' : 'hover:shadow-card-hover hover:-translate-y-0.5',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 shrink-0">
                      <FileText size={20} className="text-text-muted" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary line-clamp-1">
                            {documentTitle}
                          </h3>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {title}
                          </p>
                        </div>
                        <span className={cn('badge shrink-0 border', statusConfig.badgeColor)}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {message && (
                        <p className="text-xs text-text-secondary mt-2 line-clamp-1">
                          {message}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                              {initials}
                            </div>
                            <span className="text-xs text-text-muted">
                              {requester.first_name} {requester.last_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <PenTool size={12} />
                            <span>{itemSignedCount}/{items.length} signataires</span>
                          </div>
                        </div>
                        {dueDate && (
                          <div className={cn(
                            'flex items-center gap-1 text-xs',
                            isOverdue ? 'text-danger font-semibold' : 'text-text-muted'
                          )}>
                            <CalendarDays size={12} />
                            {isOverdue ? 'En retard - ' : '\u00c9ch\u00e9ance : '}
                            {new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>

                      {/* Signers progress */}
                      {items.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {items.map((item, idx) => {
                            const itemStatus = (item.status as string) || 'en_attente';
                            const signer = getItemSigner(item);
                            return (
                              <div
                                key={idx}
                                className="h-1.5 flex-1 rounded-full"
                                style={{
                                  backgroundColor:
                                    itemStatus === 'signe' ? '#36B37E' :
                                    itemStatus === 'refuse' ? '#FF5630' :
                                    '#DFE1E6',
                                }}
                                title={`${signer.first_name} ${signer.last_name} - ${itemStatus === 'signe' ? 'Sign\u00e9' : itemStatus === 'refuse' ? 'Refus\u00e9' : 'En attente'}`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSignatures.length === 0 && (
              <div className="text-center py-16">
                <PenTool size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted text-sm">Aucune demande de signature trouv\u00e9e</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="card p-5 h-fit sticky top-6">
            {selectedDoc ? (() => {
              const status = getStatus(selectedDoc);
              const requester = getRequester(selectedDoc);
              const items = getItems(selectedDoc);
              const title = (selectedDoc.title as string) || '';
              const message = (selectedDoc.message as string) || '';
              const document = selectedDoc.document as Record<string, any> | null;
              const documentTitle = (document?.title as string) || title;
              const dueDate = selectedDoc.due_date as string | null;
              const createdAt = selectedDoc.created_at as string | null;

              return (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-primary" />
                    <h3 className="text-base font-bold text-text-primary">D\u00e9tails du document</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{documentTitle}</h4>
                      {message && <p className="text-xs text-text-secondary mt-1">{message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-text-muted">Demandeur</span>
                        <p className="font-medium text-text-primary mt-0.5">{requester.first_name} {requester.last_name}</p>
                      </div>
                      <div>
                        <span className="text-text-muted">Statut</span>
                        <p className="mt-0.5">
                          <span className={cn('badge border', STATUS_CONFIG[status].badgeColor)}>
                            {STATUS_CONFIG[status].label}
                          </span>
                        </p>
                      </div>
                      {createdAt && (
                        <div>
                          <span className="text-text-muted">Cr\u00e9\u00e9 le</span>
                          <p className="font-medium text-text-primary mt-0.5">
                            {new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                      {dueDate && (
                        <div>
                          <span className="text-text-muted">\u00c9ch\u00e9ance</span>
                          <p className="font-medium text-text-primary mt-0.5">
                            {new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border-light pt-4">
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Signataires</h4>
                      <div className="space-y-2">
                        {items.map((item, idx) => {
                          const itemStatus = (item.status as SignatureStatus) || 'en_attente';
                          const signerConfig = SIGNER_STATUS_CONFIG[itemStatus];
                          const SignerIcon = signerConfig.icon;
                          const signer = getItemSigner(item);
                          const signerName = `${signer.first_name} ${signer.last_name}`.trim();
                          const signerGradient = getAvatarGradient(signerName);
                          const signerInitials = signer.first_name && signer.last_name
                            ? getInitials(signer.first_name, signer.last_name)
                            : '?';
                          const signedAt = item.signed_at as string | null;

                          return (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${signerGradient} text-[10px] font-bold text-white shrink-0`}>
                                {signerInitials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-primary">{signerName || 'Signataire'}</p>
                                <p className="text-[10px] text-text-muted">{signer.position || ''}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <SignerIcon size={14} className={signerConfig.color} />
                                {signedAt && (
                                  <span className="text-[10px] text-text-muted">
                                    {new Date(signedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {items.filter(i => (i.status as string) === 'en_attente').length > 0 && (
                        <>
                          <button
                            onClick={() => {
                              const pendingItem = items.find(i => (i.status as string) === 'en_attente');
                              if (pendingItem) handleSign(pendingItem.id as string);
                            }}
                            disabled={signing}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs"
                          >
                            <PenTool size={14} />
                            {signing ? 'Signature...' : 'Signer'}
                          </button>
                          <button
                            onClick={() => {
                              const pendingItem = items.find(i => (i.status as string) === 'en_attente');
                              if (pendingItem) handleReject(pendingItem.id as string);
                            }}
                            disabled={rejecting}
                            className="btn-secondary flex items-center justify-center gap-2 text-xs px-3"
                          >
                            <XCircle size={14} />
                            {rejecting ? 'Refus...' : 'Refuser'}
                          </button>
                        </>
                      )}
                      <button className="btn-secondary flex items-center justify-center gap-1 text-xs px-3">
                        <Eye size={14} />
                      </button>
                      <button className="btn-secondary flex items-center justify-center gap-1 text-xs px-3">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-12">
                <PenTool size={32} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">
                  S\u00e9lectionnez un document pour voir les d\u00e9tails
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState message="Aucune demande de signature" description="Les demandes de signature appara\u00eetront ici une fois cr\u00e9\u00e9es." />
      )}
    </div>
  );
}
