'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Plus, Search, Lightbulb, Camera, Calendar, User, ChevronRight } from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

interface RexItem {
  id: string;
  title: string;
  description: string;
  causes: string;
  lessons_learned: string;
  author: { first_name: string; last_name: string };
  created_at: string;
  photos_count: number;
  category: string;
}

const DEMO_REX: RexItem[] = [
  {
    id: '1',
    title: 'Rupture canalisation lors de terrassement',
    description: 'Lors du terrassement rue des Lilas, une canalisation d\'eau non identifiée sur les plans a été percée par la mini-pelle.',
    causes: 'Plans DICT incomplets, absence de sondage préalable dans la zone sensible.',
    lessons_learned: 'Systématiser les sondages manuels dans un rayon de 1m autour des réseaux identifiés. Vérifier les plans avec le concessionnaire avant intervention.',
    author: { first_name: 'Jean', last_name: 'Dupont' },
    created_at: '2025-01-10',
    photos_count: 4,
    category: 'Terrassement',
  },
  {
    id: '2',
    title: 'Chute de plain-pied sur chantier boueux',
    description: 'Un ouvrier a glissé sur une zone boueuse non balisée à proximité de la tranchée, entraînant une entorse à la cheville.',
    causes: 'Zone de circulation non entretenue après pluie, absence de caillebotis.',
    lessons_learned: 'Mettre en place des caillebotis sur les zones de passage dès que le terrain est meuble. Adapter le plan de circulation aux conditions météo.',
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
    created_at: '2025-01-05',
    photos_count: 2,
    category: 'Sécurité',
  },
  {
    id: '3',
    title: 'Déploiement fibre - Technique de micro-tranchée',
    description: 'Test réussi de la technique de micro-tranchée pour le passage de fibre optique en centre-ville, réduisant les nuisances.',
    causes: 'N/A - REX positif',
    lessons_learned: 'La micro-tranchée permet un gain de 40% sur le temps de réalisation et réduit significativement les nuisances sonores. À privilégier en zone urbaine dense.',
    author: { first_name: 'Miguel', last_name: 'Rodrigues' },
    created_at: '2024-12-20',
    photos_count: 6,
    category: 'Innovation',
  },
  {
    id: '4',
    title: 'Incident électrique - Absence de consignation',
    description: 'Un technicien a été exposé à un risque électrique lors d\'une intervention sur un coffret non consigné.',
    causes: 'Procédure de consignation non respectée, communication insuffisante entre équipes.',
    lessons_learned: 'Renforcer la formation sur les procédures de consignation. Mise en place d\'un double contrôle systématique avant toute intervention.',
    author: { first_name: 'Maria', last_name: 'Silva' },
    created_at: '2024-12-15',
    photos_count: 1,
    category: 'Électricité',
  },
];

export default function RexPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = DEMO_REX.filter(
    (rex) =>
      searchQuery === '' ||
      rex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rex.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-emerald-50">
            <Lightbulb size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Retours d&apos;Expérience</h1>
            <p className="text-sm text-text-secondary">Partagez et apprenez des expériences terrain</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          {t('newRex')}
        </button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Rechercher un REX..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* REX List */}
      <div className="space-y-4 animate-stagger">
        {filtered.map((rex) => {
          const gradient = getAvatarGradient(rex.author.first_name + rex.author.last_name);
          const initials = getInitials(rex.author.first_name, rex.author.last_name);

          return (
            <div key={rex.id} className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-sm flex-shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-emerald-50 text-emerald-700">{rex.category}</span>
                    {rex.photos_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Camera size={12} />
                        {rex.photos_count} photo{rex.photos_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors mb-1">
                    {rex.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {rex.description}
                  </p>

                  {/* Lessons learned highlight */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Enseignements :</p>
                    <p className="text-xs text-emerald-800 line-clamp-2">{rex.lessons_learned}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {rex.author.first_name} {rex.author.last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(rex.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
