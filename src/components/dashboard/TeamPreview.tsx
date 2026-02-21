'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Users } from 'lucide-react';
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
    <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '380ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-600">
            <Users size={18} strokeWidth={1.8} />
          </div>
          <h2 className="section-title">{t('teamPreview')}</h2>
        </div>
        <Link href="/trombinoscope" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group">
          Voir tout <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {members.map((member) => {
            const firstName = (member.first_name as string) || '';
            const lastName = (member.last_name as string) || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';

            return (
              <div key={member.id as string} className="flex flex-col items-center text-center group cursor-pointer p-2 rounded-xl hover:bg-gray-50/80 transition-all">
                <div className="relative mb-2.5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:scale-110 transition-all duration-300`}>
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
