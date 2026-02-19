'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Camera,
  Image,
  Calendar,
  FolderOpen,
  Grid3X3,
  LayoutList,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Album {
  id: string;
  title: string;
  description: string;
  category: string;
  photo_count: number;
  date: string;
  gradient: string;
  author: string;
}

const CATEGORIES = ['Tous', 'Chantiers', 'Événements', 'Équipe', 'Sécurité', 'Formations'];

const ALBUM_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-indigo-500 to-purple-600',
  'from-lime-500 to-emerald-500',
  'from-sky-500 to-indigo-500',
  'from-fuchsia-500 to-purple-600',
];

const DEMO_ALBUMS: Album[] = [
  {
    id: '1',
    title: 'Chantier FTTH Mérignac - Phase 1',
    description: 'Documentation photographique du déploiement fibre optique secteur Mérignac centre. Travaux de génie civil et tirage de câble.',
    category: 'Chantiers',
    photo_count: 47,
    date: '2026-02-15',
    gradient: ALBUM_GRADIENTS[0],
    author: 'Pierre Oliveira',
  },
  {
    id: '2',
    title: 'Voeux INNOVTEC 2026',
    description: 'Cérémonie des voeux du nouvel an au siège de Bordeaux. Discours de la direction et cocktail convivial.',
    category: 'Événements',
    photo_count: 32,
    date: '2026-01-15',
    gradient: ALBUM_GRADIENTS[1],
    author: 'Ana Costa',
  },
  {
    id: '3',
    title: 'Remplacement conduite Gaz - Talence',
    description: 'Suivi photographique des travaux de remplacement de la conduite gaz DN150 rue de la République.',
    category: 'Chantiers',
    photo_count: 65,
    date: '2026-02-10',
    gradient: ALBUM_GRADIENTS[2],
    author: 'Jean Dupont',
  },
  {
    id: '4',
    title: 'Formation SST - Janvier 2026',
    description: 'Session de formation Sauveteur Secouriste du Travail. Exercices pratiques et mise en situation.',
    category: 'Formations',
    photo_count: 18,
    date: '2026-01-28',
    gradient: ALBUM_GRADIENTS[3],
    author: 'Lucie Moreau',
  },
  {
    id: '5',
    title: 'Audit sécurité chantiers Q1',
    description: 'Photos des audits sécurité réalisés sur les chantiers en cours. Points de conformité et non-conformités identifiées.',
    category: 'Sécurité',
    photo_count: 24,
    date: '2026-02-05',
    gradient: ALBUM_GRADIENTS[4],
    author: 'Maria Silva',
  },
  {
    id: '6',
    title: 'Team Building - Parcours accrobranche',
    description: 'Journée de cohésion d\'équipe au parc aventure de Pessac. Parcours dans les arbres et défis collectifs.',
    category: 'Équipe',
    photo_count: 56,
    date: '2025-12-12',
    gradient: ALBUM_GRADIENTS[5],
    author: 'Ana Costa',
  },
  {
    id: '7',
    title: 'Chantier VRD Bègles - Démarrage',
    description: 'Photos du démarrage des travaux de voirie et réseaux divers. Installation de chantier et premiers terrassements.',
    category: 'Chantiers',
    photo_count: 12,
    date: '2026-02-18',
    gradient: ALBUM_GRADIENTS[6],
    author: 'Pierre Oliveira',
  },
  {
    id: '8',
    title: 'Réception chantier Pessac Eau',
    description: 'Photos de réception des travaux de renouvellement de la canalisation d\'eau potable. État final et remise en état de la voirie.',
    category: 'Chantiers',
    photo_count: 28,
    date: '2026-01-30',
    gradient: ALBUM_GRADIENTS[7],
    author: 'Jean Dupont',
  },
  {
    id: '9',
    title: 'Matinée sécurité - Quart d\'heure sécurité',
    description: 'Documentation des sessions de sensibilisation sécurité sur les différents chantiers en cours.',
    category: 'Sécurité',
    photo_count: 15,
    date: '2026-02-03',
    gradient: ALBUM_GRADIENTS[8],
    author: 'Claire Petit',
  },
  {
    id: '10',
    title: 'Nouvel arrivant - Intégration février',
    description: 'Accueil et intégration des nouveaux collaborateurs. Visite du siège et présentation des équipes.',
    category: 'Équipe',
    photo_count: 8,
    date: '2026-02-03',
    gradient: ALBUM_GRADIENTS[9],
    author: 'Sophie Martin',
  },
  {
    id: '11',
    title: 'Chantier éclairage public - Floirac',
    description: 'Installation de nouveaux candélabres LED. Travaux de câblage souterrain et mise en service.',
    category: 'Chantiers',
    photo_count: 34,
    date: '2025-12-20',
    gradient: ALBUM_GRADIENTS[10],
    author: 'Thomas Ferreira',
  },
  {
    id: '12',
    title: 'Formation CACES R486 - Pratique',
    description: 'Session de formation pratique CACES Nacelle. Exercices de conduite et manoeuvres en hauteur.',
    category: 'Formations',
    photo_count: 22,
    date: '2026-01-22',
    gradient: ALBUM_GRADIENTS[11],
    author: 'Lucie Moreau',
  },
];

export default function GaleriePage() {
  const t = useTranslations('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAlbums = DEMO_ALBUMS.filter((album) => {
    const matchesSearch =
      searchQuery === '' ||
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || album.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPhotos = filteredAlbums.reduce((sum, album) => sum + album.photo_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Galerie photos</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredAlbums.length} album{filteredAlbums.length > 1 ? 's' : ''} - {totalPhotos} photos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-button">
            <Camera size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{DEMO_ALBUMS.length} albums</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border hover:border-primary/30'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex rounded-button border border-border overflow-hidden ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors border-l border-border',
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <LayoutList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Gradient placeholder image */}
              <div className={cn('relative h-44 bg-gradient-to-br', album.gradient)}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image size={40} className="text-white/60" />
                </div>
                {/* Photo count badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 text-white rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Camera size={12} />
                  {album.photo_count} photos
                </div>
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="badge bg-white/90 text-text-primary backdrop-blur-sm text-[10px]">
                    {album.category}
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 bg-white rounded-button px-4 py-2 shadow-lg">
                    <Eye size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">Voir l&apos;album</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {album.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {album.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border-light">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(album.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-xs text-text-muted">
                    {album.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-5 p-4">
                {/* Gradient thumbnail */}
                <div className={cn('relative h-20 w-28 rounded-lg bg-gradient-to-br shrink-0 overflow-hidden', album.gradient)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image size={24} className="text-white/60" />
                  </div>
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/50 text-white rounded-full px-2 py-0.5 text-[10px] font-medium">
                    <Camera size={10} />
                    {album.photo_count}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                        {album.description}
                      </p>
                    </div>
                    <span className="badge bg-gray-100 text-text-secondary shrink-0 text-[10px]">
                      {album.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(album.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>Par {album.author}</span>
                    <span className="flex items-center gap-1">
                      <Camera size={12} />
                      {album.photo_count} photos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAlbums.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">Aucun album trouvé</p>
        </div>
      )}
    </div>
  );
}
