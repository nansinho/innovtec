'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  FileWarning,
} from 'lucide-react';
import { cn, getStatusColor, getSeverityColor, getAvatarGradient, getInitials } from '@/lib/utils';

// --- Types ---
interface SituationDangereuse {
  id: string;
  reference: string;
  title: string;
  description: string;
  severity: 'faible' | 'moyen' | 'eleve' | 'critique';
  status: 'en_cours' | 'cloture' | 'en_retard';
  reporter: { first_name: string; last_name: string };
  location: string;
  chantier: string;
  date: string;
  date_cloture?: string;
  actions_count: number;
}

// --- Demo Data ---
const DEMO_SITUATIONS: SituationDangereuse[] = [
  {
    id: '1',
    reference: 'SD-2026-042',
    title: 'Absence de blindage dans tranchee profonde',
    description:
      'Tranchee de plus de 1m30 de profondeur sans blindage ni talutage. Risque d\'eboulement important suite aux intemperies recentes.',
    severity: 'critique',
    status: 'en_cours',
    reporter: { first_name: 'Jean', last_name: 'Dupont' },
    location: 'Rue Victor Hugo, Merignac',
    chantier: 'FTTH Merignac Lot 3',
    date: '2026-02-18',
    actions_count: 3,
  },
  {
    id: '2',
    reference: 'SD-2026-041',
    title: 'Cable electrique aerien non signale a proximite',
    description:
      'Ligne electrique BT a moins de 3m de la zone de travail de la nacelle. Aucune signalisation ni protection en place. Risque electrique majeur.',
    severity: 'eleve',
    status: 'en_cours',
    reporter: { first_name: 'Thomas', last_name: 'Ferreira' },
    location: 'Avenue de la Republique, Pessac',
    chantier: 'Reseau Gaz Pessac Centre',
    date: '2026-02-17',
    actions_count: 2,
  },
  {
    id: '3',
    reference: 'SD-2026-040',
    title: 'Echafaudage non conforme - barres manquantes',
    description:
      'Echafaudage monte sans garde-corps intermediaire et sans plinthe. Non conforme a la norme NF EN 12811.',
    severity: 'eleve',
    status: 'cloture',
    reporter: { first_name: 'Pierre', last_name: 'Oliveira' },
    location: 'Zone Industrielle, Begles',
    chantier: 'NRO Begles Sud',
    date: '2026-02-15',
    date_cloture: '2026-02-16',
    actions_count: 4,
  },
  {
    id: '4',
    reference: 'SD-2026-039',
    title: 'Balisage insuffisant en bord de route',
    description:
      'Zone de travaux en bord de chaussee avec balisage minimal. Cones espaces de plus de 10m, pas de panneau de signalisation avancee. Debit vehicules important.',
    severity: 'moyen',
    status: 'cloture',
    reporter: { first_name: 'Miguel', last_name: 'Rodrigues' },
    location: 'RD1010, Gradignan',
    chantier: 'FTTH Gradignan Est',
    date: '2026-02-12',
    date_cloture: '2026-02-13',
    actions_count: 2,
  },
  {
    id: '5',
    reference: 'SD-2026-038',
    title: 'Produit chimique sans fiche de securite',
    description:
      'Utilisation d\'un solvant de nettoyage sans FDS disponible sur le chantier. L\'etiquetage du produit est partiellement illisible.',
    severity: 'moyen',
    status: 'en_retard',
    reporter: { first_name: 'Claire', last_name: 'Petit' },
    location: 'Entrepot Central, Bordeaux',
    chantier: 'Maintenance Reseau Bordeaux',
    date: '2026-02-05',
    actions_count: 1,
  },
  {
    id: '6',
    reference: 'SD-2026-037',
    title: 'Sol glissant non signale dans local technique',
    description:
      'Fuite d\'eau ayant rendu le sol du local technique glissant. Aucun panneau d\'avertissement ni nettoyage effectue.',
    severity: 'faible',
    status: 'cloture',
    reporter: { first_name: 'Carlos', last_name: 'Santos' },
    location: 'NRO Cenon, Rue Camille Pelletan',
    chantier: 'Maintenance NRO Rive Droite',
    date: '2026-02-03',
    date_cloture: '2026-02-03',
    actions_count: 1,
  },
  {
    id: '7',
    reference: 'SD-2026-036',
    title: 'Engin de chantier stationne pres d\'une fouille ouverte',
    description:
      'Mini-pelle stationnee a moins de 2m du bord d\'une fouille ouverte sans calage. Risque de basculement dans la tranchee.',
    severity: 'critique',
    status: 'en_retard',
    reporter: { first_name: 'Jean', last_name: 'Dupont' },
    location: 'Lotissement Les Pins, Le Bouscat',
    chantier: 'FTTH Le Bouscat Lot 1',
    date: '2026-01-28',
    actions_count: 5,
  },
  {
    id: '8',
    reference: 'SD-2026-035',
    title: 'EPI non porte : casque et gilet haute visibilite',
    description:
      'Deux techniciens observes sans casque ni gilet HV lors d\'une intervention en bord de route. Rappel immediat effectue sur place.',
    severity: 'moyen',
    status: 'cloture',
    reporter: { first_name: 'Maria', last_name: 'Silva' },
    location: 'Boulevard Pierre 1er, Bordeaux',
    chantier: 'Fibre Bordeaux Bastide',
    date: '2026-01-25',
    date_cloture: '2026-01-26',
    actions_count: 2,
  },
];

// --- Helpers ---
function getSeverityLabel(severity: SituationDangereuse['severity']) {
  const map = {
    faible: 'Faible',
    moyen: 'Moyen',
    eleve: 'Eleve',
    critique: 'Critique',
  };
  return map[severity];
}

