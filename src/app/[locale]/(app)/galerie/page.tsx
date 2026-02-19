'use client';

import { useState } from 'react';
import {
  Search,
  Image,
  Calendar,
  FolderOpen,
  Grid3X3,
  LayoutGrid,
  Camera,
  MapPin,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoAlbum {
  id: string;
  title: string;
  description: string;
  category: string;
  photo_count: number;
  date: string;
  location: string;
  gradient: string;
  cover_pattern: string;
}

const CATEGORIES = ['Tous', 'Chantiers', 'Événements', 'Équipe', 'Sécurité', 'Formations'];

const DEMO_ALBUMS: PhotoAlbum[] = [
  {
    id: '1',
    title: 'Chantier FTTH Mérignac - Phase 2',
    description: 'Déploiement fibre optique FTTH dans le secteur de Mérignac. Photos de l\'avancement des travaux de génie civil et tirage de câbles.',
    category: 'Chantiers',
    photo_count: 47,
    date: '2026-02-15',
    location: 'Mérignac (33)',
    gradient: 'from-blue-500 via-blue-600 to-indigo-700',
    cover_pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)',
  },
  {
    id: '2',
    title: 'Remplacement conduite Gaz - Talence',
    description: 'Travaux de remplacement de la conduite gaz DN150 en fonte grise par du PEHD. Chantier terminé.',
    category: 'Chantiers',
    photo_count: 32,
    date: '2026-02-10',
    location: 'Talence (33)',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    cover_pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)',
  },
  {
    id: '3',
    title: 'Galette des rois INNOVTEC 2026',
    description: 'Photos de la galette des rois organisée au siège de Bordeaux avec l\'ensemble des collaborateurs.',
    category: 'Événements',
    photo_count: 28,
    date: '2026-01-17',
    location: 'Siège Bordeaux',
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    cover_pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
  },
  {
    id: '4',
    title: 'Formation CACES Nacelle R486',
    description: 'Session de formation CACES Nacelle au centre AFPA. Photos des exercices pratiques sur nacelle articulée.',
    category: 'Formations',
    photo_count: 15,
    date: '2026-01-28',
    location: 'Centre AFPA Bordeaux',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    cover_pattern: 'radial-gradient(circle at 20% 60%, rgba(255,255,255,0.15) 0%, transparent 55%)',
  },
  {
    id: '5',
    title: 'Inspection sécurité chantier Pessac',
    description: 'Visite de sécurité mensuelle sur le chantier de renouvellement du réseau gaz de Pessac. Contrôle EPI et balisage.',
    category: 'Sécurité',
    photo_count: 22,
    date: '2026-02-05',
    location: 'Pessac (33)',
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    cover_pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)',
  },
  {
    id: '6',
    title: 'Chantier VRD Bègles - Démarrage',
    description: 'Lancement du chantier de voirie et réseaux divers. Installation de la base vie et premiers terrassements.',
    category: 'Chantiers',
    photo_count: 18,
    date: '2026-02-19',
    location: 'Bègles (33)',
    gradient: 'from-sky-500 via-blue-500 to-blue-700',
    cover_pattern: 'radial-gradient(circle at 40% 70%, rgba(255,255,255,0.12) 0%, transparent 65%)',
  },
  {
    id: '7',
    title: 'Séminaire équipes terrain Q4 2025',
    description: 'Photos du séminaire annuel des équipes terrain. Team building, présentations des projets et soirée de fin d\'année.',
    category: 'Équipe',
    photo_count: 64,
    date: '2025-12-15',
    location: 'Domaine de Raba, Talence',
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    cover_pattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: '8',
    title: 'Réception chantier Éclairage public Cenon',
    description: 'Photos de la réception des travaux d\'éclairage public LED. Mise en lumière nocturne du boulevard principal.',
    category: 'Chantiers',
    photo_count: 24,
    date: '2025-12-20',
    location: 'Cenon (33)',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    cover_pattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 45%)',
  },
  {
    id: '9',
    title: 'Exercice évacuation incendie',
    description: 'Exercice annuel d\'évacuation incendie au siège. Photos des équipes d\'intervention et du débriefing.',
    category: 'Sécurité',
    photo_count: 12,
    date: '2026-01-22',
    location: 'Siège Bordeaux',
    gradient: 'from-orange-500 via-red-500 to-red-700',
    cover_pattern: 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.1) 0%, transparent 55%)',
  },
  {
    id: '10',
    title: 'Accueil nouveaux collaborateurs Janvier',
    description: 'Photos de la journée d\'intégration des 4 nouveaux collaborateurs rejoignant INNOVTEC en janvier 2026.',
    category: 'Équipe',
    photo_count: 19,
    date: '2026-01-06',
    location: 'Siège Bordeaux',
    gradient: 'from-teal-400 via-emerald-500 to-green-600',
    cover_pattern: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
  },
  {
    id: '11',
    title: 'Chantier Aéroparc - Raccordement électrique',
    description: 'Raccordement électrique HTA/BT du nouveau bâtiment de l\'Aéroparc de Mérignac. Travaux en milieu aéroportuaire.',
    category: 'Chantiers',
    photo_count: 35,
    date: '2026-01-15',
    location: 'Aéroparc Mérignac (33)',
    gradient: 'from-slate-500 via-gray-600 to-zinc-700',
    cover_pattern: 'radial-gradient(circle at 25% 75%, rgba(255,255,255,0.12) 0%, transparent 50%)',
  },
  {
    id: '12',
    title: 'Formation SST - Premiers secours',
    description: 'Session de recyclage SST (Sauveteur Secouriste du Travail). Exercices pratiques de mise en situation.',
    category: 'Formations',
    photo_count: 20,
    date: '2025-11-25',
    location: 'Siège Bordeaux',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    cover_pattern: 'radial-gradient(circle at 45% 35%, rgba(255,255,255,0.15) 0%, transparent 55%)',
  },
];

export default function GaleriePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const filteredAlbums = DEMO_ALBUMS.filter((album) => {
    const matchesCategory = selectedCategory === 'Tous' || album.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-button">
            <Camera size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{DEMO_ALBUMS.reduce((s, a) => s + a.photo_count, 0)} photos</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un album, un chantier..."
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
              onClick={() => setViewMode('large')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors border-l border-border',
                viewMode === 'large' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      <div className={cn(
        'animate-stagger',
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      )}>
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Cover gradient */}
            <div
              className={cn(
                'relative overflow-hidden',
                viewMode === 'grid' ? 'h-40' : 'h-56'
              )}
            >
              <div
                className={cn('absolute inset-0 bg-gradient-to-br', album.gradient)}
              />
              <div
                className="absolute inset-0"
                style={{ background: album.cover_pattern }}
              />

              {/* Overlay icons pattern */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Image key={i} size={viewMode === 'grid' ? 20 : 28} className="text-white" />
                  ))}
                </div>
              </div>

              {/* Photo count badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                <Camera size={12} className="text-white" />
                <span className="text-xs font-semibold text-white">{album.photo_count}</span>
              </div>

              {/* Category badge */}
              <div className="absolute bottom-3 left-3">
                <span className="badge bg-white/90 backdrop-blur-sm text-text-primary text-[10px] font-semibold">
                  {album.category}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-white/90 rounded-button">
                  <Eye size={16} className="text-text-primary" />
                  <span className="text-sm font-semibold text-text-primary">Voir l&apos;album</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                {album.title}
              </h3>
              {viewMode === 'large' && (
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {album.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {album.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(album.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">Aucun album trouvé</p>
        </div>
      )}
    </div>
  );
}
