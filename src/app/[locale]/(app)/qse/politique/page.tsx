'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  Edit3,
  Download,
  Eye,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

// --- Types ---
interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  status: 'brouillon' | 'active' | 'archivee';
  category: string;
  author: { first_name: string; last_name: string };
  created_at: string;
  updated_at: string;
  file_size: string;
}

// --- Demo Data ---
const POLICY_CATEGORIES = [
  { name: 'Toutes', value: 'all' },
  { name: 'Qualite', value: 'qualite' },
  { name: 'Securite', value: 'securite' },
  { name: 'Environnement', value: 'environnement' },
  { name: 'General', value: 'general' },
];

const DEMO_POLICIES: PolicyDocument[] = [
  {
    id: '1',
    title: 'Politique Qualite INNOVTEC 2025',
    description:
      'Document de reference definissant les engagements qualite de l\'entreprise pour l\'ensemble des activites reseaux et telecoms. Inclut les objectifs annuels et les indicateurs de performance.',
    version: '3.2',
    status: 'active',
    category: 'qualite',
    author: { first_name: 'Maria', last_name: 'Silva' },
    created_at: '2024-01-15',
    updated_at: '2025-01-10',
    file_size: '2.4 Mo',
  },
  {
    id: '2',
    title: 'Plan de Prevention des Risques Chantiers',
    description:
      'Plan detaille de prevention des risques pour les interventions sur chantier. Couvre les risques electriques, les travaux en hauteur, les travaux en tranchee et la co-activite.',
    version: '5.1',
    status: 'active',
    category: 'securite',
    author: { first_name: 'Pierre', last_name: 'Oliveira' },
    created_at: '2023-06-20',
    updated_at: '2025-02-01',
    file_size: '4.8 Mo',
  },
  {
    id: '3',
    title: 'Charte Environnementale - Gestion des Dechets',
    description:
      'Politique de gestion et tri des dechets de chantier conforme a la reglementation RE2020. Procedures de collecte, tri selectif et tracabilite des bordereaux de suivi.',
    version: '2.0',
    status: 'active',
    category: 'environnement',
    author: { first_name: 'Claire', last_name: 'Petit' },
    created_at: '2024-03-01',
    updated_at: '2024-11-15',
    file_size: '1.8 Mo',
  },
  {
    id: '4',
    title: 'Procedure d\'Accueil Securite Nouveaux Arrivants',
    description:
      'Procedure obligatoire d\'accueil securite pour tout nouvel arrivant ou interimaire. Comprend le livret d\'accueil, la visite chantier et l\'evaluation des competences securite.',
    version: '4.0',
    status: 'active',
    category: 'securite',
    author: { first_name: 'Sophie', last_name: 'Martin' },
    created_at: '2023-09-10',
    updated_at: '2025-01-20',
    file_size: '3.1 Mo',
  },
  {
    id: '5',
    title: 'Politique RSE et Developpement Durable 2026',
    description:
      'Nouvelle politique de responsabilite societale et environnementale. En cours de redaction par le comite QSE. Objectifs de reduction carbone et plan de mobilite durable.',
    version: '0.3',
    status: 'brouillon',
    category: 'environnement',
    author: { first_name: 'Maria', last_name: 'Silva' },
    created_at: '2025-12-01',
    updated_at: '2026-02-15',
    file_size: '1.2 Mo',
  },
  {
    id: '6',
    title: 'Manuel Qualite ISO 9001:2015',
    description:
      'Manuel qualite certifie ISO 9001:2015. Description du systeme de management de la qualite, cartographie des processus et matrice de responsabilites.',
    version: '6.0',
    status: 'active',
    category: 'qualite',
    author: { first_name: 'Maria', last_name: 'Silva' },
    created_at: '2020-05-01',
    updated_at: '2024-06-30',
    file_size: '8.5 Mo',
  },
  {
    id: '7',
    title: 'Protocole Securite Electrique - Consignation',
    description:
      'Protocole detaille de consignation/deconsignation des ouvrages electriques. Procedures BT/HTA conformes a la norme NF C18-510.',
    version: '3.1',
    status: 'archivee',
    category: 'securite',
    author: { first_name: 'Thomas', last_name: 'Ferreira' },
    created_at: '2022-02-15',
    updated_at: '2024-01-10',
    file_size: '2.9 Mo',
  },
  {
    id: '8',
    title: 'Reglement Interieur - Dispositions Generales',
    description:
      'Reglement interieur de l\'entreprise regissant les regles de vie, les horaires, la discipline et les mesures sanitaires applicables a l\'ensemble du personnel.',
    version: '2.3',
    status: 'active',
    category: 'general',
    author: { first_name: 'Sophie', last_name: 'Martin' },
    created_at: '2023-01-01',
    updated_at: '2025-01-05',
    file_size: '1.5 Mo',
  },
  {
    id: '9',
    title: 'Plan de Gestion Environnementale Chantier Type',
    description:
      'Ancienne version du plan de gestion environnementale. Remplacee par la version 2.0 de la Charte Environnementale.',
    version: '1.4',
    status: 'archivee',
    category: 'environnement',
    author: { first_name: 'Claire', last_name: 'Petit' },
    created_at: '2021-07-01',
    updated_at: '2023-12-31',
    file_size: '2.1 Mo',
  },
];