function getSeverityIcon(severity: SituationDangereuse['severity']) {
  const map = {
    faible: AlertCircle,
    moyen: AlertTriangle,
    eleve: TriangleAlert,
    critique: FileWarning,
  };
  return map[severity];
}

function getStatusLabel(status: SituationDangereuse['status']) {
  const map = {
    en_cours: 'En cours',
    cloture: 'Cloture',
    en_retard: 'En retard',
  };
  return map[status];
}

function getStatusIcon(status: SituationDangereuse['status']) {
  const map = {
    en_cours: Clock,
    cloture: CheckCircle2,
    en_retard: AlertTriangle,
  };
  return map[status];
}

// --- Component ---
export default function SituationsDangereusesPage() {
  const t = useTranslations('qse');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSituations = DEMO_SITUATIONS.filter((sd) => {
    const matchesSeverity =
      severityFilter === 'all' || sd.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' || sd.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      sd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sd.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sd.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sd.chantier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const stats = {
    total: DEMO_SITUATIONS.length,
    en_cours: DEMO_SITUATIONS.filter((s) => s.status === 'en_cours').length,
    en_retard: DEMO_SITUATIONS.filter((s) => s.status === 'en_retard').length,
    critique: DEMO_SITUATIONS.filter((s) => s.severity === 'critique').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-danger/10">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Situations Dangereuses
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Declaration et suivi des situations dangereuses sur les chantiers
              </p>
            </div>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit bg-danger hover:bg-danger-dark">
          <Plus size={16} />
          Nouvelle declaration
        </button>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        {[
          { label: 'Total declarations', value: stats.total, color: 'text-text-primary', bg: 'bg-gray-50', borderColor: 'border-l-gray-400' },
          { label: 'En cours', value: stats.en_cours, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-l-blue-500' },
          { label: 'En retard', value: stats.en_retard, color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-l-red-500' },
          { label: 'Critiques', value: stats.critique, color: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-l-red-700' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn('card p-4 border-l-4 hover:shadow-card-hover transition-shadow', stat.borderColor)}
          >
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col gap-4 animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher par reference, titre, lieu ou chantier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-1">
              <Filter size={12} className="inline mr-1" />
              Gravite :
            </span>
            {[
              { label: 'Toutes', value: 'all' },
              { label: 'Faible', value: 'faible' },
              { label: 'Moyen', value: 'moyen' },
              { label: 'Eleve', value: 'eleve' },
              { label: 'Critique', value: 'critique' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverityFilter(s.value)}
                className={cn(
                  'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
                  severityFilter === s.value
                    ? s.value === 'all'
                      ? 'bg-primary text-white'
                      : cn(getSeverityColor(s.value), 'border')
                    : 'bg-white text-text-secondary border border-border hover:border-primary/30'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide mr-1">
              Statut :
            </span>
            {[
              { label: 'Tous', value: 'all' },
              { label: 'En cours', value: 'en_cours' },
              { label: 'Cloture', value: 'cloture' },
              { label: 'En retard', value: 'en_retard' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  'rounded-button px-3 py-1 text-xs font-medium transition-all duration-200',
                  statusFilter === s.value
                    ? s.value === 'all'
                      ? 'bg-primary text-white'
                      : cn(getStatusColor(s.value === 'cloture' ? 'cloture' : s.value))
                    : 'bg-white text-text-secondary border border-border hover:border-primary/30'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary">
        {filteredSituations.length} declaration{filteredSituations.length > 1 ? 's' : ''}
      </p>

      {/* Situations list */}
      <div className="space-y-3 animate-stagger">
        {filteredSituations.map((sd) => {
          const SeverityIcon = getSeverityIcon(sd.severity);
          const StatusIcon = getStatusIcon(sd.status);
          const gradient = getAvatarGradient(
            sd.reporter.first_name + sd.reporter.last_name
          );
          const initials = getInitials(
            sd.reporter.first_name,
            sd.reporter.last_name
          );

          return (
            <div
              key={sd.id}
              className="card group p-0 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-stretch">
                {/* Severity color bar */}
                <div
                  className={cn(
                    'w-1.5 shrink-0',
                    sd.severity === 'critique' && 'bg-red-600',
                    sd.severity === 'eleve' && 'bg-orange-500',
                    sd.severity === 'moyen' && 'bg-amber-500',
                    sd.severity === 'faible' && 'bg-blue-500'
                  )}
                />

                <div className="flex-1 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      {/* Badges row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                          {sd.reference}
                        </span>
                        <span
                          className={cn(
                            'badge gap-1 text-[10px] border',
                            getSeverityColor(sd.severity)
                          )}
                        >
                          <SeverityIcon size={10} />
                          {getSeverityLabel(sd.severity)}
                        </span>
                        <span
                          className={cn(
                            'badge gap-1 text-[10px]',
                            getStatusColor(sd.status)
                          )}
                        >
                          <StatusIcon size={10} />
                          {getStatusLabel(sd.status)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                        {sd.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {sd.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                          >
                            {initials}
                          </div>
                          <span className="text-xs text-text-secondary">
                            {sd.reporter.first_name} {sd.reporter.last_name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin size={11} />
                          {sd.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar size={11} />
                          {new Date(sd.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-text-muted">
                          {sd.chantier}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 shrink-0 lg:pt-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-text-primary">
                          {sd.actions_count}
                        </p>
                        <p className="text-[10px] text-text-muted">action{sd.actions_count > 1 ? 's' : ''}</p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-text-muted"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSituations.length === 0 && (
        <div className="text-center py-16">
          <AlertTriangle size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Aucune situation dangereuse trouvee pour ces criteres
          </p>
        </div>
      )}
    </div>
  );
}
