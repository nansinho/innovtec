'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Monitor,
  MapPin,
  Shuffle,
  Award,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FormationType = 'presentiel' | 'elearning' | 'mixte';
type FormationStatus = 'disponible' | 'inscrit' | 'en_cours' | 'termine' | 'complet';

interface Formation {
  id: string;
  title: string;
  description: string;
  type: FormationType;
  category: string;
  duration_hours: number;
  instructor: string;
  status: FormationStatus;
  max_participants: number;
  current_participants: number;
  next_session: string;
  progress?: number;
  certification?: string;
}

const TYPE_CONFIG: Record<FormationType, { label: string; icon: typeof Monitor; color: string; bg: string }> = {
  presentiel: { label: 'Présentiel', icon: MapPin, color: '#0052CC', bg: 'bg-blue-50 text-blue-700' },
  elearning: { label: 'E-learning', icon: Monitor, color: '#36B37E', bg: 'bg-emerald-50 text-emerald-700' },
  mixte: { label: 'Mixte', icon: Shuffle, color: '#6B21A8', bg: 'bg-purple-50 text-purple-700' },
};

const STATUS_CONFIG: Record<FormationStatus, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-blue-50 text-blue-700' },
  inscrit: { label: 'Inscrit', color: 'bg-amber-50 text-amber-700' },
  en_cours: { label: 'En cours', color: 'bg-primary-50 text-primary' },
  termine: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-700' },
  complet: { label: 'Complet', color: 'bg-gray-100 text-gray-500' },
};

const CATEGORIES = [
  'Toutes',
  'Sécurité',
  'Habilitations',
  'CACES',
  'Management',
  'Technique',
  'Qualité',
];

const DEMO_FORMATIONS: Formation[] = [
  {
    id: '1',
    title: 'Habilitation Électrique B1V/B2V',
    description: 'Formation initiale aux habilitations électriques pour travaux en basse tension. Inclut les règles de sécurité, les procédures de consignation et les gestes de premiers secours.',
    type: 'presentiel',
    category: 'Habilitations',
    duration_hours: 21,
    instructor: 'Formateur APAVE',
    status: 'en_cours',
    max_participants: 12,
    current_participants: 10,
    next_session: '2026-03-10',
    progress: 65,
    certification: 'NF C 18-510',
  },
  {
    id: '2',
    title: 'CACES Nacelle R486 - Cat. A et B',
    description: 'Conduite en sécurité des PEMP (Plateformes Élévatrices Mobiles de Personnes). Formation théorique et pratique avec évaluation finale.',
    type: 'presentiel',
    category: 'CACES',
    duration_hours: 14,
    instructor: 'Centre AFPA Bordeaux',
    status: 'inscrit',
    max_participants: 8,
    current_participants: 6,
    next_session: '2026-03-24',
    progress: 0,
    certification: 'CACES R486',
  },
  {
    id: '3',
    title: 'SST - Sauveteur Secouriste du Travail',
    description: 'Formation aux premiers secours en milieu professionnel. Réactions adaptées en cas d\'accident, alerter et secourir une victime.',
    type: 'presentiel',
    category: 'Sécurité',
    duration_hours: 14,
    instructor: 'Croix-Rouge Formation',
    status: 'disponible',
    max_participants: 10,
    current_participants: 4,
    next_session: '2026-04-07',
    certification: 'Certificat SST',
  },
  {
    id: '4',
    title: 'Sensibilisation aux risques amiante SS4',
    description: 'Formation à la prévention du risque amiante pour les activités en sous-section 4. Reconnaissance des matériaux amiantés et procédures de protection.',
    type: 'mixte',
    category: 'Sécurité',
    duration_hours: 7,
    instructor: 'Maria Silva',
    status: 'disponible',
    max_participants: 15,
    current_participants: 3,
    next_session: '2026-03-15',
    certification: 'Attestation SS4',
  },
  {
    id: '5',
    title: 'Management d\'équipe terrain',
    description: 'Développer ses compétences de chef d\'équipe : communication, gestion des conflits, organisation du travail quotidien, leadership opérationnel.',
    type: 'mixte',
    category: 'Management',
    duration_hours: 14,
    instructor: 'Cabinet RH Plus',
    status: 'disponible',
    max_participants: 10,
    current_participants: 7,
    next_session: '2026-04-14',
  },
  {
    id: '6',
    title: 'AIPR - Autorisation d\'Intervention à Proximité des Réseaux',
    description: 'Formation obligatoire pour les interventions à proximité des réseaux souterrains et aériens. Préparation à l\'examen QCM AIPR.',
    type: 'elearning',
    category: 'Habilitations',
    duration_hours: 7,
    instructor: 'Plateforme E-AIPR',
    status: 'termine',
    max_participants: 50,
    current_participants: 45,
    next_session: '2026-02-01',
    progress: 100,
    certification: 'AIPR Concepteur/Encadrant',
  },
  {
    id: '7',
    title: 'Qualité ISO 9001 - Fondamentaux',
    description: 'Comprendre les exigences de la norme ISO 9001 et leur application dans le BTP. Processus qualité, audits internes et amélioration continue.',
    type: 'elearning',
    category: 'Qualité',
    duration_hours: 3,
    instructor: 'AFNOR Formation',
    status: 'en_cours',
    max_participants: 30,
    current_participants: 18,
    next_session: '2026-03-01',
    progress: 40,
  },
  {
    id: '8',
    title: 'Techniques de soudure PEHD',
    description: 'Maîtrise des techniques de soudure bout à bout et électrosoudure sur tubes polyéthylène haute densité pour réseaux gaz et eau.',
    type: 'presentiel',
    category: 'Technique',
    duration_hours: 35,
    instructor: 'Centre GRETA',
    status: 'complet',
    max_participants: 6,
    current_participants: 6,
    next_session: '2026-05-05',
  },
  {
    id: '9',
    title: 'CACES Pelle Hydraulique R482 - Cat. A',
    description: 'Conduite en sécurité des engins de chantier. Formation théorique et pratique sur mini-pelle et pelle hydraulique.',
    type: 'presentiel',
    category: 'CACES',
    duration_hours: 21,
    instructor: 'Centre ECF',
    status: 'termine',
    max_participants: 6,
    current_participants: 6,
    next_session: '2026-01-20',
    progress: 100,
    certification: 'CACES R482 Cat. A',
  },
];

