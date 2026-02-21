'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Monitor,
  MapPin,
  Shuffle,
  Award,
  Filter,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser, useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import type { Formation, FormationEnrollment, FormationType, FormationStatus } from '@/lib/types';

const TYPE_CONFIG: Record<FormationType, { label: string; icon: typeof Monitor; color: string; bg: string }> = {
  presentiel: { label: 'Présentiel', icon: MapPin, color: '#0052CC', bg: 'bg-blue-50 text-blue-700' },
  elearning: { label: 'E-learning', icon: Monitor, color: '#36B37E', bg: 'bg-emerald-50 text-emerald-700' },
  mixte: { label: 'Mixte', icon: Shuffle, color: '#6B21A8', bg: 'bg-purple-50 text-purple-700' },
};

const STATUS_CONFIG: Record<FormationStatus, { label: string; color: string }> = {
  planifiee: { label: 'Planifiée', color: 'bg-blue-50 text-blue-700' },
  en_cours: { label: 'En cours', color: 'bg-primary-50 text-primary' },
  terminee: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-700' },
  annulee: { label: 'Annulée', color: 'bg-gray-100 text-gray-500' },
};

const CATEGORIES = [
  'Toutes',
  'Sécurité',
  'Habilitations',
  'CACES',
  'Management',
  'Technique',
  'Qualité',
];

type Tab = 'catalogue' | 'mes_formations' | 'a_venir' | 'terminees';

const emptyFormData = {
  title: '',
  description: '',
  category: '',
  type: 'presentiel' as FormationType,
  duration_hours: '',
  max_participants: '',
  status: 'planifiee' as FormationStatus,
  start_date: '',
  end_date: '',
  location: '',
  instructor: '',
};

