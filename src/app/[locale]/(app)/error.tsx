'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-6">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {t('somethingWentWrong')}
      </h2>
      <p className="text-text-secondary mb-6 max-w-md">
        {error.message || 'Une erreur inattendue est survenue.'}
      </p>
      <button
        onClick={reset}
        className="btn-primary inline-flex items-center gap-2"
      >
        <RefreshCw size={16} />
        {t('tryAgain')}
      </button>
    </div>
  );
}
