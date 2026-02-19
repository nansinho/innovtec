'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Plus, Clock, MessageCircle } from 'lucide-react';
import { cn, getCategoryBadgeClass, formatRelativeDate } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: { name: string; type: string; color: string };
  author: { first_name: string; last_name: string };
  published_at: string;
  comments_count: number;
}

const CATEGORIES = [
  { name: 'Toutes', type: 'all', color: '#0052CC' },
  { name: 'QSE', type: 'qse', color: '#D14900' },
  { name: 'REX', type: 'rex', color: '#00875A' },
  { name: 'Info', type: 'info', color: '#0052CC' },
  { name: 'Sécurité', type: 'securite', color: '#FF5630' },
  { name: 'Blog', type: 'blog', color: '#6B21A8' },
];

const DEMO_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Nouvelle politique sécurité 2025 : les changements majeurs à connaître',
    excerpt: 'Découvrez les nouvelles mesures de sécurité mises en place pour tous les chantiers INNOVTEC. Cette mise à jour concerne l\'ensemble des collaborateurs terrain et bureau.',
    content: '',
    category: { name: 'QSE', type: 'qse', color: '#D14900' },
    author: { first_name: 'Maria', last_name: 'Silva' },
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    comments_count: 5,
  },
  {
    id: '2',
    title: 'REX : Chantier fibre optique Bordeaux Métropole - Retour complet',
    excerpt: 'Retour d\'expérience détaillé sur le déploiement FTTH dans le secteur de Mérignac. Points positifs, axes d\'amélioration et recommandations pour les prochains chantiers.',
    content: '',
    category: { name: 'REX', type: 'rex', color: '#00875A' },
    author: { first_name: 'Jean', last_name: 'Dupont' },
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 12,
  },
  {
    id: '3',
    title: 'Planning des formations Q1 2025 maintenant disponible',
    excerpt: 'Le programme complet de formations du premier trimestre est désormais en ligne. Habilitations électriques, CACES, SST : découvrez les sessions et inscrivez-vous.',
    content: '',
    category: { name: 'Info', type: 'info', color: '#0052CC' },
    author: { first_name: 'Sophie', last_name: 'Martin' },
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 3,
  },
  {
    id: '4',
    title: 'Rappel : Port des EPI obligatoire - Nouvelles consignes',
    excerpt: 'Suite aux résultats des dernières inspections terrain, rappel impératif sur les équipements de protection individuelle. Nouvelles consignes pour les casques et gilets.',
    content: '',
    category: { name: 'Sécurité', type: 'securite', color: '#FF5630' },
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 8,
  },
  {
    id: '5',
    title: 'Bienvenue aux nouveaux collaborateurs de janvier 2025',
    excerpt: 'INNOVTEC Réseaux accueille 4 nouveaux membres dans ses équipes ce mois-ci. Découvrez leurs profils et souhaitons-leur la bienvenue !',
    content: '',
    category: { name: 'Blog', type: 'blog', color: '#6B21A8' },
    author: { first_name: 'Ana', last_name: 'Costa' },
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 15,
  },
  {
    id: '6',
    title: 'Mise à jour du protocole de consignation électrique',
    excerpt: 'Le protocole de consignation a été mis à jour suite aux retours terrain. Tous les chefs d\'équipe doivent prendre connaissance de ces modifications avant le 31 janvier.',
    content: '',
    category: { name: 'QSE', type: 'qse', color: '#D14900' },
    author: { first_name: 'Maria', last_name: 'Silva' },
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 6,
  },
];

export default function ActualitesPage() {
  const t = useTranslations('news');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = DEMO_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category.type === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          {t('newArticle')}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('categories') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setSelectedCategory(cat.type)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                selectedCategory === cat.type
                  ? 'text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
              style={selectedCategory === cat.type ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
        {filteredArticles.map((article) => {
          const gradient = getAvatarGradient(article.author.first_name + article.author.last_name);
          const initials = getInitials(article.author.first_name, article.author.last_name);

          return (
            <article
              key={article.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Color header bar */}
              <div
                className="h-1.5"
                style={{ backgroundColor: article.category.color }}
              />

              <div className="p-5">
                <span className={`badge ${getCategoryBadgeClass(article.category.type)} mb-3`}>
                  {article.category.name}
                </span>

                <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h2>

                <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white`}>
                      {initials}
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {article.author.first_name} {article.author.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {article.comments_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatRelativeDate(article.published_at)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">{t('noArticles')}</p>
        </div>
      )}
    </div>
  );
}
