import { useTranslations } from 'next-intl';
import { FileQuestion, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function NotFoundPage() {
  const t = useTranslations('errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <FileQuestion size={32} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {t('pageNotFound')}
      </h2>
      <p className="text-text-secondary mb-6 max-w-md">
        {t('pageNotFoundDescription')}
      </p>
      <Link
        href="/"
        className="btn-primary inline-flex items-center gap-2"
      >
        <Home size={16} />
        {t('goHome')}
      </Link>
    </div>
  );
}
