'use client';

import { Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

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

/* ────────────────────────────── Skeleton primitives ────────────────────────────── */

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />;
}

export function BannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 p-6 md:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl bg-gray-300" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-gray-300" />
            <Skeleton className="h-4 w-32 bg-gray-300/70" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-button bg-gray-300" />
      </div>
    </div>
  );
}

export function KPICardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn('grid gap-4', count <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14 bg-gray-300" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  const colClass = cols === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : cols === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={cn('grid gap-5', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <Skeleton className="h-1.5 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 bg-gray-300" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-3 border-t border-border-light">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20 rounded-button" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="px-5 py-3 bg-gray-50 border-b border-border-light">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      </div>
      <div className="divide-y divide-border-light">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = 'cards' }: { variant?: 'cards' | 'table' | 'calendar' | 'kanban' }) {
  return (
    <div className="space-y-6">
      <BannerSkeleton />
      <KPICardsSkeleton />
      {variant === 'cards' && <CardGridSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'calendar' && (
        <div className="card p-5 animate-pulse">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      )}
      {variant === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, col) => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-6 w-28" />
              {Array.from({ length: 3 }).map((_, row) => (
                <div key={row} className="card p-4 animate-pulse space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
