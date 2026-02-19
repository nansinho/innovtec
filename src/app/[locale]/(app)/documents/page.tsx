'use client';

import { useState } from 'react';
import { Search, Upload, FileText, FileSpreadsheet, Image, File, Download, Calendar, User, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocItem {
  id: string;
  title: string;
  file_name: string;
  file_type: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  file_size: string;
  uploaded_by: string;
  created_at: string;
  category: string;
}

const FILE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  pdf: { icon: <FileText size={20} />, color: 'text-red-500 bg-red-50' },
  word: { icon: <FileText size={20} />, color: 'text-blue-500 bg-blue-50' },
  excel: { icon: <FileSpreadsheet size={20} />, color: 'text-emerald-500 bg-emerald-50' },
  image: { icon: <Image size={20} />, color: 'text-purple-500 bg-purple-50' },
  other: { icon: <File size={20} />, color: 'text-gray-500 bg-gray-50' },
};

const DEMO_DOCS: DocItem[] = [
  { id: '1', title: 'Politique QSE 2025', file_name: 'politique_qse_2025.pdf', file_type: 'pdf', file_size: '2.4 MB', uploaded_by: 'Maria Silva', created_at: '2025-01-10', category: 'QSE' },
  { id: '2', title: 'Plan de prévention chantier #42', file_name: 'PDP_chantier_42.pdf', file_type: 'pdf', file_size: '1.8 MB', uploaded_by: 'Jean Dupont', created_at: '2025-01-08', category: 'Sécurité' },
  { id: '3', title: 'Tableau suivi formations Q1', file_name: 'suivi_formations_Q1.xlsx', file_type: 'excel', file_size: '450 KB', uploaded_by: 'Lucie Moreau', created_at: '2025-01-06', category: 'RH' },
  { id: '4', title: 'Procédure de consignation v3', file_name: 'procedure_consignation_v3.docx', file_type: 'word', file_size: '890 KB', uploaded_by: 'Maria Silva', created_at: '2025-01-04', category: 'QSE' },
  { id: '5', title: 'Photos chantier Mérignac - Lot 3', file_name: 'photos_merignac_lot3.zip', file_type: 'image', file_size: '45.2 MB', uploaded_by: 'Pierre Oliveira', created_at: '2025-01-03', category: 'Chantier' },
  { id: '6', title: 'Organigramme INNOVTEC 2025', file_name: 'organigramme_2025.pdf', file_type: 'pdf', file_size: '320 KB', uploaded_by: 'Sophie Martin', created_at: '2025-01-02', category: 'RH' },
  { id: '7', title: 'Compte-rendu réunion QSE décembre', file_name: 'CR_reunion_QSE_dec2024.docx', file_type: 'word', file_size: '560 KB', uploaded_by: 'Ana Costa', created_at: '2024-12-28', category: 'QSE' },
  { id: '8', title: 'Budget prévisionnel travaux 2025', file_name: 'budget_travaux_2025.xlsx', file_type: 'excel', file_size: '1.2 MB', uploaded_by: 'Nicolas Bernard', created_at: '2024-12-20', category: 'Finance' },
];

const TYPE_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Word', value: 'word' },
  { label: 'Excel', value: 'excel' },
  { label: 'Images', value: 'image' },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = DEMO_DOCS.filter((doc) => {
    const matchesType = typeFilter === 'all' || doc.file_type === typeFilter;
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary-50">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
            <p className="text-sm text-text-secondary">{filtered.length} document{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Upload size={16} />
          Téléverser
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                typeFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="divide-y divide-border-light">
          {filtered.map((doc) => {
            const fileStyle = FILE_ICONS[doc.file_type] || FILE_ICONS.other;

            return (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0', fileStyle.color)}>
                  {fileStyle.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span>{doc.file_name}</span>
                    <span>{doc.file_size}</span>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-text-secondary text-xs hidden sm:inline-flex">
                  {doc.category}
                </span>
                <div className="hidden md:flex items-center gap-1 text-xs text-text-muted">
                  <User size={12} />
                  {doc.uploaded_by}
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-text-muted">
                  <Calendar size={12} />
                  {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary-50 text-text-muted hover:text-primary transition-colors">
                  <Download size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">Aucun document trouvé</p>
        </div>
      )}
    </div>
  );
}
