'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { Search, X, User, FileText, GraduationCap, ClipboardList, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'collaborateur' | 'article' | 'formation' | 'plan_action' | 'document';
  title: string;
  description?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  collaborateur: <User size={16} />,
  article: <Newspaper size={16} />,
  formation: <GraduationCap size={16} />,
  plan_action: <ClipboardList size={16} />,
  document: <FileText size={16} />,
};

const typeLabels: Record<string, string> = {
  collaborateur: 'Collaborateurs',
  article: 'Articles',
  formation: 'Formations',
  plan_action: 'Plans d\'action',
  document: 'Documents',
};

// Demo search results for the MVP
const DEMO_RESULTS: SearchResult[] = [
  { id: '1', type: 'collaborateur', title: 'Jean Dupont', description: 'Chef de chantier' },
  { id: '2', type: 'collaborateur', title: 'Maria Silva', description: 'Responsable QSE' },
  { id: '3', type: 'article', title: 'Nouvelle politique sécurité 2025', description: 'QSE' },
  { id: '4', type: 'article', title: 'REX Chantier Bordeaux', description: 'REX' },
  { id: '5', type: 'formation', title: 'Habilitation électrique B1V', description: '16h - Présentiel' },
  { id: '6', type: 'formation', title: 'SST - Sauveteur Secouriste', description: '14h - Mixte' },
  { id: '7', type: 'plan_action', title: 'Mise en conformité EPI chantier Nord', description: 'En cours' },
  { id: '8', type: 'document', title: 'Procédure de consignation', description: 'PDF - v2.1' },
];

export function SearchModal() {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredResults = query.length > 0
    ? DEMO_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      )
    : DEMO_RESULTS;

  // Group results by type
  const grouped = filteredResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const openModal = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal();
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    const handleOpenSearch = () => openModal();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search', handleOpenSearch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, [openModal, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-modal animate-fade-in-up overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={20} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t('searchPlaceholder')}
            className="flex-1 py-4 text-base text-text-primary placeholder:text-text-muted bg-transparent outline-none"
            autoFocus
          />
          <button
            onClick={closeModal}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(grouped).map(([type, results]) => (
            <div key={type}>
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {typeLabels[type] || type}
                </h3>
              </div>
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    'hover:bg-primary-50 focus:bg-primary-50 focus:outline-none'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-text-secondary">
                    {typeIcons[result.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-xs text-text-muted truncate">{result.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
          {filteredResults.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted">{t('noResults')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-gray-50 px-1.5 py-0.5 font-mono">↑↓</kbd>
            <span>naviguer</span>
            <kbd className="rounded border border-border bg-gray-50 px-1.5 py-0.5 font-mono">↵</kbd>
            <span>ouvrir</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-gray-50 px-1.5 py-0.5 font-mono">esc</kbd>
            <span>fermer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
