'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Flag, Calendar, User, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { LoadingState, ErrorState } from '@/components/ui/DataStates';
import { useToast } from '@/components/ui/Toast';
import { updateActionPlan } from '@/lib/actions';
import { cn, getAvatarGradient, getInitials } from '@/lib/utils';

export default function ActionPlanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plan, loading, error, refetch } = useSupabaseQuery<Record<string, any>>(
    (supabase) =>
      supabase
        .from('action_plans')
        .select('*, responsible:profiles!action_plans_responsible_id_fkey(*), team:teams(*)')
        .eq('id', id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any,
    [id],
  );

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await updateActionPlan(id, { status });
      toast('Statut mis à jour', 'success');
      refetch();
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !plan) return <ErrorState message="Plan d'action introuvable" />;
  const responsible = plan.responsible as { first_name: string; last_name: string } | null;
  const team = plan.team as { name: string } | null;
  const priorityColors: Record<string, string> = {
    basse: 'text-blue-600 bg-blue-50',
    normale: 'text-emerald-600 bg-emerald-50',
    haute: 'text-orange-600 bg-orange-50',
    urgente: 'text-red-600 bg-red-50',
  };
  const statusLabels: Record<string, string> = { en_cours: 'En cours', cloture: 'Cloturé', en_retard: 'En retard', annule: 'Annulé' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <Link href="/qse/plans-actions" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        Plans d&apos;actions
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('badge', priorityColors[plan.priority] || 'bg-gray-50')}>
            <Flag size={12} className="mr-1" />
            {plan.priority}
          </span>
          <span className={cn('badge', plan.status === 'cloture' ? 'bg-emerald-50 text-emerald-700' : plan.status === 'en_retard' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700')}>
            {statusLabels[plan.status] || plan.status}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">{plan.title}</h1>
        {plan.description && <p className="text-base text-text-secondary mt-2 whitespace-pre-wrap">{plan.description}</p>}

        <div className="grid grid-cols-2 gap-4 mt-6">
          {responsible && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={16} className="text-text-muted" />
              {responsible.first_name} {responsible.last_name}
            </div>
          )}
          {team && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={16} className="text-text-muted" />
              Équipe: {team.name}
            </div>
          )}
          {plan.due_date && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar size={16} className="text-text-muted" />
              Échéance: {new Date(plan.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
          {plan.created_at && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={16} className="text-text-muted" />
              Créé le {new Date(plan.created_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {plan.status !== 'cloture' && (
          <div className="mt-6 pt-4 border-t border-border-light flex gap-3">
            <button onClick={() => handleStatusUpdate('cloture')} disabled={updating} className="btn-primary flex items-center gap-2">
              <CheckCircle2 size={16} />
              Cloturer
            </button>
            {plan.status !== 'en_retard' && (
              <button onClick={() => handleStatusUpdate('en_retard')} disabled={updating} className="btn-secondary flex items-center gap-2 text-red-600">
                <AlertTriangle size={16} />
                Marquer en retard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
