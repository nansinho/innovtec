'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState } from '@/components/ui/DataStates';
import { getAvatarGradient, getInitials } from '@/lib/utils';

export default function MemberDetailPage() {
  const params = useParams();
  const t = useTranslations('team');
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member, loading, error } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('profiles')
        .select('*, team:teams(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  if (loading) return <LoadingState />;
  if (error || !member) return <ErrorState message="Collaborateur introuvable" />;
  const firstName = (member.first_name as string) || '';
  const lastName = (member.last_name as string) || '';
  const team = member.team as { name: string; color: string } | null;
  const gradient = getAvatarGradient(firstName + lastName);
  const initials = getInitials(firstName, lastName);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <Link href="/trombinoscope" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        {t('title')}
      </Link>

      <div className="card p-8 text-center">
        <div className="relative inline-block mb-4">
          <div className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-3xl shadow-lg`}>
            {initials}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">{firstName} {lastName}</h1>
        {member.position && (
          <p className="text-base text-text-secondary mt-1 flex items-center justify-center gap-1">
            <Briefcase size={14} />
            {member.position}
          </p>
        )}
        {team && (
          <span className="badge mt-3 text-white" style={{ backgroundColor: team.color || '#0052CC' }}>
            {team.name}
          </span>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-text-primary">Coordonnées</h2>
        {member.email && (
          <a href={`mailto:${member.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <Mail size={18} className="text-primary" />
            <span className="text-sm text-text-primary">{member.email}</span>
          </a>
        )}
        {member.phone && (
          <a href={`tel:${member.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <Phone size={18} className="text-primary" />
            <span className="text-sm text-text-primary">{member.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
