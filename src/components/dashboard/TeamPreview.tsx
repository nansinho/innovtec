'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { getAvatarGradient, getInitials } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';

export function TeamPreview() {
  const t = useTranslations('dashboard');

  const { data: profiles } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('profiles')
        .select('id, first_name, last_name, position')
        .eq('is_active', true)
        .order('last_name')
        .limit(8),
  );

  const members = (profiles || []) as Record<string, any>[];

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('teamPreview')}</h2>
        <Link href="/trombinoscope" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {members.map((member) => {
            const firstName = (member.first_name as string) || '';
            const lastName = (member.last_name as string) || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';

            return (
              <div key={member.id as string} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="relative mb-2">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform`}>
                    {initials}
                  </div>
                </div>
                <p className="text-xs font-semibold text-text-primary truncate w-full">
                  {firstName} {lastName.charAt(0)}.
                </p>
                <p className="text-[10px] text-text-muted truncate w-full">{member.position as string}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">Aucun collaborateur</p>
      )}
    </div>
  );
}
