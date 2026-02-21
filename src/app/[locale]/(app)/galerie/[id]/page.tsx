'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Image, Camera, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { createGalleryPhoto } from '@/lib/actions';

export default function GalleryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gallery, loading: galleryLoading, error: galleryError } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('galleries')
        .select('*')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  const { data: photos, loading: photosLoading, refetch: refetchPhotos } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('gallery_photos')
        .select('*, uploader:profiles!gallery_photos_uploaded_by_fkey(*)')
        .eq('gallery_id', id)
        .order('created_at', { ascending: false }),
    [id],
  );

  const handleAddPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createGalleryPhoto({
        gallery_id: id,
        image_url: formData.get('image_url') as string,
        caption: (formData.get('caption') as string) || undefined,
      });
      toast('Photo ajoutée avec succès', 'success');
      setShowAddModal(false);
      refetchPhotos();
    } catch {
      toast("Erreur lors de l'ajout", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (galleryLoading || photosLoading) return <LoadingState />;
  if (galleryError || !gallery) return <ErrorState message="Album introuvable" />;

  const allPhotos = (photos || []) as Record<string, any>[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link href="/galerie" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        Galerie
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{gallery.title}</h1>
          {gallery.description && <p className="text-sm text-text-secondary mt-1">{gallery.description}</p>}
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <Camera size={12} />
            {allPhotos.length} photo{allPhotos.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Ajouter une photo
        </button>
      </div>

      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {allPhotos.map((photo) => (
            <div key={photo.id as string} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {photo.image_url ? (
                <img
                  src={photo.image_url as string}
                  alt={(photo.caption as string) || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image size={32} className="text-gray-300" />
                </div>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs text-white font-medium line-clamp-2">{photo.caption as string}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Aucune photo" description="Ajoutez des photos à cet album." />
      )}

      {/* Add Photo Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une photo">
        <form onSubmit={handleAddPhoto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">URL de l&apos;image *</label>
            <input name="image_url" required className="input w-full" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Légende</label>
            <input name="caption" className="input w-full" placeholder="Description de la photo..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