// --- Helpers ---
function getStatusConfig(status: PolicyDocument['status']) {
  const map = {
    brouillon: {
      label: 'Brouillon',
      icon: Edit3,
      classes: 'text-amber-600 bg-amber-50 border border-amber-200',
    },
    active: {
      label: 'Active',
      icon: CheckCircle2,
      classes: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
    },
    archivee: {
      label: 'Archivee',
      icon: Archive,
      classes: 'text-gray-500 bg-gray-50 border border-gray-200',
    },
  };
  return map[status];
}

function getCategoryColor(category: string) {
  const map: Record<string, string> = {
    qualite: '#0052CC',
    securite: '#FF5630',
    environnement: '#36B37E',
    general: '#6B21A8',
  };
  return map[category] || '#5E6C84';
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    qualite: 'Qualite',
    securite: 'Securite',
    environnement: 'Environnement',
    general: 'General',
  };
  return map[category] || category;
}

// --- Component ---
export default function PolitiquePage() {
  const t = useTranslations('qse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPolicies = DEMO_POLICIES.filter((policy) => {
    const matchesCategory =
      selectedCategory === 'all' || policy.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' || policy.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const stats = {
    total: DEMO_POLICIES.length,
    active: DEMO_POLICIES.filter((p) => p.status === 'active').length,
    brouillon: DEMO_POLICIES.filter((p) => p.status === 'brouillon').length,
    archivee: DEMO_POLICIES.filter((p) => p.status === 'archivee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Politiques QSE
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Gestion des documents de politique qualite, securite et environnement
              </p>
            </div>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} />
          Nouveau document
        </button>
      </div>

      {/* Stats cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {[
          { label: 'Total', value: stats.total, color: 'text-text-primary', bg: 'bg-gray-50' },
          { label: 'Actives', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Brouillons', value: stats.brouillon, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Archivees', value: stats.archivee, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 hover:shadow-card-hover transition-shadow">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
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
        <div className="flex items-center gap-2 flex-wrap">
          {POLICY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                selectedCategory === cat.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div
        className="flex items-center gap-2 animate-fade-in-up"
        style={{ animationDelay: '180ms' }}
      >
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-2">
          Statut :
        </span>
        {[
          { label: 'Tous', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Brouillon', value: 'brouillon' },
          { label: 'Archivee', value: 'archivee' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
              statusFilter === s.value
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary border border-border hover:border-primary/30'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Policy List */}
      <div className="space-y-3 animate-stagger">
        {filteredPolicies.map((policy) => {
          const statusConfig = getStatusConfig(policy.status);
          const StatusIcon = statusConfig.icon;
          const gradient = getAvatarGradient(
            policy.author.first_name + policy.author.last_name
          );
          const initials = getInitials(
            policy.author.first_name,
            policy.author.last_name
          );

          return (
            <div
              key={policy.id}
              className="card group p-0 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-stretch">
                {/* Color indicator */}
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: getCategoryColor(policy.category) }}
                />

                <div className="flex-1 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="badge text-white text-[10px]"
                          style={{
                            backgroundColor: getCategoryColor(policy.category),
                          }}
                        >
                          {getCategoryLabel(policy.category)}
                        </span>
                        <span
                          className={cn(
                            'badge gap-1 text-[10px]',
                            statusConfig.classes
                          )}
                        >
                          <StatusIcon size={10} />
                          {statusConfig.label}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                          v{policy.version}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                        {policy.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {policy.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                          >
                            {initials}
                          </div>
                          <span className="text-xs text-text-secondary">
                            {policy.author.first_name} {policy.author.last_name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={11} />
                          Mis a jour le{' '}
                          {new Date(policy.updated_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <FileText size={11} />
                          {policy.file_size}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 lg:pt-2">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                        title="Visualiser"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                        title="Telecharger"
                      >
                        <Download size={14} />
                      </button>
                      <ChevronRight
                        size={16}
                        className="text-text-muted ml-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Aucun document trouve pour ces criteres
          </p>
        </div>
      )}
    </div>
  );
}
