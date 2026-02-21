-- =============================================
-- Migration: 004_fix_missing_rls_policies
-- Fix: Add missing INSERT/UPDATE policies for
-- action_plans, formations, sse_metrics, events,
-- galleries, gallery_photos, documents,
-- qse_policies, teams, article_categories
-- These missing policies caused all "create"
-- operations to fail silently.
-- =============================================

-- ============================================
-- ACTION PLANS - Missing INSERT & UPDATE
-- ============================================
CREATE POLICY "action_plans_insert" ON action_plans
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "action_plans_update" ON action_plans
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- FORMATIONS - Missing INSERT & UPDATE
-- ============================================
CREATE POLICY "formations_insert" ON formations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
  );

CREATE POLICY "formations_update" ON formations
  FOR UPDATE USING (
    created_by = auth.uid() OR public.is_admin()
  );

-- ============================================
-- SSE METRICS - RLS not enabled, add policies
-- ============================================
ALTER TABLE sse_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sse_metrics_select" ON sse_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sse_metrics_insert" ON sse_metrics
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
  );

CREATE POLICY "sse_metrics_update" ON sse_metrics
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
  );

-- ============================================
-- TEAMS - RLS not enabled, add policies
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select" ON teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teams_insert" ON teams
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "teams_update" ON teams
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- ARTICLE CATEGORIES - RLS not enabled
-- ============================================
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_categories_select" ON article_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- GALLERIES - RLS not enabled, add policies
-- ============================================
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "galleries_select" ON galleries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "galleries_insert" ON galleries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_photos_select" ON gallery_photos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "gallery_photos_insert" ON gallery_photos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- QSE POLICIES - RLS not enabled
-- ============================================
ALTER TABLE qse_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qse_policies_select" ON qse_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "qse_policies_insert" ON qse_policies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
  );

-- ============================================
-- DOCUMENTS - Missing INSERT policy
-- ============================================
CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (uploaded_by = auth.uid() OR public.is_admin());

-- ============================================
-- SIGNATURE REQUESTS - Missing INSERT
-- ============================================
CREATE POLICY "signature_requests_insert" ON signature_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SIGNATURE ITEMS - Missing INSERT
-- ============================================
CREATE POLICY "signature_items_insert" ON signature_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- REX REPORTS - Missing UPDATE
-- ============================================
CREATE POLICY "rex_update" ON rex_reports
  FOR UPDATE USING (author_id = auth.uid() OR public.is_admin());

-- ============================================
-- SAFETY REPORTS - Missing UPDATE
-- ============================================
CREATE POLICY "safety_update" ON safety_reports
  FOR UPDATE USING (reporter_id = auth.uid() OR public.is_admin());

-- ============================================
-- EVENTS - Missing UPDATE and DELETE
-- ============================================
CREATE POLICY "events_update" ON events
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (created_by = auth.uid() OR public.is_admin());

-- ============================================
-- AUDIT LOG - Enable RLS
-- ============================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON audit_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_log_insert" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- PROFILES - Allow admin to INSERT (for managing users)
-- ============================================
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid() OR public.is_admin());

-- ============================================
-- PROFILES - Allow admin to DELETE (deactivate)
-- ============================================
CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (public.is_admin());

-- ============================================
-- Enable Supabase Realtime on key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
ALTER PUBLICATION supabase_realtime ADD TABLE action_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE formations;
ALTER PUBLICATION supabase_realtime ADD TABLE safety_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
