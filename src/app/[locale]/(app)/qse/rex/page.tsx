'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MapPin,
  Eye,
  MessageCircle,
  Image as ImageIcon,
  Filter,
  Award,
  ChevronRight,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

// --- Types ---
interface RetourExperience {
  id: string;
  reference: string;
  title: string;
  description: string;
  context: string;
  lessons_positive: string[];
  lessons_negative: string[];
  recommendations: string;
  category: string;
  chantier: string;
  location: string;
  author: { first_name: string; last_name: string };
  date: string;
  views: number;
  comments: number;
  has_photos: boolean;
  photo_count: number;
  impact: 'faible' | 'moyen' | 'fort';
}

// --- Demo Data ---
const CATEGORIES = [
  { name: 'Tous', value: 'all', color: '#0052CC' },
  { name: 'Technique', value: 'technique', color: '#0052CC' },
  { name: 'Securite', value: 'securite', color: '#FF5630' },
  { name: 'Organisation', value: 'organisation', color: '#FF6B35' },
  { name: 'Environnement', value: 'environnement', color: '#36B37E' },
  { name: 'Client', value: 'client', color: '#6B21A8' },
];

const DEMO_REX: RetourExperience[] = [
  {
    id: '1',
    reference: 'REX-2026-012',
    title: 'Deploiement FTTH en zone inondable : adaptation des methodes',
    description:
      'Retour d\'experience sur l\'adaptation des techniques de pose de fibre optique en zone classee inondable. Modifications du plan de pose et solutions techniques mises en oeuvre.',
    context:
      'Chantier FTTH en bordure de Garonne avec nappe phreatique a 80cm. Intervention en periode hivernale avec risque de crue.',
    lessons_positive: [
      'Anticipation des conditions meteo avec plan B systematique',
      'Utilisation de chambres etanches IP68 plutot que standard',
      'Communication proactive avec la mairie et les riverains',
    ],
    lessons_negative: [
      'Sous-estimation du temps de sechage des tranchees',
      'Materiel de pompage insuffisant lors de la premiere intervention',
    ],
    recommendations:
      'Prevoir systematiquement du materiel de pompage pour tout chantier en zone inondable. Majorer les delais de 30%.',
    category: 'technique',
    chantier: 'FTTH Bordeaux Rive Droite - Lot 5',
    location: 'Quai de la Souys, Bordeaux',
    author: { first_name: 'Jean', last_name: 'Dupont' },
    date: '2026-02-10',
    views: 89,
    comments: 12,
    has_photos: true,
    photo_count: 6,
    impact: 'fort',
  },
  {
    id: '2',
    reference: 'REX-2026-011',
    title: 'Incident evite : detection reseau gaz non cartographie',
    description:
      'Lors d\'une fouille pour pose de cable telecom, detection d\'un reseau gaz non repertorie sur les plans DICT. Arret immediat et securisation de la zone.',
    context:
      'Terrassement mecanique a la mini-pelle, profondeur 1m20. Le conducteur a detecte une odeur suspecte et a stoppe immediatement l\'engin.',
    lessons_positive: [
      'Reflexe immediat du conducteur d\'engin forme a la detection gaz',
      'Application parfaite de la procedure d\'urgence',
      'Communication rapide avec GRDF pour intervention',
    ],
    lessons_negative: [
      'Plans DICT incomplets - reseau ancien non repertorie',
      'Pas de detection prealable au detecteur de reseaux',
    ],
    recommendations:
      'Rendre obligatoire la detection aux instruments avant tout terrassement mecanique, meme avec DICT favorable.',
    category: 'securite',
    chantier: 'Reseau Gaz Pessac Centre',
    location: 'Rue Jean Jaures, Pessac',
    author: { first_name: 'Thomas', last_name: 'Ferreira' },
    date: '2026-02-03',
    views: 156,
    comments: 23,
    has_photos: true,
    photo_count: 4,
    impact: 'fort',
  },
  {
    id: '3',
    reference: 'REX-2026-010',
    title: 'Optimisation du planning equipe avec l\'outil digital',
    description:
      'Mise en place d\'un planning digital partage pour coordonner 4 equipes sur un meme secteur. Gains de productivite et reduction des temps morts.',
    context:
      'Chantier multi-lots avec 4 equipes de 3 techniciens intervenant sur le meme quartier. Problemes recurrents de coordination et de doublons.',
    lessons_positive: [
      'Reduction de 25% des temps de deplacement inter-sites',
      'Zero conflit de planning entre equipes sur le dernier mois',
      'Meilleure visibilite pour le client sur l\'avancement',
    ],
    lessons_negative: [
      'Phase d\'adoption difficile pour les equipes peu digitalisees',
      'Necessite une connexion internet stable sur le terrain',
    ],
    recommendations:
      'Deployer l\'outil sur tous les chantiers multi-lots. Prevoir une formation de 2h par equipe.',
    category: 'organisation',
    chantier: 'FTTH Merignac Lot 3',
    location: 'Merignac',
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
    date: '2026-01-25',
    views: 78,
    comments: 8,
    has_photos: false,
    photo_count: 0,
    impact: 'moyen',
  },
  {
    id: '4',
    reference: 'REX-2026-009',
    title: 'Gestion exemplaire des dechets chantier FTTH Begles',
    description:
      'Retour positif sur la mise en place du tri 4 flux sur le chantier NRO Begles Sud. Taux de valorisation de 85% atteint.',
    context:
      'Premier chantier pilote pour le nouveau systeme de tri selectif. 4 bennes distinctes avec signalisation coloree et formation des equipes.',
    lessons_positive: [
      'Taux de valorisation de 85%, bien au-dessus de l\'objectif de 70%',
      'Adhesion rapide des equipes grace a la formation ludique',
      'Reduction de 15% des couts de traitement des dechets',
    ],
    lessons_negative: [
      'Encombrement supplementaire sur chantier en espace restreint',
    ],
    recommendations:
      'Generaliser le systeme sur tous les chantiers. Adapter la taille des bennes selon l\'espace disponible.',
    category: 'environnement',
    chantier: 'NRO Begles Sud',
    location: 'Zone Industrielle, Begles',
    author: { first_name: 'Claire', last_name: 'Petit' },
    date: '2026-01-18',
    views: 64,
    comments: 5,
    has_photos: true,
    photo_count: 8,
    impact: 'moyen',
  },
  {
    id: '5',
    reference: 'REX-2026-008',
    title: 'Satisfaction client : livraison anticipee reseau telecom',
    description:
      'Livraison du reseau telecom avec 2 semaines d\'avance grace a une reorganisation des equipes et une meteo favorable.',
    context:
      'Chantier de deploiement telecom pour un promoteur immobilier avec livraison des logements imminente. Pression forte du client.',
    lessons_positive: [
      'Reorganisation en 2x8 sur la phase critique - gain de 10 jours',
      'Coordination parfaite avec le conducteur de travaux du promoteur',
      'Lettre de felicitations du client avec recommandation',
    ],
    lessons_negative: [
      'Surcout heures supplementaires non anticipe dans le devis initial',
    ],
    recommendations:
      'Prevoir une clause de flexibilite horaire dans les marches avec promoteurs. Negocier les avenants en amont.',
    category: 'client',
    chantier: 'Telecom Residence Les Ondines',
    location: 'Bruges',
    author: { first_name: 'Miguel', last_name: 'Rodrigues' },
    date: '2026-01-08',
    views: 92,
    comments: 15,
    has_photos: true,
    photo_count: 3,
    impact: 'fort',
  },
  {
    id: '6',
    reference: 'REX-2026-007',
    title: 'Quart d\'heure securite thematique : retour tres positif',
    description:
      'Test d\'un nouveau format de quart d\'heure securite avec mise en situation pratique au lieu du format PowerPoint classique.',
    context:
      'Initiative du chef d\'equipe pour rendre les quarts d\'heure securite plus impactants. Test sur 3 semaines avec l\'equipe Electricite.',
    lessons_positive: [
      'Taux de participation et d\'attention multiplie par 2',
      'Les equipes proposent spontanement des themes',
      'Meilleure retention des messages securite',
    ],
    lessons_negative: [
      'Necessite plus de temps de preparation pour l\'animateur',
      'Difficile a faire en cas de mauvais temps (exercices en exterieur)',
    ],
    recommendations:
      'Deployer le format sur toutes les equipes. Creer une banque de scenarios pratiques partageables.',
    category: 'securite',
    chantier: 'Transverse',
    location: 'Tous chantiers',
    author: { first_name: 'Thomas', last_name: 'Ferreira' },
    date: '2025-12-20',
    views: 134,
    comments: 19,
    has_photos: false,
    photo_count: 0,
    impact: 'moyen',
  },
];

