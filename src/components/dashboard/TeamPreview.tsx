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
        .select('id, first_name, last_name, position, avatar_url')
        .eq('is_active', true)
        .order('last_name')
        .limit(6),
  );

  const members = (profiles || []) as Record<string, any>[];

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '380ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-600">
            <Users size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{t('teamPreview')}</h2>
            <p className="text-xs text-text-muted">{members.length} {t('members')}</p>
          </div>
        </div>
        <Link href="/trombinoscope" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors group">
          {t('viewAll')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => {
            const firstName = (member.first_name as string) || '';
            const lastName = (member.last_name as string) || '';
            const gradient = getAvatarGradient(firstName + lastName);
            const initials = firstName && lastName ? getInitials(firstName, lastName) : '?';
            const position = (member.position as string) || '';

            return (
              <div
                key={member.id as string}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-background/50 transition-all cursor-pointer group"
              >
                {/* Avatar */}
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url as string}
                    alt={`${firstName} ${lastName}`}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-xs ring-2 ring-white shadow-sm flex-shrink-0`}>
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {firstName} {lastName}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">{position}</p>
                </div>

                {/* Online indicator */}
                <div className="flex-shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <Users size={28} className="text-text-muted/30 mb-2" />
          <p className="text-sm text-text-muted">Aucun collaborateur</p>
        </div>
      )}
    </div>
  );
}
