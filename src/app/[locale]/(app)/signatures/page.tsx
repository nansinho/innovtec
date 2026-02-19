'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  PenTool,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  CalendarDays,
  ChevronRight,
  Send,
  Eye,
  Download,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

type SignatureStatus = 'en_attente' | 'signe' | 'refuse' | 'urgent';
type SignerStatus = 'signe' | 'en_attente' | 'refuse';

interface Signer {
  name: string;
  role: string;
  status: SignerStatus;
  signed_at?: string;
}

interface SignatureRequest {
  id: string;
  document_title: string;
  document_type: string;
  requester: { first_name: string; last_name: string };
  signers: Signer[];
  status: SignatureStatus;
  created_at: string;
  due_date: string;
  description: string;
}

const STATUS_CONFIG: Record<SignatureStatus, { label: string; icon: typeof Clock; color: string; badgeColor: string }> = {
  en_attente: {
    label: 'En attente',
    icon: Clock,
    color: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  signe: {
    label: 'Signé',
    icon: CheckCircle2,
    color: 'text-success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  refuse: {
    label: 'Refusé',
    icon: XCircle,
    color: 'text-danger',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'text-danger',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
  },
};

const SIGNER_STATUS_CONFIG: Record<SignerStatus, { icon: typeof CheckCircle2; color: string }> = {
  signe: { icon: CheckCircle2, color: 'text-success' },
  en_attente: { icon: Clock, color: 'text-amber-500' },
  refuse: { icon: XCircle, color: 'text-danger' },
};

const DEMO_SIGNATURES: SignatureRequest[] = [
  {
    id: '1',
    document_title: 'Contrat sous-traitance - Chantier Mérignac FTTH',
    document_type: 'Contrat',
    requester: { first_name: 'Nicolas', last_name: 'Bernard' },
    signers: [
      { name: 'Nicolas Bernard', role: 'Directeur Général', status: 'signe', signed_at: '2026-02-17' },
      { name: 'Pierre Oliveira', role: 'Conducteur de travaux', status: 'en_attente' },
      { name: 'STE Réseaux (externe)', role: 'Sous-traitant', status: 'en_attente' },
    ],
    status: 'en_attente',
    created_at: '2026-02-15',
    due_date: '2026-02-25',
    description: 'Contrat de sous-traitance pour le lot fibre optique du chantier Mérignac secteur 3.',
  },
  {
    id: '2',
    document_title: 'Bon de commande - Matériel fibre optique',
    document_type: 'Bon de commande',
    requester: { first_name: 'Jean', last_name: 'Dupont' },
    signers: [
      { name: 'Jean Dupont', role: 'Chef de chantier', status: 'signe', signed_at: '2026-02-16' },
      { name: 'Nicolas Bernard', role: 'Directeur Général', status: 'signe', signed_at: '2026-02-17' },
    ],
    status: 'signe',
    created_at: '2026-02-14',
    due_date: '2026-02-20',
    description: 'Commande de 500 mètres de câble fibre optique monomode et accessoires de raccordement.',
  },
  {
    id: '3',
    document_title: 'PV de réception - Chantier Talence Gaz',
    document_type: 'PV de réception',
    requester: { first_name: 'Pierre', last_name: 'Oliveira' },
    signers: [
      { name: 'Pierre Oliveira', role: 'Conducteur de travaux', status: 'signe', signed_at: '2026-02-18' },
      { name: 'Maria Silva', role: 'Responsable QSE', status: 'en_attente' },
      { name: 'Maître d\'ouvrage (externe)', role: 'Client', status: 'en_attente' },
    ],
    status: 'urgent',
    created_at: '2026-02-12',
    due_date: '2026-02-20',
    description: 'Procès-verbal de réception des travaux de remplacement de conduite gaz DN150.',
  },
  {
    id: '4',
    document_title: 'Avenant contrat de travail - Thomas Ferreira',
    document_type: 'Contrat RH',
    requester: { first_name: 'Sophie', last_name: 'Martin' },
    signers: [
      { name: 'Sophie Martin', role: 'Responsable RH', status: 'signe', signed_at: '2026-02-10' },
      { name: 'Nicolas Bernard', role: 'Directeur Général', status: 'signe', signed_at: '2026-02-11' },
      { name: 'Thomas Ferreira', role: 'Salarié', status: 'signe', signed_at: '2026-02-13' },
    ],
    status: 'signe',
    created_at: '2026-02-08',
    due_date: '2026-02-15',
    description: 'Avenant au contrat de travail pour passage au statut Chef d\'équipe Électricité.',
  },
  {
    id: '5',
    document_title: 'PPSPS - Chantier Pessac réseau Gaz',
    document_type: 'Document QSE',
    requester: { first_name: 'Maria', last_name: 'Silva' },
    signers: [
      { name: 'Maria Silva', role: 'Responsable QSE', status: 'signe', signed_at: '2026-02-14' },
      { name: 'Jean Dupont', role: 'Chef de chantier', status: 'refuse' },
    ],
    status: 'refuse',
    created_at: '2026-02-10',
    due_date: '2026-02-18',
    description: 'Plan Particulier de Sécurité et de Protection de la Santé pour le chantier gaz de Pessac.',
  },
  {
    id: '6',
    document_title: 'Attestation de formation CACES R486',
    document_type: 'Attestation',
    requester: { first_name: 'Lucie', last_name: 'Moreau' },
    signers: [
      { name: 'Lucie Moreau', role: 'Chargée de formation', status: 'signe', signed_at: '2026-02-16' },
      { name: 'Miguel Rodrigues', role: 'Formé', status: 'en_attente' },
    ],
    status: 'en_attente',
    created_at: '2026-02-16',
    due_date: '2026-02-28',
    description: 'Attestation de suivi de la formation CACES Nacelle R486 catégorie A et B.',
  },
  {
    id: '7',
    document_title: 'Ordre de service - Démarrage chantier Bègles',
    document_type: 'Ordre de service',
    requester: { first_name: 'Nicolas', last_name: 'Bernard' },
    signers: [
      { name: 'Nicolas Bernard', role: 'Directeur Général', status: 'signe', signed_at: '2026-02-19' },
      { name: 'Pierre Oliveira', role: 'Conducteur de travaux', status: 'en_attente' },
    ],
    status: 'en_attente',
    created_at: '2026-02-19',
    due_date: '2026-02-22',
    description: 'Ordre de service pour le démarrage des travaux de voirie et réseaux divers à Bègles.',
  },
];

type Tab = 'en_attente' | 'signe' | 'refuse';

export default function SignaturesPage() {
  const t = useTranslations('signatures');
  const [activeTab, setActiveTab] = useState<Tab | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const tabs: { key: Tab | 'all'; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'Toutes', count: DEMO_SIGNATURES.length, color: 'text-text-primary' },
    { key: 'en_attente', label: 'En attente', count: DEMO_SIGNATURES.filter(s => s.status === 'en_attente' || s.status === 'urgent').length, color: 'text-amber-600' },
    { key: 'signe', label: 'Signés', count: DEMO_SIGNATURES.filter(s => s.status === 'signe').length, color: 'text-success' },
    { key: 'refuse', label: 'Refusés', count: DEMO_SIGNATURES.filter(s => s.status === 'refuse').length, color: 'text-danger' },
  ];

  const filteredSignatures = DEMO_SIGNATURES.filter((sig) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'en_attente') return sig.status === 'en_attente' || sig.status === 'urgent';
    return sig.status === activeTab;
  });

  const selectedDoc = selectedRequest ? DEMO_SIGNATURES.find(s => s.id === selectedRequest) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Signatures électroniques</h1>
          <p className="text-sm text-text-secondary mt-1">
            {DEMO_SIGNATURES.filter(s => s.status === 'en_attente' || s.status === 'urgent').length} document{DEMO_SIGNATURES.filter(s => s.status === 'en_attente' || s.status === 'urgent').length > 1 ? 's' : ''} en attente de signature
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
          { label: 'En attente', value: DEMO_SIGNATURES.filter(s => s.status === 'en_attente').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Urgents', value: DEMO_SIGNATURES.filter(s => s.status === 'urgent').length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-red-50' },
          { label: 'Signés', value: DEMO_SIGNATURES.filter(s => s.status === 'signe').length, icon: CheckCircle2, color: 'text-success', bg: 'bg-emerald-50' },
          { label: 'Refusés', value: DEMO_SIGNATURES.filter(s => s.status === 'refuse').length, icon: XCircle, color: 'text-danger', bg: 'bg-red-50' },
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        {/* Document List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredSignatures.map((sig) => {
            const statusConfig = STATUS_CONFIG[sig.status];
            const StatusIcon = statusConfig.icon;
            const gradient = getAvatarGradient(sig.requester.first_name + sig.requester.last_name);
            const initials = getInitials(sig.requester.first_name, sig.requester.last_name);
            const signedCount = sig.signers.filter(s => s.status === 'signe').length;
            const isSelected = selectedRequest === sig.id;
            const isOverdue = new Date(sig.due_date) < new Date() && sig.status !== 'signe';

            return (
              <div
                key={sig.id}
                onClick={() => setSelectedRequest(sig.id)}
                className={cn(
                  'card p-4 cursor-pointer transition-all duration-200',
                  isSelected ? 'ring-2 ring-primary shadow-card-hover' : 'hover:shadow-card-hover hover:-translate-y-0.5',
                  sig.status === 'urgent' && 'border-l-4 border-l-danger'
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
                          {sig.document_title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {sig.document_type}
                        </p>
                      </div>
                      <span className={cn('badge shrink-0 border', statusConfig.badgeColor)}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mt-2 line-clamp-1">
                      {sig.description}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                            {initials}
                          </div>
                          <span className="text-xs text-text-muted">
                            {sig.requester.first_name} {sig.requester.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <PenTool size={12} />
                          <span>{signedCount}/{sig.signers.length} signataires</span>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 text-xs',
                        isOverdue ? 'text-danger font-semibold' : 'text-text-muted'
                      )}>
                        <CalendarDays size={12} />
                        {isOverdue ? 'En retard - ' : 'Échéance : '}
                        {new Date(sig.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    {/* Signers progress */}
                    <div className="flex items-center gap-1 mt-2">
                      {sig.signers.map((signer, idx) => {
                        const signerConfig = SIGNER_STATUS_CONFIG[signer.status];
                        return (
                          <div
                            key={idx}
                            className="h-1.5 flex-1 rounded-full"
                            style={{
                              backgroundColor:
                                signer.status === 'signe' ? '#36B37E' :
                                signer.status === 'refuse' ? '#FF5630' :
                                '#DFE1E6',
                            }}
                            title={`${signer.name} - ${signer.status === 'signe' ? 'Signé' : signer.status === 'refuse' ? 'Refusé' : 'En attente'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSignatures.length === 0 && (
            <div className="text-center py-16">
              <PenTool size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted text-sm">Aucune demande de signature trouvée</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="card p-5 h-fit sticky top-6">
          {selectedDoc ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-primary" />
                <h3 className="text-base font-bold text-text-primary">Détails du document</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedDoc.document_title}</h4>
                  <p className="text-xs text-text-secondary mt-1">{selectedDoc.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Type</span>
                    <p className="font-medium text-text-primary mt-0.5">{selectedDoc.document_type}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Statut</span>
                    <p className="mt-0.5">
                      <span className={cn('badge border', STATUS_CONFIG[selectedDoc.status].badgeColor)}>
                        {STATUS_CONFIG[selectedDoc.status].label}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Créé le</span>
                    <p className="font-medium text-text-primary mt-0.5">
                      {new Date(selectedDoc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Échéance</span>
                    <p className="font-medium text-text-primary mt-0.5">
                      {new Date(selectedDoc.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border-light pt-4">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Signataires</h4>
                  <div className="space-y-2">
                    {selectedDoc.signers.map((signer, idx) => {
                      const signerConfig = SIGNER_STATUS_CONFIG[signer.status];
                      const SignerIcon = signerConfig.icon;
                      const signerGradient = getAvatarGradient(signer.name);
                      const signerInitials = signer.name.split(' ').map(n => n[0]).join('').toUpperCase();

                      return (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${signerGradient} text-[10px] font-bold text-white shrink-0`}>
                            {signerInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary">{signer.name}</p>
                            <p className="text-[10px] text-text-muted">{signer.role}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <SignerIcon size={14} className={signerConfig.color} />
                            {signer.signed_at && (
                              <span className="text-[10px] text-text-muted">
                                {new Date(signer.signed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs">
                    <PenTool size={14} />
                    Signer
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-1 text-xs px-3">
                    <Eye size={14} />
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-1 text-xs px-3">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <PenTool size={32} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm text-text-muted">
                Sélectionnez un document pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