type Tab = 'catalogue' | 'mes_formations' | 'a_venir' | 'terminees';

export default function FormationsPage() {
  const t = useTranslations('formations');
  const [activeTab, setActiveTab] = useState<Tab>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'catalogue', label: 'Catalogue', count: DEMO_FORMATIONS.length },
    { key: 'mes_formations', label: 'Mes formations', count: DEMO_FORMATIONS.filter(f => ['inscrit', 'en_cours'].includes(f.status)).length },
    { key: 'a_venir', label: 'À venir', count: DEMO_FORMATIONS.filter(f => f.status === 'inscrit').length },
    { key: 'terminees', label: 'Terminées', count: DEMO_FORMATIONS.filter(f => f.status === 'termine').length },
  ];

  const filteredFormations = DEMO_FORMATIONS.filter((formation) => {
    const matchesSearch =
      searchQuery === '' ||
      formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formation.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Toutes' || formation.category === selectedCategory;

    let matchesTab = true;
    switch (activeTab) {
      case 'mes_formations':
        matchesTab = ['inscrit', 'en_cours'].includes(formation.status);
        break;
      case 'a_venir':
        matchesTab = formation.status === 'inscrit';
        break;
      case 'terminees':
        matchesTab = formation.status === 'termine';
        break;
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  const totalHours = DEMO_FORMATIONS
    .filter(f => ['en_cours', 'termine'].includes(f.status))
    .reduce((sum, f) => sum + f.duration_hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Formations</h1>
          <p className="text-sm text-text-secondary mt-1">
            Catalogue de formations et suivi de vos parcours
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-button">
            <Award size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{totalHours}h de formation</span>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: 'Formations disponibles', value: DEMO_FORMATIONS.filter(f => f.status === 'disponible').length, color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'En cours', value: DEMO_FORMATIONS.filter(f => f.status === 'en_cours').length, color: 'text-accent', bg: 'bg-accent-50' },
          { label: 'Inscrit', value: DEMO_FORMATIONS.filter(f => f.status === 'inscrit').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Terminées', value: DEMO_FORMATIONS.filter(f => f.status === 'termine').length, color: 'text-success', bg: 'bg-emerald-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className="text-xs text-text-muted font-medium">{kpi.label}</div>
            <div className={cn('text-2xl font-bold mt-1', kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-light animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger">
        {filteredFormations.map((formation) => {
          const typeConfig = TYPE_CONFIG[formation.type];
          const statusConfig = STATUS_CONFIG[formation.status];
          const TypeIcon = typeConfig.icon;
          const isFull = formation.status === 'complet';
          const hasProgress = formation.progress !== undefined && formation.progress > 0;

          return (
            <div
              key={formation.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Top color bar */}
              <div className="h-1.5" style={{ backgroundColor: typeConfig.color }} />

              <div className="p-5">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={cn('badge', typeConfig.bg)}>
                    <TypeIcon size={12} className="mr-1" />
                    {typeConfig.label}
                  </span>
                  <span className={cn('badge', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                  {formation.certification && (
                    <span className="badge bg-amber-50 text-amber-700">
                      <Award size={10} className="mr-1" />
                      Certifiante
                    </span>
                  )}
                </div>

                {/* Title & description */}
                <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {formation.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                  {formation.description}
                </p>

                {/* Progress bar for enrolled/in-progress */}
                {hasProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-muted">Progression</span>
                      <span className="font-semibold text-text-primary">{formation.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${formation.progress}%`,
                          backgroundColor: formation.progress === 100 ? '#36B37E' : '#0052CC',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-text-muted" />
                    <span>{formation.duration_hours}h de formation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-text-muted" />
                    <span>{formation.current_participants}/{formation.max_participants} places</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={12} className="text-text-muted" />
                    <span>{formation.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award size={12} className="text-text-muted" />
                    <span className="truncate">{formation.instructor}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="text-xs text-text-muted">
                    Prochaine session : {new Date(formation.next_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {formation.status === 'disponible' && (
                    <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      S&apos;inscrire
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {formation.status === 'en_cours' && (
                    <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      Continuer
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {formation.status === 'termine' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-success">
                      <Award size={14} />
                      Validée
                    </span>
                  )}
                  {isFull && (
                    <button className="text-xs px-3 py-1.5 rounded-button border border-border text-text-muted cursor-not-allowed">
                      Complet
                    </button>
                  )}
                  {formation.status === 'inscrit' && (
                    <span className="text-xs font-semibold text-amber-600">
                      Inscription confirmée
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFormations.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">Aucune formation trouvée</p>
        </div>
      )}
    </div>
  );
}
