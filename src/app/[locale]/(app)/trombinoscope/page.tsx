'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, LayoutGrid, GitBranch, Phone, Mail } from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  team_color: string;
  phone: string;
  email: string;
  is_online: boolean;
}

const DEMO_MEMBERS: TeamMember[] = [
  { id: '1', first_name: 'Nicolas', last_name: 'Bernard', position: 'Directeur Général', team: 'Direction', team_color: '#0052CC', phone: '+33 6 12 34 56 78', email: 'n.bernard@innovtec.fr', is_online: true },
  { id: '2', first_name: 'Maria', last_name: 'Silva', position: 'Responsable QSE', team: 'QSE', team_color: '#FF6B35', phone: '+33 6 23 45 67 89', email: 'm.silva@innovtec.fr', is_online: true },
  { id: '3', first_name: 'Jean', last_name: 'Dupont', position: 'Chef de chantier', team: 'Travaux', team_color: '#36B37E', phone: '+33 6 34 56 78 90', email: 'j.dupont@innovtec.fr', is_online: true },
  { id: '4', first_name: 'Sophie', last_name: 'Martin', position: 'Responsable RH', team: 'Administration', team_color: '#6B21A8', phone: '+33 6 45 67 89 01', email: 's.martin@innovtec.fr', is_online: false },
  { id: '5', first_name: 'Pierre', last_name: 'Oliveira', position: 'Conducteur de travaux', team: 'Travaux', team_color: '#36B37E', phone: '+33 6 56 78 90 12', email: 'p.oliveira@innovtec.fr', is_online: true },
  { id: '6', first_name: 'Ana', last_name: 'Costa', position: 'Assistante de direction', team: 'Direction', team_color: '#0052CC', phone: '+33 6 67 89 01 23', email: 'a.costa@innovtec.fr', is_online: true },
  { id: '7', first_name: 'Thomas', last_name: 'Ferreira', position: 'Chef d\'équipe Électricité', team: 'Travaux', team_color: '#36B37E', phone: '+33 6 78 90 12 34', email: 't.ferreira@innovtec.fr', is_online: false },
  { id: '8', first_name: 'Lucie', last_name: 'Moreau', position: 'Chargée de formation', team: 'Administration', team_color: '#6B21A8', phone: '+33 6 89 01 23 45', email: 'l.moreau@innovtec.fr', is_online: true },
  { id: '9', first_name: 'Carlos', last_name: 'Santos', position: 'Chef d\'équipe Gaz', team: 'Travaux', team_color: '#36B37E', phone: '+33 6 90 12 34 56', email: 'c.santos@innovtec.fr', is_online: true },
  { id: '10', first_name: 'Isabelle', last_name: 'Dubois', position: 'Comptable', team: 'Administration', team_color: '#6B21A8', phone: '+33 6 01 23 45 67', email: 'i.dubois@innovtec.fr', is_online: false },
  { id: '11', first_name: 'Miguel', last_name: 'Rodrigues', position: 'Chef d\'équipe Télécom', team: 'Travaux', team_color: '#36B37E', phone: '+33 6 11 22 33 44', email: 'm.rodrigues@innovtec.fr', is_online: true },
  { id: '12', first_name: 'Claire', last_name: 'Petit', position: 'Assistante QSE', team: 'QSE', team_color: '#FF6B35', phone: '+33 6 55 66 77 88', email: 'c.petit@innovtec.fr', is_online: true },
];

const TEAMS = ['Toutes les équipes', 'Direction', 'QSE', 'Travaux', 'Administration'];

export default function TrombinoscopePage() {
  const t = useTranslations('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Toutes les équipes');
  const [viewMode, setViewMode] = useState<'grid' | 'org'>('grid');

  const filteredMembers = DEMO_MEMBERS.filter((member) => {
    const matchesTeam = selectedTeam === 'Toutes les équipes' || member.team === selectedTeam;
    const matchesSearch =
      searchQuery === '' ||
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('members', { count: filteredMembers.length })}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="input w-auto"
          >
            {TEAMS.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          <div className="flex rounded-button border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('org')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors border-l border-border',
                viewMode === 'org' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'
              )}
            >
              <GitBranch size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
        {filteredMembers.map((member) => {
          const gradient = getAvatarGradient(member.first_name + member.last_name);
          const initials = getInitials(member.first_name, member.last_name);

          return (
            <div
              key={member.id}
              className="card group p-5 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative inline-block mb-3">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform`}>
                  {initials}
                </div>
                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-3 border-white ${member.is_online ? 'bg-success' : 'bg-gray-300'}`} />
              </div>

              {/* Info */}
              <h3 className="text-sm font-bold text-text-primary">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">{member.position}</p>
              <span
                className="badge mt-2 text-white"
                style={{ backgroundColor: member.team_color }}
              >
                {member.team}
              </span>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border-light">
                <a
                  href={`tel:${member.phone}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                  title={t('call')}
                >
                  <Phone size={14} />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                  title={t('email')}
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">Aucun collaborateur trouvé</p>
        </div>
      )}
    </div>
  );
}
