'use client';

import { useTranslations } from 'next-intl';
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

type FileType = 'pdf' | 'word' | 'excel' | 'image' | 'other';
type SortField = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

interface Document {
  id: string;
  name: string;
  type: FileType;
  size: string;
  size_bytes: number;
  date: string;
  uploader: { first_name: string; last_name: string };
  category: string;
  description: string;
}

const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: typeof FileText; color: string; bg: string; extensions: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'text-red-600', bg: 'bg-red-50', extensions: '.pdf' },
  word: { label: 'Word', icon: File, color: 'text-blue-600', bg: 'bg-blue-50', extensions: '.docx' },
  excel: { label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50', extensions: '.xlsx' },
  image: { label: 'Image', icon: Image, color: 'text-purple-600', bg: 'bg-purple-50', extensions: '.jpg/.png' },
  other: { label: 'Autre', icon: FolderOpen, color: 'text-gray-600', bg: 'bg-gray-50', extensions: '' },
};

const TYPE_FILTERS = ['Tous', 'PDF', 'Word', 'Excel', 'Image'];

const DEMO_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'PPSPS_Chantier_Merignac_FTTH_v3.pdf',
    type: 'pdf',
    size: '2.4 Mo',
    size_bytes: 2516582,
    date: '2026-02-18',
    uploader: { first_name: 'Maria', last_name: 'Silva' },
    category: 'QSE',
    description: 'Plan Particulier de Sécurité et de Protection de la Santé - Version finale',
  },
  {
    id: '2',
    name: 'DOE_Talence_Gaz_DN150_Complet.pdf',
    type: 'pdf',
    size: '15.8 Mo',
    size_bytes: 16567500,
    date: '2026-02-17',
    uploader: { first_name: 'Pierre', last_name: 'Oliveira' },
    category: 'Travaux',
    description: 'Dossier des Ouvrages Exécutés - Chantier remplacement conduite gaz Talence',
  },
  {
    id: '3',
    name: 'Planning_Formations_Q1_2026.xlsx',
    type: 'excel',
    size: '345 Ko',
    size_bytes: 353280,
    date: '2026-02-15',
    uploader: { first_name: 'Lucie', last_name: 'Moreau' },
    category: 'RH',
    description: 'Calendrier complet des formations du premier trimestre 2026',
  },
  {
    id: '4',
    name: 'Rapport_Inspection_Securite_Pessac_022026.pdf',
    type: 'pdf',
    size: '1.2 Mo',
    size_bytes: 1258291,
    date: '2026-02-14',
    uploader: { first_name: 'Maria', last_name: 'Silva' },
    category: 'QSE',
    description: 'Rapport d\'inspection sécurité mensuelle - Chantier Pessac Gaz',
  },
  {
    id: '5',
    name: 'Contrat_Sous_Traitance_STE_Reseaux.docx',
    type: 'word',
    size: '890 Ko',
    size_bytes: 911360,
    date: '2026-02-13',
    uploader: { first_name: 'Nicolas', last_name: 'Bernard' },
    category: 'Direction',
    description: 'Contrat cadre de sous-traitance avec STE Réseaux pour le chantier Mérignac FTTH',
  },
  {
    id: '6',
    name: 'Photo_Avancement_Merignac_Lot3_15022026.jpg',
    type: 'image',
    size: '4.7 Mo',
    size_bytes: 4928307,
    date: '2026-02-15',
    uploader: { first_name: 'Jean', last_name: 'Dupont' },
    category: 'Travaux',
    description: 'Photo d\'avancement du chantier - Tranchée fibre optique secteur 3',
  },
  {
    id: '7',
    name: 'Suivi_Heures_Equipes_Fevrier_2026.xlsx',
    type: 'excel',
    size: '567 Ko',
    size_bytes: 580608,
    date: '2026-02-12',
    uploader: { first_name: 'Ana', last_name: 'Costa' },
    category: 'Administration',
    description: 'Tableau de suivi des heures des équipes terrain pour février 2026',
  },
  {
    id: '8',
    name: 'PV_Reception_Eclairage_Cenon.pdf',
    type: 'pdf',
    size: '3.1 Mo',
    size_bytes: 3250585,
    date: '2026-02-10',
    uploader: { first_name: 'Pierre', last_name: 'Oliveira' },
    category: 'Travaux',
    description: 'Procès-verbal de réception des travaux d\'éclairage public LED - Cenon',
  },
  {
    id: '9',
    name: 'Note_Frais_Chantier_Janvier_2026.xlsx',
    type: 'excel',
    size: '234 Ko',
    size_bytes: 239616,
    date: '2026-02-08',
    uploader: { first_name: 'Isabelle', last_name: 'Dubois' },
    category: 'Administration',
    description: 'Synthèse des notes de frais terrain pour janvier 2026',
  },
  {
    id: '10',
    name: 'Plan_Execution_VRD_Begles.pdf',
    type: 'pdf',
    size: '8.5 Mo',
    size_bytes: 8912896,
    date: '2026-02-19',
    uploader: { first_name: 'Pierre', last_name: 'Oliveira' },
    category: 'Bureau d\'études',
    description: 'Plan d\'exécution voirie et réseaux divers - Chantier Bègles',
  },
  {
    id: '11',
    name: 'Attestation_CACES_R486_Rodrigues.pdf',
    type: 'pdf',
    size: '456 Ko',
    size_bytes: 466944,
    date: '2026-02-06',
    uploader: { first_name: 'Lucie', last_name: 'Moreau' },
    category: 'RH',
    description: 'Attestation de formation CACES Nacelle R486 - Miguel Rodrigues',
  },
  {
    id: '12',
    name: 'Organigramme_INNOVTEC_2026.docx',
    type: 'word',
    size: '1.8 Mo',
    size_bytes: 1887436,
    date: '2026-02-03',
    uploader: { first_name: 'Sophie', last_name: 'Martin' },
    category: 'RH',
    description: 'Organigramme de l\'entreprise mis à jour pour 2026',
  },
  {
    id: '13',
    name: 'Photo_Equipe_Seminaire_2025.jpg',
    type: 'image',
    size: '6.2 Mo',
    size_bytes: 6501171,
    date: '2025-12-16',
    uploader: { first_name: 'Ana', last_name: 'Costa' },
    category: 'Communication',
    description: 'Photo de groupe du séminaire annuel des équipes terrain 2025',
  },
  {
    id: '14',
    name: 'Procedure_Consignation_Electrique_v2.docx',
    type: 'word',
    size: '1.1 Mo',
    size_bytes: 1153434,
    date: '2026-01-20',
    uploader: { first_name: 'Maria', last_name: 'Silva' },
    category: 'QSE',
    description: 'Procédure de consignation électrique mise à jour - Version 2',
  },
];

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredDocuments = DEMO_DOCUMENTS
    .filter((doc) => {
      const matchesType =
        selectedType === 'Tous' ||
        FILE_TYPE_CONFIG[doc.type].label === selectedType;
      const matchesSearch =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${doc.uploader.first_name} ${doc.uploader.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'size':
          cmp = a.size_bytes - b.size_bytes;
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

  const totalSize = filteredDocuments.reduce((sum, doc) => sum + doc.size_bytes, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

  const typeStats = Object.entries(FILE_TYPE_CONFIG).map(([key, config]) => ({
    type: key as FileType,
    ...config,
    count: DEMO_DOCUMENTS.filter(d => d.type === key).length,
  }));

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
        <button className="btn-primary flex items-center gap-2 w-fit">
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
      {viewMode === 'list' && (
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wide">
            <div className="col-span-5 flex items-center gap-1 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('name')}>
              Nom du fichier
              {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
            </div>
            <div className="col-span-2">Catégorie</div>
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
              const typeConfig = FILE_TYPE_CONFIG[doc.type];
              const TypeIcon = typeConfig.icon;
              const gradient = getAvatarGradient(doc.uploader.first_name + doc.uploader.last_name);
              const initials = getInitials(doc.uploader.first_name, doc.uploader.last_name);

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
                        {doc.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">{doc.description}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="badge bg-gray-100 text-text-secondary text-[10px]">{doc.category}</span>
                  </div>
                  <div className="col-span-1 text-xs text-text-secondary flex items-center gap-1">
                    <HardDrive size={12} className="text-text-muted" />
                    {doc.size}
                  </div>
                  <div className="col-span-2 text-xs text-text-secondary flex items-center gap-1">
                    <Clock size={12} className="text-text-muted" />
                    {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                        {initials}
                      </div>
                      <span className="text-xs text-text-secondary truncate">
                        {doc.uploader.first_name} {doc.uploader.last_name.charAt(0)}.
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
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
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
          {filteredDocuments.map((doc) => {
            const typeConfig = FILE_TYPE_CONFIG[doc.type];
            const TypeIcon = typeConfig.icon;
            const gradient = getAvatarGradient(doc.uploader.first_name + doc.uploader.last_name);
            const initials = getInitials(doc.uploader.first_name, doc.uploader.last_name);

            return (
              <div
                key={doc.id}
                className="card group p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {/* File icon */}
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl mb-3', typeConfig.bg)}>
                  <TypeIcon size={24} className={typeConfig.color} />
                </div>

                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {doc.name}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {doc.description}
                </p>

                <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <HardDrive size={11} />
                    {doc.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[9px] font-bold text-white`}>
                      {initials}
                    </div>
                    <span className="text-xs text-text-muted">
                      {doc.uploader.first_name} {doc.uploader.last_name.charAt(0)}.
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

      {filteredDocuments.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">Aucun document trouvé</p>
          <p className="text-text-muted text-xs mt-1">Essayez de modifier vos filtres de recherche</p>
        </div>
      )}
    </div>
  );
}
