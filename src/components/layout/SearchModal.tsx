'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { Search, X, User, FileText, GraduationCap, ClipboardList, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/routing';

interface SearchResult {
  id: string;
  type: 'collaborateur' | 'article' | 'formation' | 'plan_action' | 'document';
  title: string;
  description?: string | null;
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
  plan_action: "Plans d'action",
  document: 'Documents',
};

const typeLinks: Record<string, string> = {
  collaborateur: '/trombinoscope',
  article: '/actualites',
  formation: '/formations',
  plan_action: '/qse/plans-actions',
  document: '/documents',
};

export function SearchModal() {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setResults([]);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  // Search with Supabase
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const searchTerm = `%${query}%`;

      const [articles, profiles, formations, actionPlans] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, excerpt')
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
          .eq('status', 'published')
          .limit(5),
        supabase
          .from('profiles')
          .select('id, first_name, last_name, position')
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),
        supabase
          .from('formations')
          .select('id, title, description')
          .ilike('title', searchTerm)
          .limit(5),
        supabase
          .from('action_plans')
          .select('id, title, description')
          .ilike('title', searchTerm)
          .limit(5),
      ]);

      const searchResults: SearchResult[] = [
        ...(profiles.data || []).map((p) => ({
          id: p.id,
          type: 'collaborateur' as const,
          title: `${p.first_name} ${p.last_name}`,
          description: p.position,
        })),
        ...(articles.data || []).map((a) => ({
          id: a.id,
          type: 'article' as const,
          title: a.title,
          description: a.excerpt,
        })),
        ...(formations.data || []).map((f) => ({
          id: f.id,
          type: 'formation' as const,
          title: f.title,
          description: f.description,
        })),
        ...(actionPlans.data || []).map((a) => ({
          id: a.id,
          type: 'plan_action' as const,
          title: a.title,
          description: a.description,
        })),
      ];

      setResults(searchResults);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />

      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-modal animate-fade-in-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={20} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="flex-1 py-4 text-base text-text-primary placeholder:text-text-muted bg-transparent outline-none"
            autoFocus
          />
          {loading && (
            <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          )}
          <button
            onClick={closeModal}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {query.length < 2 && (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted">Tapez au moins 2 caractères pour rechercher...</p>
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted">{t('noResults')}</p>
            </div>
          )}

          {Object.entries(grouped).map(([type, typeResults]) => (
            <div key={type}>
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {typeLabels[type] || type}
                </h3>
              </div>
              {typeResults.map((result) => (
                <Link
                  key={result.id}
                  href={typeLinks[result.type] || '/'}
                  onClick={closeModal}
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
                </Link>
              ))}
            </div>
          ))}
        </div>

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
