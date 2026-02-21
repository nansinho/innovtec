'use client';

import { useState } from 'react';
import {
  Search,
  Image,
  Calendar,
  Grid3X3,
  LayoutGrid,
  Camera,
  Eye,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { createGallery } from '@/lib/actions';

const GRADIENTS = [
  'from-blue-500 via-blue-600 to-indigo-700',
  'from-amber-500 via-orange-500 to-red-500',
  'from-purple-500 via-purple-600 to-pink-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-red-500 via-rose-500 to-pink-500',
  'from-sky-500 via-blue-500 to-blue-700',
  'from-violet-500 via-purple-500 to-indigo-600',
  'from-yellow-400 via-amber-500 to-orange-600',
  'from-teal-400 via-emerald-500 to-green-600',
  'from-slate-500 via-gray-600 to-zinc-700',
];

function getGradient(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export default function GaleriePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: galleries, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('galleries')
        .select('*, photos:gallery_photos(count)')
        .order('created_at', { ascending: false }),
  );

  const allGalleries = (galleries || []) as Record<string, any>[];

  const filteredAlbums = allGalleries.filter((album) => {
    const title = (album.title as string) || '';
    const description = (album.description as string) || '';
    return (
      searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createGallery({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
      });
      toast('Album créé avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast("Erreur lors de la création", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Galerie photos</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredAlbums.length} album{filteredAlbums.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nouvel album
          </button>
        </div>
      </div>

      {/* Search + View Toggle */}
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
        <div className="flex rounded-button border border-border overflow-hidden">
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

      {/* Albums Grid */}
      {filteredAlbums.length > 0 ? (
        <div className={cn(
          'animate-stagger',
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        )}>
          {filteredAlbums.map((album, index) => {
            const photos = album.photos as { count: number }[] | null;
            const photoCount = photos?.[0]?.count || 0;
            const gradient = getGradient(index);

            return (
              <Link key={album.id as string} href={`/galerie/${album.id}`}>
                <div className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  {/* Cover gradient */}
                  <div className={cn('relative overflow-hidden', viewMode === 'grid' ? 'h-40' : 'h-56')}>
                    <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <Image key={i} size={viewMode === 'grid' ? 20 : 28} className="text-white" />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                      <Camera size={12} className="text-white" />
                      <span className="text-xs font-semibold text-white">{photoCount}</span>
                    </div>
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
                      {album.title as string}
                    </h3>
                    {viewMode === 'large' && album.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {album.description as string}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {album.created_at
                          ? new Date(album.created_at as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Aucun album trouvé" description="Créez votre premier album en cliquant sur le bouton ci-dessus." />
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvel album">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Nom de l'album" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Description de l'album..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Création...' : "Créer l'album"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
