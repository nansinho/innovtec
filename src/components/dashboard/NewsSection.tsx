'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock } from 'lucide-react';
import { getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: { name: string; type: string };
  cover_image?: string;
  published_at: string;
  author: { first_name: string; last_name: string };
}

const DEMO_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Nouvelle politique sécurité 2025 : les changements majeurs',
    excerpt: 'Découvrez les nouvelles mesures de sécurité mises en place pour tous les chantiers INNOVTEC.',
    category: { name: 'QSE', type: 'qse' },
    cover_image: undefined,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { first_name: 'Maria', last_name: 'Silva' },
  },
  {
    id: '2',
    title: 'REX : Chantier fibre optique Bordeaux Métropole',
    excerpt: 'Retour d\'expérience sur le déploiement de la fibre optique dans le secteur de Mérignac.',
    category: { name: 'REX', type: 'rex' },
    cover_image: undefined,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: { first_name: 'Jean', last_name: 'Dupont' },
  },
  {
    id: '3',
    title: 'Planning des formations Q1 2025 disponible',
    excerpt: 'Le programme de formations du premier trimestre est désormais accessible. Inscriptions ouvertes.',
    category: { name: 'Info', type: 'info' },
    cover_image: undefined,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    author: { first_name: 'Sophie', last_name: 'Martin' },
  },
  {
    id: '4',
    title: 'Rappel : Port des EPI obligatoire sur tous les chantiers',
    excerpt: 'Suite aux dernières inspections, un rappel sur les équipements de protection individuelle.',
    category: { name: 'Sécurité', type: 'securite' },
    cover_image: undefined,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
  },
];

export function NewsSection() {
  const t = useTranslations('dashboard');

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('latestNews')}</h2>
        <Link
          href="/actualites"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_NEWS.map((article) => (
          <Link
            key={article.id}
            href={`/actualites`}
            className="card group p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className={`badge ${getCategoryBadgeClass(article.category.type)} mb-2`}>
                  {article.category.name}
                </span>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                  <span className="font-medium">{article.author.first_name} {article.author.last_name}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatRelativeDate(article.published_at)}
                  </span>
                </div>
              </div>
              {/* Placeholder thumbnail */}
              <div className="hidden sm:flex h-20 w-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center">
                <span className="text-2xl opacity-40">
                  {article.category.type === 'qse' ? '🛡️' : article.category.type === 'rex' ? '💡' : article.category.type === 'securite' ? '⚠️' : '📰'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
