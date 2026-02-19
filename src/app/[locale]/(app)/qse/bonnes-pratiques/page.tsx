'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  ThumbsUp,
  Eye,
  Calendar,
  Filter,
  Image as ImageIcon,
  Bookmark,
  Tag,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

// --- Types ---
interface BonnePratique {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: { first_name: string; last_name: string };
  published_at: string;
  views: number;
  likes: number;
  has_image: boolean;
}

// --- Demo Data ---
const CATEGORIES = [
  { name: 'Toutes', value: 'all', color: '#0052CC' },
  { name: 'Securite Chantier', value: 'securite_chantier', color: '#FF5630' },
  { name: 'Gestes et Postures', value: 'gestes_postures', color: '#FF6B35' },
  { name: 'Environnement', value: 'environnement', color: '#36B37E' },
  { name: 'Outillage', value: 'outillage', color: '#0052CC' },
  { name: 'Communication', value: 'communication', color: '#6B21A8' },
];

const DEMO_PRATIQUES: BonnePratique[] = [
  {
    id: '1',
    title: 'Balisage de tranchee : les 5 regles d\'or',
    description:
      'Guide complet pour le balisage reglementaire des tranchees en milieu urbain. Retrouvez les 5 regles essentielles pour securiser la zone de travaux et proteger les passants et le personnel.',
    category: 'securite_chantier',
    tags: ['Tranchee', 'Balisage', 'Voirie'],
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
    published_at: '2025-11-20',
    views: 234,
    likes: 45,
    has_image: true,
  },
  {
    id: '2',
    title: 'Port de charge : les bons reflexes pour eviter les TMS',
    description:
      'Techniques de manutention manuelle pour le transport de tourets de cable et d\'equipements lourds. Postures a adopter et limites de poids reglementaires.',
    category: 'gestes_postures',
    tags: ['Manutention', 'TMS', 'Ergonomie'],
    author: { first_name: 'Sophie', last_name: 'Martin' },
    published_at: '2025-10-15',
    views: 189,
    likes: 38,
    has_image: true,
  },
  {
    id: '3',
    title: 'Tri des dechets de chantier : guide pratique',
    description:
      'Comment trier efficacement les dechets de chantier (bois, metaux, plastiques, gravats) selon les fillieres de recyclage. Points de collecte et bordereaux de suivi.',
    category: 'environnement',
    tags: ['Dechets', 'Recyclage', 'Chantier propre'],
    author: { first_name: 'Claire', last_name: 'Petit' },
    published_at: '2025-09-28',
    views: 156,
    likes: 29,
    has_image: true,
  },
  {
    id: '4',
    title: 'Verification des EPI avant chaque intervention',
    description:
      'Check-list complete de verification des equipements de protection individuelle : casque, harnais, gants isolants, lunettes. Points de controle et criteres de remplacement.',
    category: 'securite_chantier',
    tags: ['EPI', 'Check-list', 'Controle'],
    author: { first_name: 'Maria', last_name: 'Silva' },
    published_at: '2025-09-10',
    views: 312,
    likes: 67,
    has_image: true,
  },
  {
    id: '5',
    title: 'Utilisation securisee de la mini-pelle',
    description:
      'Bonnes pratiques pour l\'utilisation de la mini-pelle en milieu urbain. Verification des reseaux enterres, distances de securite et communication avec le guide au sol.',
    category: 'outillage',
    tags: ['Mini-pelle', 'Engins', 'CACES'],
    author: { first_name: 'Jean', last_name: 'Dupont' },
    published_at: '2025-08-22',
    views: 178,
    likes: 41,
    has_image: true,
  },
  {
    id: '6',
    title: 'Quart d\'heure securite : comment le rendre efficace',
    description:
      'Conseils pour animer un quart d\'heure securite impactant. Themes, supports visuels, participation active de l\'equipe et suivi des actions decidees.',
    category: 'communication',
    tags: ['Quart d\'heure', 'Animation', 'Equipe'],
    author: { first_name: 'Thomas', last_name: 'Ferreira' },
    published_at: '2025-08-05',
    views: 267,
    likes: 53,
    has_image: false,
  },
  {
    id: '7',
    title: 'Protection des reseaux existants lors des fouilles',
    description:
      'Procedures de protection des reseaux eau, gaz et electricite lors des operations de terrassement. Distances de securite, techniques de degagement manuel et signalisation.',
    category: 'securite_chantier',
    tags: ['Reseaux', 'Fouille', 'DICT'],
    author: { first_name: 'Miguel', last_name: 'Rodrigues' },
    published_at: '2025-07-18',
    views: 198,
    likes: 36,
    has_image: true,
  },
  {
    id: '8',
    title: 'Limiter les nuisances sonores en zone habitee',
    description:
      'Horaires reglementaires, choix des equipements moins bruyants et communication avec le voisinage. Mesures de reduction du bruit sur les chantiers en milieu residentiel.',
    category: 'environnement',
    tags: ['Bruit', 'Voisinage', 'Reglementation'],
    author: { first_name: 'Claire', last_name: 'Petit' },
    published_at: '2025-07-01',
    views: 124,
    likes: 22,
    has_image: false,
  },
  {
    id: '9',
    title: 'Rangement et organisation du vehicule atelier',
    description:
      'Comment organiser efficacement son vehicule atelier pour gagner du temps et reduire les risques. Systeme de rangement, inventaire du materiel et check-list quotidienne.',
    category: 'outillage',
    tags: ['Vehicule', 'Organisation', 'Materiel'],
    author: { first_name: 'Carlos', last_name: 'Santos' },
    published_at: '2025-06-15',
    views: 145,
    likes: 31,
    has_image: true,
  },
];