// --- Helpers ---
function getImpactConfig(impact: RetourExperience['impact']) {
  const map = {
    faible: { label: 'Impact faible', color: 'text-blue-600 bg-blue-50' },
    moyen: { label: 'Impact moyen', color: 'text-amber-600 bg-amber-50' },
    fort: { label: 'Impact fort', color: 'text-emerald-600 bg-emerald-50' },
  };
  return map[impact];
}

function getCategoryConfig(value: string) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];
}

// --- Component ---
export default function RexPage() {
  const t = useTranslations('qse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRex = DEMO_REX.filter((rex) => {
    const matchesCategory =
      selectedCategory === 'all' || rex.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      rex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rex.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rex.chantier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-success/10">
              <Lightbulb size={20} className="text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Retours d&apos;Experience (REX)
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Capitaliser sur les experiences terrain pour progresser ensemble
              </p>
            </div>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit bg-success hover:bg-success-dark">
          <Plus size={16} />
          Nouveau REX
        </button>
      </div>

      {/* Search */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par titre, reference ou chantier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Category filter */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <Filter size={14} className="text-text-muted mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
              selectedCategory === cat.value
                ? 'text-white shadow-sm'
                : 'bg-white text-text-secondary border border-border hover:border-primary/30'
            )}
            style={
              selectedCategory === cat.value
                ? { backgroundColor: cat.color }
                : {}
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-text-secondary">
        {filteredRex.length} retour{filteredRex.length > 1 ? 's' : ''} d&apos;experience
      </p>

      {/* REX List */}
      <div className="space-y-4 animate-stagger">
        {filteredRex.map((rex) => {
          const catConfig = getCategoryConfig(rex.category);
          const impactConfig = getImpactConfig(rex.impact);
          const gradient = getAvatarGradient(
            rex.author.first_name + rex.author.last_name
          );
          const initials = getInitials(
            rex.author.first_name,
            rex.author.last_name
          );
          const isExpanded = expandedId === rex.id;

          return (
            <div
              key={rex.id}
              className="card overflow-hidden hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-stretch">
                {/* Color bar */}
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: catConfig.color }}
                />

                <div className="flex-1 p-5">
                  {/* Header badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                      {rex.reference}
                    </span>
                    <span
                      className="badge text-white text-[10px]"
                      style={{ backgroundColor: catConfig.color }}
                    >
                      {catConfig.name}
                    </span>
                    <span
                      className={cn(
                        'badge text-[10px] gap-1',
                        impactConfig.color
                      )}
                    >
                      <Award size={9} />
                      {impactConfig.label}
                    </span>
                    {rex.has_photos && (
                      <span className="badge text-[10px] text-text-secondary bg-gray-100 gap-1">
                        <ImageIcon size={9} />
                        {rex.photo_count} photos
                      </span>
                    )}
                  </div>

                  {/* Title + Description */}
                  <h3
                    className="text-base font-bold text-text-primary hover:text-primary transition-colors cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : rex.id)
                    }
                  >
                    {rex.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {rex.description}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                      {/* Context */}
                      <div className="bg-gray-50 rounded-button p-4">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1.5">
                          Contexte
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {rex.context}
                        </p>
                      </div>

                      {/* Photo placeholders */}
                      {rex.has_photos && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {Array.from({ length: rex.photo_count }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-colors"
                              >
                                <ImageIcon
                                  size={20}
                                  className="text-gray-300"
                                />
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Lessons learned */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Positive */}
                        <div className="bg-emerald-50 rounded-button p-4 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp size={14} className="text-emerald-600" />
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                              Points positifs
                            </h4>
                          </div>
                          <ul className="space-y-1.5">
                            {rex.lessons_positive.map((lesson, i) => (
                              <li
                                key={i}
                                className="text-sm text-emerald-800 flex items-start gap-2"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Negative */}
                        <div className="bg-red-50 rounded-button p-4 border border-red-100">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsDown size={14} className="text-red-600" />
                            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide">
                              Axes d&apos;amelioration
                            </h4>
                          </div>
                          <ul className="space-y-1.5">
                            {rex.lessons_negative.map((lesson, i) => (
                              <li
                                key={i}
                                className="text-sm text-red-800 flex items-start gap-2"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50 rounded-button p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={14} className="text-blue-600" />
                          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                            Recommandations
                          </h4>
                        </div>
                        <p className="text-sm text-blue-800">
                          {rex.recommendations}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meta footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                        >
                          {initials}
                        </div>
                        <span className="text-xs text-text-secondary">
                          {rex.author.first_name} {rex.author.last_name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <MapPin size={11} />
                        {rex.chantier}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar size={11} />
                        {new Date(rex.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Eye size={12} />
                        {rex.views}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <MessageCircle size={12} />
                        {rex.comments}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : rex.id)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        {isExpanded ? 'Reduire' : 'Voir le detail'}
                        <ChevronRight
                          size={12}
                          className={cn(
                            'transition-transform duration-200',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRex.length === 0 && (
        <div className="text-center py-16">
          <Lightbulb size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Aucun retour d&apos;experience trouve pour ces criteres
          </p>
        </div>
      )}
    </div>
  );
}
