'use client';

import { Loader2, Inbox } from 'lucide-react';

export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="text-primary animate-spin" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'Aucune donnée', description }: { message?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <Inbox size={28} className="text-text-muted" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{message}</p>
      {description && <p className="text-xs text-text-muted max-w-sm text-center">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Une erreur est survenue' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <Inbox size={28} className="text-danger" />
      </div>
      <p className="text-sm font-medium text-danger">{message}</p>
    </div>
  );
}
