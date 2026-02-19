'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, GraduationCap } from 'lucide-react';

interface FormationItem {
  id: string;
  title: string;
  progress: number;
  type: string;
  hours: number;
}

const DEMO_FORMATIONS: FormationItem[] = [
  { id: '1', title: 'Habilitation Électrique B1V', progress: 75, type: 'presentiel', hours: 16 },
  { id: '2', title: 'SST - Sauveteur Secouriste', progress: 40, type: 'mixte', hours: 14 },
  { id: '3', title: 'CACES R486 - PEMP', progress: 90, type: 'presentiel', hours: 21 },
  { id: '4', title: 'Prévention des risques', progress: 20, type: 'elearning', hours: 7 },
];

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-success';
  if (progress >= 50) return 'bg-primary';
  if (progress >= 25) return 'bg-warning';
  return 'bg-accent';
}

export function FormationsProgress() {
  const t = useTranslations('dashboard');

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '420ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{t('trainingsInProgress')}</h2>
        <Link
          href="/formations"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {DEMO_FORMATIONS.map((formation) => (
          <div key={formation.id} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <GraduationCap size={14} className="text-text-muted flex-shrink-0" />
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {formation.title}
                </p>
              </div>
              <span className="text-xs font-bold text-text-secondary ml-2 flex-shrink-0">
                {formation.progress}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-bar bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-bar transition-all duration-500 ${getProgressColor(formation.progress)}`}
                  style={{ width: `${formation.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-text-muted flex-shrink-0">{formation.hours}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
