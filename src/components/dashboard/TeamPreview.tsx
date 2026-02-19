'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { getAvatarGradient, getInitials } from '@/lib/utils';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  avatar_url?: string;
  is_online: boolean;
}

const DEMO_TEAM: TeamMember[] = [
  { id: '1', first_name: 'Nicolas', last_name: 'Bernard', position: 'Directeur Général', is_online: true },
  { id: '2', first_name: 'Maria', last_name: 'Silva', position: 'Responsable QSE', is_online: true },
  { id: '3', first_name: 'Jean', last_name: 'Dupont', position: 'Chef de chantier', is_online: true },
  { id: '4', first_name: 'Sophie', last_name: 'Martin', position: 'Responsable RH', is_online: false },
  { id: '5', first_name: 'Pierre', last_name: 'Oliveira', position: 'Conducteur de travaux', is_online: true },
  { id: '6', first_name: 'Ana', last_name: 'Costa', position: 'Assistante de direction', is_online: true },
  { id: '7', first_name: 'Thomas', last_name: 'Ferreira', position: 'Chef d\'équipe', is_online: false },
  { id: '8', first_name: 'Lucie', last_name: 'Moreau', position: 'Chargée de formation', is_online: true },
];

export function TeamPreview() {
  const t = useTranslations('dashboard');

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('teamPreview')}</h2>
        <Link
          href="/trombinoscope"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DEMO_TEAM.map((member) => {
          const gradient = getAvatarGradient(member.first_name + member.last_name);
          const initials = getInitials(member.first_name, member.last_name);

          return (
            <div
              key={member.id}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative mb-2">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform`}>
                  {initials}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${member.is_online ? 'bg-success' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs font-semibold text-text-primary truncate w-full">
                {member.first_name} {member.last_name.charAt(0)}.
              </p>
              <p className="text-[10px] text-text-muted truncate w-full">
                {member.position}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
