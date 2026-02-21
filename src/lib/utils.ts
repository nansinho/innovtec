import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a deterministic color gradient from a string (for avatars)
const AVATAR_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
  'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600',
  'from-rose-500 to-rose-600',
  'from-teal-500 to-teal-600',
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatDate(date: string, locale: string = 'fr'): string {
  return new Date(date).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string, locale: string = 'fr'): string {
  return new Date(date).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRelativeDate(date: string, locale: string = 'fr'): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'pt') {
    if (days > 7) return formatDateShort(date, locale);
    if (days > 1) return `há ${days} dias`;
    if (days === 1) return 'ontem';
    if (hours > 1) return `há ${hours}h`;
    if (minutes > 1) return `há ${minutes}min`;
    return 'agora';
  }

  if (days > 7) return formatDateShort(date, locale);
  if (days > 1) return `il y a ${days} jours`;
  if (days === 1) return 'hier';
  if (hours > 1) return `il y a ${hours}h`;
  if (minutes > 1) return `il y a ${minutes}min`;
  return "à l'instant";
}

export function getCategoryBadgeClass(type: string): string {
  const map: Record<string, string> = {
    qse: 'badge-qse',
    rex: 'badge-rex',
    info: 'badge-info',
    securite: 'badge-securite',
    blog: 'badge-blog',
  };
  return map[type] || 'badge-info';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    en_cours: 'text-blue-600 bg-blue-50',
    cloture: 'text-emerald-600 bg-emerald-50',
    en_retard: 'text-red-600 bg-red-50',
    annule: 'text-gray-500 bg-gray-50',
    en_attente: 'text-amber-600 bg-amber-50',
    signe: 'text-emerald-600 bg-emerald-50',
    refuse: 'text-red-600 bg-red-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    faible: 'text-blue-600 bg-blue-50 border-blue-200',
    moyen: 'text-amber-600 bg-amber-50 border-amber-200',
    eleve: 'text-orange-600 bg-orange-50 border-orange-200',
    critique: 'text-red-600 bg-red-50 border-red-200',
  };
  return map[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getRoleLabel(role: string | null | undefined): string {
  const map: Record<string, string> = {
    admin: 'Administrateur',
    directeur: 'Directeur',
    manager: 'Manager',
    collaborateur: 'Collaborateur',
  };
  return map[role || ''] || 'Collaborateur';
}

export function getRoleBadgeClass(role: string | null | undefined): string {
  const map: Record<string, string> = {
    admin: 'badge-role-admin',
    directeur: 'badge-role-directeur',
    manager: 'badge-role-manager',
    collaborateur: 'badge-role-collaborateur',
  };
  return map[role || ''] || 'badge-role-collaborateur';
}

export function getEventColor(type: string): string {
  const map: Record<string, string> = {
    formation: '#0052CC',
    reunion: '#6B21A8',
    visite: '#FF6B35',
    deadline: '#FF5630',
    conge: '#36B37E',
  };
  return map[type] || '#0052CC';
}
