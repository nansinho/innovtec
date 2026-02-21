'use client';

import { useState } from 'react';
import {
  Search,
  Shield,
  Users,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Camera,
} from 'lucide-react';
import { cn, getAvatarGradient, getInitials, getRoleLabel } from '@/lib/utils';
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton, EmptyState } from '@/components/ui/DataStates';
import { PageBanner } from '@/components/ui/PageBanner';
import { updateUserRole, updateUserStatus, adminUpdateProfile } from '@/lib/actions';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-700' },
  { value: 'directeur', label: 'Directeur', color: 'bg-blue-100 text-blue-700' },
  { value: 'manager', label: 'Manager', color: 'bg-amber-100 text-amber-700' },
  { value: 'collaborateur', label: 'Collaborateur', color: 'bg-emerald-100 text-emerald-700' },
];

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingUser, setEditingUser] = useState<Record<string, any> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: profiles, loading, refetch } = useSupabaseQuery(
    (supabase) =>
      supabase
        .from('profiles')
        .select('*, team:teams(*)')
        .order('last_name'),
  );

  const { data: teams } = useSupabaseQuery(
    (supabase) => supabase.from('teams').select('id, name').order('name'),
  );

  const allProfiles = (profiles || []) as Record<string, any>[];
  const allTeams = (teams || []) as Record<string, any>[];

  const filteredProfiles = allProfiles.filter((profile) => {
    const firstName = (profile.first_name as string) || '';
    const lastName = (profile.last_name as string) || '';
    const email = (profile.email as string) || '';
    const position = (profile.position as string) || '';
    const role = (profile.role as string) || 'collaborateur';
    const isActive = profile.is_active as boolean;

    const matchesSearch =
      searchQuery === '' ||
      `${firstName} ${lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: allProfiles.length,
    active: allProfiles.filter((p) => p.is_active).length,
    admin: allProfiles.filter((p) => p.role === 'admin').length,
    manager: allProfiles.filter((p) => p.role === 'manager' || p.role === 'directeur').length,
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast('Rôle mis à jour avec succès', 'success');
      refetch();
    } catch {
      toast('Erreur lors de la mise à jour du rôle', 'error');
    }
    setOpenMenuId(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast(
        !currentStatus ? 'Utilisateur activé' : 'Utilisateur désactivé',
        'success'
      );
      refetch();
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    }
    setOpenMenuId(null);
  };

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await adminUpdateProfile(editingUser.id as string, {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        position: formData.get('position') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        role: formData.get('role') as string,
        team_id: formData.get('team_id') as string || undefined,
      });
      toast('Profil mis à jour avec succès', 'success');
      setShowEditModal(false);
      setEditingUser(null);
      refetch();
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (profile: Record<string, any>) => {
    setEditingUser(profile);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  if (loading) return <PageSkeleton variant="table" overlapping />;

  return (
    <div className="space-y-6">
      <PageBanner
        icon={Shield}
        title="Administration"
        subtitle="Gestion des utilisateurs et des rôles"
        overlapping
      />

      {/* Stats - overlapping the banner */}
      <div className="-mt-20 relative z-10 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          {[
            { label: 'Total utilisateurs', value: stats.total, color: 'text-primary', bg: 'bg-primary-50', icon: Users },
            { label: 'Actifs', value: stats.active, color: 'text-success', bg: 'bg-emerald-50', icon: CheckCircle2 },
            { label: 'Administrateurs', value: stats.admin, color: 'text-red-600', bg: 'bg-red-50', icon: Shield },
            { label: 'Managers / Directeurs', value: stats.manager, color: 'text-amber-600', bg: 'bg-amber-50', icon: Building2 },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-white/80 p-4" style={{ animationDelay: `${i * 80}ms`, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
                    <StatIcon size={16} className={stat.color} />
                  </div>
                </div>
                <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
                <div className="text-xs text-text-muted font-medium mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">Tous les rôles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="input w-auto text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary">
        {filteredProfiles.length} utilisateur{filteredProfiles.length > 1 ? 's' : ''}
      </p>

      {/* Users table */}
      {filteredProfiles.length > 0 ? (
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Utilisateur
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Équipe
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Rôle
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const firstName = (profile.first_name as string) || '';
                  const lastName = (profile.last_name as string) || '';
                  const email = (profile.email as string) || '';
                  const phone = (profile.phone as string) || '';
                  const position = (profile.position as string) || '';
                  const team = profile.team as { name: string; color: string } | null;
                  const role = (profile.role as string) || 'collaborateur';
                  const isActive = profile.is_active as boolean;
                  const avatarUrl = profile.avatar_url as string | null;
                  const gradient = getAvatarGradient(firstName + lastName);
                  const initials = getInitials(firstName, lastName);
                  const roleConfig = ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[3];

                  return (
                    <tr
                      key={profile.id as string}
                      className={cn(
                        'border-b border-border-light hover:bg-gray-50 transition-colors',
                        !isActive && 'opacity-60'
                      )}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`${firstName} ${lastName}`}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                          ) : (
                            <div className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ring-2 ring-white',
                              gradient
                            )}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-text-primary">
                              {firstName} {lastName}
                            </div>
                            <div className="text-xs text-text-muted">{position || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Mail size={12} className="text-text-muted" />
                            {email}
                          </div>
                          {phone && (
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <Phone size={12} className="text-text-muted" />
                              {phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {team ? (
                          <span
                            className="badge text-white text-[10px]"
                            style={{ backgroundColor: team.color || '#0052CC' }}
                          >
                            {team.name}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('badge', roleConfig.color)}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'badge',
                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        )}>
                          {isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === (profile.id as string) ? null : (profile.id as string))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors mx-auto"
                          >
                            <MoreVertical size={16} className="text-text-secondary" />
                          </button>
                          {openMenuId === (profile.id as string) && (
                            <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-border bg-white shadow-lg py-1 animate-fade-in">
                              <button
                                onClick={() => openEdit(profile)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                              >
                                <Edit3 size={14} />
                                Modifier le profil
                              </button>
                              <div className="border-t border-border-light my-1" />
                              <div className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wide">
                                Changer le rôle
                              </div>
                              {ROLE_OPTIONS.map((r) => (
                                <button
                                  key={r.value}
                                  onClick={() => handleRoleChange(profile.id as string, r.value)}
                                  className={cn(
                                    'flex w-full items-center gap-2 px-4 py-1.5 text-sm transition-colors',
                                    role === r.value
                                      ? 'bg-primary-50 text-primary font-medium'
                                      : 'text-text-secondary hover:bg-gray-50'
                                  )}
                                >
                                  {role === r.value && <CheckCircle2 size={12} />}
                                  <span className={role === r.value ? '' : 'ml-5'}>{r.label}</span>
                                </button>
                              ))}
                              <div className="border-t border-border-light my-1" />
                              <button
                                onClick={() => handleToggleStatus(profile.id as string, isActive)}
                                className={cn(
                                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                                  isActive
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                )}
                              >
                                {isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                {isActive ? 'Désactiver' : 'Activer'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState message="Aucun utilisateur trouvé" description="Modifiez vos filtres pour voir les utilisateurs." />
      )}

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditingUser(null); }} title="Modifier l'utilisateur" size="lg">
        {editingUser && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Prénom *</label>
                <input name="first_name" required className="input w-full" defaultValue={editingUser.first_name as string} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nom *</label>
                <input name="last_name" required className="input w-full" defaultValue={editingUser.last_name as string} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
              <input name="email" type="email" required className="input w-full" defaultValue={editingUser.email as string} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Poste</label>
                <input name="position" className="input w-full" defaultValue={(editingUser.position as string) || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Téléphone</label>
                <input name="phone" className="input w-full" defaultValue={(editingUser.phone as string) || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Rôle</label>
                <select name="role" className="input w-full" defaultValue={(editingUser.role as string) || 'collaborateur'}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Équipe</label>
                <select name="team_id" className="input w-full" defaultValue={(editingUser.team_id as string) || ''}>
                  <option value="">-- Sélectionner --</option>
                  {allTeams.map((t) => (
                    <option key={t.id as string} value={t.id as string}>{t.name as string}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
              <button type="button" onClick={() => { setShowEditModal(false); setEditingUser(null); }} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
