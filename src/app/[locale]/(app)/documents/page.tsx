'use client';

import { useState } from 'react';
import {
  Search,
  FileText,
  File,
  FileSpreadsheet,
  Image,
  FolderOpen,
  Download,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  Upload,
  Clock,
  HardDrive,
  Grid3X3,
  List,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { createDocument } from '@/lib/actions';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';

type FileType = 'pdf' | 'word' | 'excel' | 'image' | 'other';
type SortField = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: typeof FileText; color: string; bg: string; extensions: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'text-red-600', bg: 'bg-red-50', extensions: '.pdf' },
  word: { label: 'Word', icon: File, color: 'text-blue-600', bg: 'bg-blue-50', extensions: '.docx' },
  excel: { label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50', extensions: '.xlsx' },
  image: { label: 'Image', icon: Image, color: 'text-purple-600', bg: 'bg-purple-50', extensions: '.jpg/.png' },
  other: { label: 'Autre', icon: FolderOpen, color: 'text-gray-600', bg: 'bg-gray-50', extensions: '' },
};

const TYPE_FILTERS = ['Tous', 'PDF', 'Word', 'Excel', 'Image'];

function resolveFileType(fileType: string | null | undefined): FileType {
  if (!fileType) return 'other';
  const t = fileType.toLowerCase();
  if (t.includes('pdf')) return 'pdf';
  if (t.includes('word') || t.includes('doc') || t.includes('docx')) return 'word';
  if (t.includes('excel') || t.includes('sheet') || t.includes('xls') || t.includes('csv')) return 'excel';
  if (t.includes('image') || t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('gif') || t.includes('webp') || t.includes('svg')) return 'image';
  return 'other';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 Ko';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: documents, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('documents')
        .select('*, uploader:profiles!documents_uploaded_by_fkey(*)')
        .order('created_at', { ascending: false }),
  );

  const allDocuments = ((documents || []) as Record<string, any>[]).map((doc) => {
    const fileType = resolveFileType(doc.file_type as string | null);
    const uploader = doc.uploader as { first_name: string; last_name: string } | null;
    return {
      id: doc.id as string,
      title: (doc.title as string) || '',
      description: (doc.description as string) || '',
      file_url: (doc.file_url as string) || '',
      file_name: (doc.file_name as string) || '',
      file_size: (doc.file_size as number) || 0,
      file_type: fileType,
      status: (doc.status as string) || 'brouillon',
      created_at: (doc.created_at as string) || '',
      uploader: {
        first_name: uploader?.first_name || '',
        last_name: uploader?.last_name || '',
      },
    };
  });

  const filteredDocuments = allDocuments
    .filter((doc) => {
      const matchesType =
        selectedType === 'Tous' ||
        FILE_TYPE_CONFIG[doc.file_type].label === selectedType;
      const matchesSearch =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${doc.uploader.first_name} ${doc.uploader.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'date':
          cmp = a.created_at.localeCompare(b.created_at);
          break;
        case 'size':
          cmp = a.file_size - b.file_size;
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  const totalSize = filteredDocuments.reduce((sum, doc) => sum + doc.file_size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

  const typeStats = Object.entries(FILE_TYPE_CONFIG).map(([key, config]) => ({
    type: key as FileType,
    ...config,
    count: allDocuments.filter((d) => d.file_type === key).length,
  }));

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createDocument({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        file_url: formData.get('file_url') as string,
        file_name: formData.get('file_name') as string,
        file_type: (formData.get('file_type') as string) || undefined,
      });
      toast('Document importé avec succès', 'success');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast('Erreur lors de l\'import du document', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleView = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) return <LoadingState message="Chargement des documents..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} - {totalSizeMB} Mo
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Upload size={16} />
          Importer un document
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {typeStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.type}
              onClick={() => setSelectedType(stat.count > 0 ? stat.label : 'Tous')}
              className={cn(
                'card p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-card-hover',
                selectedType === stat.label && 'ring-2 ring-primary'
              )}
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', stat.bg)}>
                <Icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{stat.count}</p>
                <p className="text-[10px] text-text-muted uppercase font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un document, un auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input w-auto"
          >
            {TYPE_FILTERS.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="flex rounded-button border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors border-l border-border',
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && filteredDocuments.length > 0 && (
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wide">
            <div className="col-span-5 flex items-center gap-1 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('name')}>
              Nom du fichier
              {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
            </div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('size')}>
              Taille
              {sortField === 'size' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
            </div>
            <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('date')}>
              Date
              {sortField === 'date' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
            </div>
            <div className="col-span-2">Déposé par</div>
          </div>

          {/* Table body */}
          <div className="divide-y divide-border-light">
            {filteredDocuments.map((doc) => {
              const typeConfig = FILE_TYPE_CONFIG[doc.file_type];
              const TypeIcon = typeConfig.icon;
              const gradient = getAvatarGradient(doc.uploader.first_name + doc.uploader.last_name);
              const initials = doc.uploader.first_name && doc.uploader.last_name
                ? getInitials(doc.uploader.first_name, doc.uploader.last_name)
                : '?';

              const STATUS_LABELS: Record<string, { label: string; className: string }> = {
                brouillon: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600' },
                en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-600' },
                signe: { label: 'Signé', className: 'bg-emerald-50 text-emerald-600' },
                refuse: { label: 'Refusé', className: 'bg-red-50 text-red-600' },
                archive: { label: 'Archivé', className: 'bg-blue-50 text-blue-600' },
              };
              const statusInfo = STATUS_LABELS[doc.status] || STATUS_LABELS.brouillon;

              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer group items-center"
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', typeConfig.bg)}>
                      <TypeIcon size={18} className={typeConfig.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                        {doc.title || doc.file_name}
                      </p>
                      <p className="text-xs text-text-muted truncate">{doc.description}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={cn('badge text-[10px]', statusInfo.className)}>{statusInfo.label}</span>
                  </div>
                  <div className="col-span-1 text-xs text-text-secondary flex items-center gap-1">
                    <HardDrive size={12} className="text-text-muted" />
                    {formatFileSize(doc.file_size)}
                  </div>
                  <div className="col-span-2 text-xs text-text-secondary flex items-center gap-1">
                    <Clock size={12} className="text-text-muted" />
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                        {initials}
                      </div>
                      <span className="text-xs text-text-secondary truncate">
                        {doc.uploader.first_name} {doc.uploader.last_name ? doc.uploader.last_name.charAt(0) + '.' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleView(doc.file_url); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc.file_url, doc.file_name); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
          {filteredDocuments.map((doc) => {
            const typeConfig = FILE_TYPE_CONFIG[doc.file_type];
            const TypeIcon = typeConfig.icon;
            const gradient = getAvatarGradient(doc.uploader.first_name + doc.uploader.last_name);
            const initials = doc.uploader.first_name && doc.uploader.last_name
              ? getInitials(doc.uploader.first_name, doc.uploader.last_name)
              : '?';

            return (
              <div
                key={doc.id}
                className="card group p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {/* File icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', typeConfig.bg)}>
                    <TypeIcon size={24} className={typeConfig.color} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleView(doc.file_url); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(doc.file_url, doc.file_name); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {doc.title || doc.file_name}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {doc.description}
                </p>

                <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <HardDrive size={11} />
                    {formatFileSize(doc.file_size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                      {initials}
                    </div>
                    <span className="text-xs text-text-muted">
                      {doc.uploader.first_name} {doc.uploader.last_name ? doc.uploader.last_name.charAt(0) + '.' : ''}
                    </span>
                  </div>
                  <span className="badge bg-gray-100 text-text-secondary text-[10px]">
                    {typeConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <EmptyState
          message="Aucun document trouvé"
          description="Importez votre premier document en cliquant sur le bouton ci-dessus, ou modifiez vos filtres de recherche."
        />
      )}

      {/* Create/Import Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Importer un document" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
            <input name="title" required className="input w-full" placeholder="Titre du document" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" placeholder="Description du document..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">URL du fichier *</label>
            <input name="file_url" required type="url" className="input w-full" placeholder="https://exemple.com/fichier.pdf" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nom du fichier *</label>
              <input name="file_name" required className="input w-full" placeholder="rapport.pdf" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type de fichier</label>
              <select name="file_type" className="input w-full">
                <option value="">-- Sélectionner --</option>
                <option value="application/pdf">PDF</option>
                <option value="application/msword">Word</option>
                <option value="application/vnd.ms-excel">Excel</option>
                <option value="image/jpeg">Image (JPEG)</option>
                <option value="image/png">Image (PNG)</option>
                <option value="text/csv">CSV</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Import en cours...' : 'Importer le document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