// --- Helpers ---
function getCategoryConfig(value: string) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];
}

// --- Component ---
export default function BonnesPratiquesPage() {
  const t = useTranslations('qse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPratiques = DEMO_PRATIQUES.filter((bp) => {
    const matchesCategory =
      selectedCategory === 'all' || bp.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-accent/10">
              <BookOpen size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Bonnes Pratiques
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Partagez et consultez les bonnes pratiques terrain
              </p>
            </div>
          </div>
        </div>
        <button className="btn-accent flex items-center gap-2 w-fit">
          <Plus size={16} />
          Partager une pratique
        </button>
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par titre, description ou tag..."
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

      {/* Results count */}
      <p className="text-sm text-text-secondary">
        {filteredPratiques.length} article{filteredPratiques.length > 1 ? 's' : ''} trouve{filteredPratiques.length > 1 ? 's' : ''}
      </p>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
        {filteredPratiques.map((bp) => {
          const catConfig = getCategoryConfig(bp.category);
          const gradient = getAvatarGradient(
            bp.author.first_name + bp.author.last_name
          );
          const initials = getInitials(bp.author.first_name, bp.author.last_name);

          return (
            <article
              key={bp.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Image placeholder */}
              {bp.has_image ? (
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-300" />
                  <div className="absolute top-3 right-3">
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-text-secondary hover:text-primary transition-colors shadow-sm">
                      <Bookmark size={13} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="badge text-white text-[10px] shadow-sm"
                      style={{ backgroundColor: catConfig.color }}
                    >
                      {catConfig.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-2"
                  style={{ backgroundColor: catConfig.color }}
                />
              )}

              <div className="p-5">
                {!bp.has_image && (
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="badge text-white text-[10px]"
                      style={{ backgroundColor: catConfig.color }}
                    >
                      {catConfig.name}
                    </span>
                  </div>
                )}

                <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {bp.title}
                </h2>

                <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                  {bp.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {bp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-text-secondary text-[10px] rounded-full font-medium"
                    >
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}
                    >
                      {initials}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-text-secondary">
                        {bp.author.first_name} {bp.author.last_name}
                      </span>
                      <span className="text-[10px] text-text-muted ml-2 hidden sm:inline">
                        <Calendar size={9} className="inline mr-0.5" />
                        {new Date(bp.published_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {bp.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} />
                      {bp.likes}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPratiques.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Aucune bonne pratique trouvee pour ces criteres
          </p>
        </div>
      )}
    </div>
  );
}