export default function FormationsPage() {
  const t = useTranslations('formations');
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // Admin check
  const isAdmin = user?.role && ['admin', 'directeur', 'manager'].includes(user.role);

  // Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // ─── Data queries ───
  const { data: formations, loading: loadingFormations, refetch: refetchFormations } = useSupabaseQuery<Formation[]>(
    async (supabase) => await supabase
      .from('formations')
      .select('*')
      .order('start_date', { ascending: false }),
    []
  );

  const { data: enrollments, refetch: refetchEnrollments } = useSupabaseQuery<FormationEnrollment[]>(
    async (supabase) => await supabase
      .from('formation_enrollments')
      .select('*, formation:formations(*)')
      .eq('user_id', user?.id ?? '')
      .order('enrolled_at', { ascending: false }),
    [user?.id],
    { enabled: !!user?.id }
  );

  const { data: allEnrollments } = useSupabaseQuery<{ formation_id: string }[]>(
    async (supabase) => await supabase
      .from('formation_enrollments')
      .select('formation_id'),
    []
  );

  // Compute enrollment counts per formation
  const enrollmentCounts: Record<string, number> = {};
  allEnrollments?.forEach((e) => {
    enrollmentCounts[e.formation_id] = (enrollmentCounts[e.formation_id] || 0) + 1;
  });

  // Set of formation IDs user is enrolled in
  const myEnrollmentMap: Record<string, FormationEnrollment> = {};
  enrollments?.forEach((e) => {
    myEnrollmentMap[e.formation_id] = e;
  });

  // ─── Tab filtering ───
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'catalogue', label: t('catalog'), count: formations?.length || 0 },
    { key: 'mes_formations', label: t('myTrainings'), count: enrollments?.filter(e => ['inscrit', 'en_cours'].includes(e.status)).length || 0 },
    { key: 'a_venir', label: t('upcoming'), count: enrollments?.filter(e => e.status === 'inscrit').length || 0 },
    { key: 'terminees', label: t('completed'), count: enrollments?.filter(e => e.status === 'termine').length || 0 },
  ];

  const filteredFormations = (formations || []).filter((formation) => {
    const matchesSearch =
      searchQuery === '' ||
      formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (formation.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (formation.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Toutes' || formation.category === selectedCategory;

    let matchesTab = true;
    switch (activeTab) {
      case 'mes_formations':
        matchesTab = !!myEnrollmentMap[formation.id] && ['inscrit', 'en_cours'].includes(myEnrollmentMap[formation.id].status);
        break;
      case 'a_venir':
        matchesTab = !!myEnrollmentMap[formation.id] && myEnrollmentMap[formation.id].status === 'inscrit';
        break;
      case 'terminees':
        matchesTab = !!myEnrollmentMap[formation.id] && myEnrollmentMap[formation.id].status === 'termine';
        break;
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  const totalHours = (enrollments || [])
    .filter(e => ['en_cours', 'termine'].includes(e.status))
    .reduce((sum, e) => sum + (e.formation?.duration_hours || 0), 0);

  // ─── Handlers ───

  const handleEnroll = async (formationId: string) => {
    if (!user) return;
    setEnrolling(formationId);
    const supabase = createClient();
    const { error } = await supabase
      .from('formation_enrollments')
      .insert({ formation_id: formationId, user_id: user.id });

    if (error) {
      toast(error.message, 'error');
    } else {
      toast(t('enrollSuccess'), 'success');
      await refetchEnrollments();
    }
    setEnrolling(null);
  };

  const openCreateModal = () => {
    setEditingFormation(null);
    setFormData(emptyFormData);
    setShowFormModal(true);
  };

  const openEditModal = (formation: Formation) => {
    setEditingFormation(formation);
    setFormData({
      title: formation.title,
      description: formation.description || '',
      category: formation.category || '',
      type: formation.type,
      duration_hours: formation.duration_hours ? String(formation.duration_hours) : '',
      max_participants: formation.max_participants ? String(formation.max_participants) : '',
      status: formation.status,
      start_date: formation.start_date || '',
      end_date: formation.end_date || '',
      location: formation.location || '',
      instructor: formation.instructor || '',
    });
    setShowFormModal(true);
  };

  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category || null,
      type: formData.type,
      duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      status: formData.status,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      location: formData.location || null,
      instructor: formData.instructor || null,
    };

    if (editingFormation) {
      const { error } = await supabase.from('formations').update(payload).eq('id', editingFormation.id);
      if (error) { toast(error.message, 'error'); }
      else { toast(t('formationUpdated'), 'success'); }
    } else {
      const { error } = await supabase.from('formations').insert({ ...payload, created_by: user.id });
      if (error) { toast(error.message, 'error'); }
      else { toast(t('formationCreated'), 'success'); }
    }

    setShowFormModal(false);
    await refetchFormations();
    setSaving(false);
  };

  const handleDeleteFormation = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    const supabase = createClient();
    const { error } = await supabase.from('formations').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); }
    else { toast(t('formationDeleted'), 'success'); await refetchFormations(); }
  };

  // ─── Loading state ───
  if (loadingFormations) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-button">
            <Award size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{t('totalHours', { hours: totalHours })}</span>
          </div>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              {t('newFormation')}
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: t('availableFormations'), value: (formations || []).filter(f => f.status === 'planifiee').length, color: 'text-primary', bg: 'bg-primary-50' },
          { label: t('inProgress'), value: (formations || []).filter(f => f.status === 'en_cours').length, color: 'text-accent', bg: 'bg-accent-50' },
          { label: t('myEnrollments'), value: (enrollments || []).filter(e => ['inscrit', 'en_cours'].includes(e.status)).length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: t('completed'), value: (formations || []).filter(f => f.status === 'terminee').length, color: 'text-success', bg: 'bg-emerald-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className="text-xs text-text-muted font-medium">{kpi.label}</div>
            <div className={cn('text-2xl font-bold mt-1', kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-light animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              activeTab === tab.key ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-text-muted'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger">
        {filteredFormations.map((formation) => {
          const typeConfig = TYPE_CONFIG[formation.type] || TYPE_CONFIG.presentiel;
          const statusConfig = STATUS_CONFIG[formation.status] || STATUS_CONFIG.planifiee;
          const TypeIcon = typeConfig.icon;
          const currentCount = enrollmentCounts[formation.id] || 0;
          const isFull = formation.max_participants ? currentCount >= formation.max_participants : false;
          const myEnrollment = myEnrollmentMap[formation.id];
          const hasProgress = myEnrollment?.progress !== undefined && myEnrollment.progress > 0;

          return (
            <div
              key={formation.id}
              className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Top color bar */}
              <div className="h-1.5" style={{ backgroundColor: typeConfig.color }} />

              <div className="p-5">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={cn('badge', typeConfig.bg)}>
                    <TypeIcon size={12} className="mr-1" />
                    {typeConfig.label}
                  </span>
                  <span className={cn('badge', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                  {formation.category && (
                    <span className="badge bg-gray-50 text-text-secondary">
                      {formation.category}
                    </span>
                  )}
                </div>

                {/* Title & description */}
                <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {formation.title}
                </h3>
                {formation.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {formation.description}
                  </p>
                )}

                {/* Progress bar for enrolled/in-progress */}
                {hasProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-muted">{t('progress')}</span>
                      <span className="font-semibold text-text-primary">{myEnrollment.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${myEnrollment.progress}%`,
                          backgroundColor: myEnrollment.progress === 100 ? '#36B37E' : '#0052CC',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary mb-4">
                  {formation.duration_hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-text-muted" />
                      <span>{t('hoursShort', { hours: formation.duration_hours })}</span>
                    </div>
                  )}
                  {formation.max_participants && (
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-text-muted" />
                      <span>{currentCount}/{formation.max_participants} places</span>
                    </div>
                  )}
                  {formation.instructor && (
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-text-muted" />
                      <span className="truncate">{formation.instructor}</span>
                    </div>
                  )}
                  {formation.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-text-muted" />
                      <span className="truncate">{formation.location}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="text-xs text-text-muted">
                    {formation.start_date && (
                      <>{t('nextSession')} : {new Date(formation.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Admin actions */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(formation)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFormation(formation.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}

                    {/* User actions */}
                    {!myEnrollment && formation.status !== 'annulee' && formation.status !== 'terminee' && !isFull && (
                      <button
                        onClick={() => handleEnroll(formation.id)}
                        disabled={enrolling === formation.id}
                        className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60"
                      >
                        {enrolling === formation.id ? t('enrolling') : t('enroll')}
                        <ChevronRight size={14} />
                      </button>
                    )}
                    {myEnrollment?.status === 'en_cours' && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        {t('inProgress')}
                      </span>
                    )}
                    {myEnrollment?.status === 'termine' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <Award size={14} />
                        {t('validated')}
                      </span>
                    )}
                    {myEnrollment?.status === 'inscrit' && (
                      <span className="text-xs font-semibold text-amber-600">
                        {t('enrolled')}
                      </span>
                    )}
                    {isFull && !myEnrollment && (
                      <button className="text-xs px-3 py-1.5 rounded-button border border-border text-text-muted cursor-not-allowed" disabled>
                        {t('full')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFormations.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">{t('noFormations')}</p>
        </div>
      )}

      {/* ═══ Formation Create/Edit Modal ═══ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card w-full max-w-2xl mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary">
                {editingFormation ? t('editFormation') : t('newFormation')}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFormation} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formTitle')} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formDescription')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formCategory')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="">—</option>
                    {CATEGORIES.filter(c => c !== 'Toutes').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formType')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FormationType })}
                    className="input"
                  >
                    <option value="presentiel">{t('typePresentiel')}</option>
                    <option value="elearning">{t('typeElearning')}</option>
                    <option value="mixte">{t('typeMixte')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formDuration')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formMaxParticipants')}</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formStatus')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FormationStatus })}
                    className="input"
                  >
                    <option value="planifiee">{t('statusPlanned')}</option>
                    <option value="en_cours">{t('statusInProgress')}</option>
                    <option value="terminee">{t('statusCompleted')}</option>
                    <option value="annulee">{t('statusCancelled')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formStartDate')}</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formEndDate')}</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formLocation')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('formInstructor')}</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t('saving')}</>
                  ) : (
                    <><Save size={16} /> {editingFormation ? t('editFormation') : t('createFormation')}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <X size={16} />
                  {t('allCategories') === 'Toutes' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
