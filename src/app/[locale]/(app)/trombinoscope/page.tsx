'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, LayoutGrid, GitBranch, Phone, Mail } from 'lucide-react';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';

export default function TrombinoscopePage() {
  const t = useTranslations('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'org'>('grid');

  const { data: profiles, loading } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('profiles')
        .select('*, team:teams(*)')
        .eq('is_active', true)
        .order('last_name'),
  );

  const { data: teams } = useSupabaseQuery(
    (supabase) =>
      supabase.from('teams').select('*').order('name'),
  );

  const teamNames = ['all', ...(teams || []).map((t: Record<string, any>) => t.name as string)];

  const filteredMembers = (profiles || []).filter((member: Record<string, any>) => {
    const team = member.team as { name: string } | null;
    const matchesTeam = selectedTeam === 'all' || team?.name === selectedTeam;
    const firstName = (member.first_name as string) || '';
    const lastName = (member.last_name as string) || '';
    const position = (member.position as string) || '';
    const matchesSearch =
      searchQuery === '' ||
      `${firstName} ${lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  if (loading) return <LoadingState />;

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
            {teamNames.map((team) => (
              <option key={team} value={team}>{team === 'all' ? 'Toutes les équipes' : team}</option>
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
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
          {filteredMembers.map((member: Record<string, any>) => {
            const firstName = (member.first_name as string) || '';
            const lastName = (member.last_name as string) || '';
            const team = member.team as { name: string; color: string } | null;
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = getInitials(firstName, lastName);

            return (
              <Link key={member.id as string} href={`/trombinoscope/${member.id}`}>
                <div className="card group p-5 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <div className="relative inline-block mb-3">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform`}>
                      {initials}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">{member.position as string}</p>
                  {team && (
                    <span
                      className="badge mt-2 text-white"
                      style={{ backgroundColor: team.color || '#0052CC' }}
                    >
                      {team.name}
                    </span>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border-light">
                    {member.phone && (
                      <span
                        onClick={(e) => { e.preventDefault(); window.location.href = `tel:${member.phone}`; }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                        title={t('call')}
                      >
                        <Phone size={14} />
                      </span>
                    )}
                    {member.email && (
                      <span
                        onClick={(e) => { e.preventDefault(); window.location.href = `mailto:${member.email}`; }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
                        title={t('email')}
                      >
                        <Mail size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Aucun collaborateur trouvé" />
      )}
    </div>
  );
}
