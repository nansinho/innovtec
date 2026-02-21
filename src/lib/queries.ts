'use server';

import { createClient } from '@/lib/supabase/server';

// ============================================
// PROFILES
// ============================================
export async function getProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, team:teams(*)')
    .eq('is_active', true)
    .order('last_name');
  if (error) throw error;
  return data;
}

export async function getProfileById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, team:teams(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================
// TEAMS
// ============================================
export async function getTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*, manager:profiles!teams_manager_id_fkey(*)')
    .order('name');
  if (error) throw error;
  return data;
}

// ============================================
// ARTICLES
// ============================================
export async function getArticles(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('articles')
    .select('*, category:article_categories(*), author:profiles!articles_author_id_fkey(*)')
    .order('published_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getArticleCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('article_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getArticleComments(articleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('article_comments')
    .select('*, author:profiles!article_comments_author_id_fkey(*)')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// QSE POLICIES
// ============================================
export async function getQSEPolicies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('qse_policies')
    .select('*, author:profiles!qse_policies_author_id_fkey(*)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// SAFETY REPORTS
// ============================================
export async function getSafetyReports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('safety_reports')
    .select('*, reporter:profiles!safety_reports_reporter_id_fkey(*), assignee:profiles!safety_reports_assigned_to_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// ACTION PLANS
// ============================================
export async function getActionPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('action_plans')
    .select('*, responsible:profiles!action_plans_responsible_id_fkey(*), team:teams(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// REX REPORTS
// ============================================
export async function getRexReports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rex_reports')
    .select('*, author:profiles!rex_reports_author_id_fkey(*), category:article_categories(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// SSE METRICS
// ============================================
export async function getSSEMetrics(year?: number) {
  const supabase = await createClient();
  let query = supabase
    .from('sse_metrics')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// EVENTS
// ============================================
export async function getEvents(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('*, team:teams(*)')
    .order('start_date');

  if (startDate) {
    query = query.gte('start_date', startDate);
  }
  if (endDate) {
    query = query.lte('start_date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// FORMATIONS
// ============================================
export async function getFormations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getFormationEnrollments(userId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('formation_enrollments')
    .select('*, formation:formations(*), user:profiles!formation_enrollments_user_id_fkey(*)')
    .order('enrolled_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// DOCUMENTS
// ============================================
export async function getDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*, uploader:profiles!documents_uploaded_by_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// SIGNATURE REQUESTS
// ============================================
export async function getSignatureRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('signature_requests')
    .select('*, document:documents(*), requester:profiles!signature_requests_requested_by_fkey(*), items:signature_items(*, signer:profiles!signature_items_signer_id_fkey(*))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// GALLERIES
// ============================================
export async function getGalleries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('galleries')
    .select('*, photos:gallery_photos(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getGalleryPhotos(galleryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*, uploader:profiles!gallery_photos_uploaded_by_fkey(*)')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// LEAVE REQUESTS
// ============================================
export async function getLeaveRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, user:profiles!leave_requests_user_id_fkey(*), approver:profiles!leave_requests_approved_by_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// EXPENSE REPORTS
// ============================================
export async function getExpenseReports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expense_reports')
    .select('*, user:profiles!expense_reports_user_id_fkey(*), approver:profiles!expense_reports_approved_by_fkey(*)')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// NOTIFICATIONS
// ============================================
export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

// ============================================
// GLOBAL SEARCH
// ============================================
export async function globalSearch(query: string) {
  const supabase = await createClient();
  const searchQuery = query.split(' ').join(' & ');

  const { data, error } = await supabase
    .rpc('search_global', { search_query: searchQuery })
    .limit(20);

  // Fallback if RPC doesn't exist: search individual tables
  if (error) {
    const [articles, profiles, formations, actionPlans] = await Promise.all([
      supabase
        .from('articles')
        .select('id, title, excerpt')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .eq('status', 'published')
        .limit(5),
      supabase
        .from('profiles')
        .select('id, first_name, last_name, position')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(5),
      supabase
        .from('formations')
        .select('id, title, description')
        .ilike('title', `%${query}%`)
        .limit(5),
      supabase
        .from('action_plans')
        .select('id, title, description')
        .ilike('title', `%${query}%`)
        .limit(5),
    ]);

    return [
      ...(articles.data || []).map((a) => ({ id: a.id, type: 'article' as const, title: a.title, description: a.excerpt })),
      ...(profiles.data || []).map((p) => ({ id: p.id, type: 'collaborateur' as const, title: `${p.first_name} ${p.last_name}`, description: p.position })),
      ...(formations.data || []).map((f) => ({ id: f.id, type: 'formation' as const, title: f.title, description: f.description })),
      ...(actionPlans.data || []).map((a) => ({ id: a.id, type: 'plan_action' as const, title: a.title, description: a.description })),
    ];
  }

  return data;
}

// ============================================
// MUTATIONS
// ============================================
export async function createArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  category_id?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const slug = data.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      ...data,
      slug: `${slug}-${Date.now()}`,
      author_id: user.id,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return article;
}

export async function createSafetyReport(data: {
  title: string;
  description?: string;
  location?: string;
  severity?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: report, error } = await supabase
    .from('safety_reports')
    .insert({ ...data, reporter_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function createActionPlan(data: {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  responsible_id?: string;
  team_id?: string;
}) {
  const supabase = await createClient();
  const { data: plan, error } = await supabase
    .from('action_plans')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return plan;
}

export async function createRexReport(data: {
  title: string;
  description?: string;
  causes?: string;
  actions_taken?: string;
  lessons_learned?: string;
  category_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: report, error } = await supabase
    .from('rex_reports')
    .insert({ ...data, author_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function createEvent(data: {
  title: string;
  description?: string;
  type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  team_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: event, error } = await supabase
    .from('events')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return event;
}

export async function createLeaveRequest(data: {
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: request, error } = await supabase
    .from('leave_requests')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function createExpenseReport(data: {
  title: string;
  description?: string;
  amount: number;
  receipt_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: report, error } = await supabase
    .from('expense_reports')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function enrollInFormation(formationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: enrollment, error } = await supabase
    .from('formation_enrollments')
    .insert({ formation_id: formationId, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return enrollment;
}

export async function signDocument(signatureItemId: string, signatureData: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('signature_items')
    .update({
      status: 'signe',
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
    })
    .eq('id', signatureItemId);

  if (error) throw error;
}

export async function rejectDocument(signatureItemId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('signature_items')
    .update({
      status: 'refuse',
      rejection_reason: reason,
    })
    .eq('id', signatureItemId);

  if (error) throw error;
}

// ============================================
// FILE UPLOAD (Supabase Storage)
// ============================================
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}
