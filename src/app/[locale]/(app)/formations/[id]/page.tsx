'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Users, MapPin, Monitor, Award, Calendar, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';
import { enrollInFormation } from '@/lib/actions';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function FormationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [enrolling, setEnrolling] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: formation, loading, error, refetch } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('formations')
        .select('*, creator:profiles!formations_created_by_fkey(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollInFormation(id);
      toast('Inscription confirmée', 'success');
      refetch();
    } catch {
      toast("Erreur lors de l'inscription", 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !formation) return <ErrorState message="Formation introuvable" />;
  const statusColors: Record<string, string> = {
    planifiee: 'bg-blue-50 text-blue-700',
    en_cours: 'bg-primary-50 text-primary',
    terminee: 'bg-emerald-50 text-emerald-700',
    annulee: 'bg-gray-100 text-gray-500',
  };
  const statusLabels: Record<string, string> = {
    planifiee: 'Planifiée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <Link href="/formations" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        Formations
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('badge', statusColors[formation.status] || 'bg-gray-100')}>
            {statusLabels[formation.status] || formation.status}
          </span>
          {formation.type && (
            <span className="badge bg-blue-50 text-blue-700">
              {formation.type === 'presentiel' ? 'Présentiel' : formation.type === 'elearning' ? 'E-learning' : 'Mixte'}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-text-primary">{formation.title}</h1>
        {formation.description && (
          <p className="text-base text-text-secondary mt-2">{formation.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
          {formation.duration_hours && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={16} className="text-text-muted" />
              {formation.duration_hours}h de formation
            </div>
          )}
          {formation.max_participants && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users size={16} className="text-text-muted" />
              {formation.max_participants} places max
            </div>
          )}
          {formation.location && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={16} className="text-text-muted" />
              {formation.location}
            </div>
          )}
          {formation.instructor && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={16} className="text-text-muted" />
              {formation.instructor}
            </div>
          )}
          {formation.start_date && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar size={16} className="text-text-muted" />
              {new Date(formation.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {formation.end_date && ` - ${new Date(formation.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </div>
          )}
          {formation.category && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Award size={16} className="text-text-muted" />
              {formation.category}
            </div>
          )}
        </div>

        {formation.status === 'planifiee' && (
          <div className="mt-6 pt-4 border-t border-border-light">
            <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
              {enrolling ? 'Inscription en cours...' : "S'inscrire à cette formation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
