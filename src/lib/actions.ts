'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// ARTICLES
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
  revalidatePath('/actualites');
  return article;
}

export async function updateArticle(id: string, data: {
  title?: string;
  content?: string;
  excerpt?: string;
  category_id?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: article, error } = await supabase
    .from('articles')
    .update({
      ...data,
      published_at: data.status === 'published' ? new Date().toISOString() : undefined,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/actualites');
  return article;
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/actualites');
}

// ============================================
// SAFETY REPORTS
// ============================================
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
  revalidatePath('/qse/situations-dangereuses');
  return report;
}

export async function updateSafetyReport(id: string, data: {
  title?: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  assigned_to?: string;
}) {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.status === 'cloture') {
    updateData.resolved_at = new Date().toISOString();
  }
  const { data: report, error } = await supabase
    .from('safety_reports')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/qse/situations-dangereuses');
  return report;
}

// ============================================
// ACTION PLANS
// ============================================
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
  revalidatePath('/qse/plans-actions');
  return plan;
}

export async function updateActionPlan(id: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  responsible_id?: string;
  team_id?: string;
}) {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.status === 'cloture') {
    updateData.closed_at = new Date().toISOString();
  }
  const { data: plan, error } = await supabase
    .from('action_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/qse/plans-actions');
  return plan;
}

// ============================================
// REX REPORTS
// ============================================
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
  revalidatePath('/qse/rex');
  return report;
}

export async function updateRexReport(id: string, data: {
  title?: string;
  description?: string;
  causes?: string;
  actions_taken?: string;
  lessons_learned?: string;
  category_id?: string;
}) {
  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from('rex_reports')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/qse/rex');
  return report;
}

// ============================================
// EVENTS
// ============================================
export async function createEvent(data: {
  title: string;
  description?: string;
  type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  team_id?: string;
  color?: string;
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
  revalidatePath('/planning');
  return event;
}

export async function updateEvent(id: string, data: {
  title?: string;
  description?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  team_id?: string;
}) {
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/planning');
  return event;
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/planning');
}

// ============================================
// FORMATIONS
// ============================================
export async function createFormation(data: {
  title: string;
  description?: string;
  category?: string;
  type?: string;
  duration_hours?: number;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  instructor?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: formation, error } = await supabase
    .from('formations')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/formations');
  return formation;
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
  revalidatePath('/formations');
  return enrollment;
}

// ============================================
// LEAVE REQUESTS
// ============================================
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
  revalidatePath('/rh');
  return request;
}

export async function updateLeaveRequestStatus(id: string, status: 'approuve' | 'refuse') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('leave_requests')
    .update({ status, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/rh');
}

// ============================================
// EXPENSE REPORTS
// ============================================
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
  revalidatePath('/rh');
  return report;
}

// ============================================
// QSE POLICIES
// ============================================
export async function createQSEPolicy(data: {
  title: string;
  content?: string;
  version?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: policy, error } = await supabase
    .from('qse_policies')
    .insert({ ...data, author_id: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/qse/politique');
  return policy;
}

// ============================================
// DOCUMENTS
// ============================================
export async function createDocument(data: {
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({ ...data, uploaded_by: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/documents');
  return doc;
}

// ============================================
// GALLERIES
// ============================================
export async function createGallery(data: {
  title: string;
  description?: string;
  cover_image?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: gallery, error } = await supabase
    .from('galleries')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/galerie');
  return gallery;
}

export async function createGalleryPhoto(data: {
  gallery_id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: photo, error } = await supabase
    .from('gallery_photos')
    .insert({ ...data, uploaded_by: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/galerie');
  return photo;
}

// ============================================
// SIGNATURE REQUESTS
// ============================================
export async function createSignatureRequest(data: {
  document_id: string;
  title: string;
  message?: string;
  due_date?: string;
  signer_ids: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: request, error } = await supabase
    .from('signature_requests')
    .insert({
      document_id: data.document_id,
      requested_by: user.id,
      title: data.title,
      message: data.message,
      due_date: data.due_date,
    })
    .select()
    .single();

  if (error) throw error;

  // Create signature items for each signer
  if (request && data.signer_ids.length > 0) {
    const items = data.signer_ids.map((signerId, index) => ({
      request_id: request.id,
      signer_id: signerId,
      order_index: index,
    }));

    const { error: itemsError } = await supabase
      .from('signature_items')
      .insert(items);

    if (itemsError) throw itemsError;
  }

  revalidatePath('/signatures');
  return request;
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
  revalidatePath('/signatures');
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
  revalidatePath('/signatures');
}

// ============================================
// SSE METRICS
// ============================================
export async function upsertSSEMetric(data: {
  month: number;
  year: number;
  metric_name: string;
  value: number;
  target?: number;
  unit?: string;
}) {
  const supabase = await createClient();
  const { data: metric, error } = await supabase
    .from('sse_metrics')
    .upsert(data, { onConflict: 'month,year,metric_name' })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/qse/tableau-sse');
  return metric;
}
