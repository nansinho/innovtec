-- ============================================
-- INNOVTEC Réseaux - Intranet Database Schema
-- Migration: 001_initial_schema
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'directeur', 'manager', 'collaborateur');
CREATE TYPE user_locale AS ENUM ('fr', 'pt');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE article_category_type AS ENUM ('qse', 'rex', 'info', 'securite', 'blog');
CREATE TYPE severity_level AS ENUM ('faible', 'moyen', 'eleve', 'critique');
CREATE TYPE action_status AS ENUM ('en_cours', 'cloture', 'en_retard', 'annule');
CREATE TYPE priority_level AS ENUM ('basse', 'normale', 'haute', 'urgente');
CREATE TYPE event_type AS ENUM ('formation', 'reunion', 'visite', 'deadline', 'conge');
CREATE TYPE formation_type AS ENUM ('presentiel', 'elearning', 'mixte');
CREATE TYPE formation_status AS ENUM ('planifiee', 'en_cours', 'terminee', 'annulee');
CREATE TYPE enrollment_status AS ENUM ('inscrit', 'en_cours', 'termine', 'abandonne');
CREATE TYPE document_status AS ENUM ('brouillon', 'en_attente', 'signe', 'refuse', 'archive');
CREATE TYPE leave_type AS ENUM ('conge_paye', 'rtt', 'maladie', 'sans_solde', 'autre');
CREATE TYPE approval_status AS ENUM ('en_attente', 'approuve', 'refuse');
CREATE TYPE policy_status AS ENUM ('draft', 'active', 'archived');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'collaborateur',
  team_id UUID,
  position TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  locale user_locale DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TEAMS
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  color TEXT DEFAULT '#0052CC',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- ============================================
-- ARTICLE CATEGORIES
-- ============================================
CREATE TABLE article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#0052CC',
  type article_category_type DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ARTICLES / ACTUALITES
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES article_categories(id),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  status article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC);

-- Full text search
ALTER TABLE articles ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'C')
  ) STORED;
CREATE INDEX idx_articles_fts ON articles USING gin(fts);

-- ============================================
-- ARTICLE COMMENTS
-- ============================================
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- QSE POLICIES
-- ============================================
CREATE TABLE qse_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  version TEXT DEFAULT '1.0',
  status policy_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SAFETY REPORTS (Situations Dangereuses)
-- ============================================
CREATE TABLE safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  severity severity_level DEFAULT 'moyen',
  status action_status DEFAULT 'en_cours',
  photos TEXT[],
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACTION PLANS
-- ============================================
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status action_status DEFAULT 'en_cours',
  priority priority_level DEFAULT 'normale',
  due_date DATE,
  responsible_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  attachments TEXT[],
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_action_plans_status ON action_plans(status);
CREATE INDEX idx_action_plans_due ON action_plans(due_date);

-- ============================================
-- REX REPORTS
-- ============================================
CREATE TABLE rex_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  causes TEXT,
  actions_taken TEXT,
  lessons_learned TEXT,
  photos TEXT[],
  author_id UUID REFERENCES profiles(id) NOT NULL,
  category_id UUID REFERENCES article_categories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SSE METRICS
-- ============================================
CREATE TABLE sse_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  target NUMERIC,
  unit TEXT DEFAULT '%',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year, metric_name)
);

CREATE INDEX idx_sse_metrics_period ON sse_metrics(year, month);

-- ============================================
-- EVENTS (Planning)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type event_type NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_team ON events(team_id);

-- ============================================
-- FORMATIONS
-- ============================================
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type formation_type DEFAULT 'presentiel',
  duration_hours INTEGER,
  max_participants INTEGER,
  status formation_status DEFAULT 'planifiee',
  start_date DATE,
  end_date DATE,
  location TEXT,
  instructor TEXT,
  documents TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FORMATION ENROLLMENTS
-- ============================================
CREATE TABLE formation_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status enrollment_status DEFAULT 'inscrit',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  UNIQUE(formation_id, user_id)
);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  status document_status DEFAULT 'brouillon',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SIGNATURE REQUESTS
-- ============================================
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  due_date DATE,
  status document_status DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- SIGNATURE ITEMS
-- ============================================
CREATE TABLE signature_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES profiles(id) NOT NULL,
  status document_status DEFAULT 'en_attente',
  signed_at TIMESTAMPTZ,
  signature_data TEXT,
  rejection_reason TEXT,
  order_index INTEGER DEFAULT 0,
  UNIQUE(request_id, signer_id)
);

-- ============================================
-- GALLERIES
-- ============================================
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LEAVE REQUESTS
-- ============================================
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status approval_status DEFAULT 'en_attente',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EXPENSE REPORTS
-- ============================================
CREATE TABLE expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  receipt_url TEXT,
  status approval_status DEFAULT 'en_attente',
  approved_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);

-- ============================================
-- GLOBAL SEARCH VIEW
-- ============================================
CREATE OR REPLACE VIEW global_search AS
  SELECT id, 'article' as type, title, excerpt as description, slug as link,
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(excerpt, '')), 'B') as fts
  FROM articles WHERE status = 'published'
  UNION ALL
  SELECT id, 'collaborateur' as type, first_name || ' ' || last_name as title, position as description, id::text as link,
    to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(position, '')) as fts
  FROM profiles WHERE is_active = true
  UNION ALL
  SELECT id, 'formation' as type, title, description, id::text as link,
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '')) as fts
  FROM formations
  UNION ALL
  SELECT id, 'plan_action' as type, title, description, id::text as link,
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '')) as fts
  FROM action_plans;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rex_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (is_active = true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Articles
CREATE POLICY "articles_select_published" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "articles_select_own" ON articles FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "articles_insert" ON articles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
);
CREATE POLICY "articles_update_own" ON articles FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (user_id = auth.uid());

-- Signature items
CREATE POLICY "signature_items_own" ON signature_items FOR SELECT USING (signer_id = auth.uid());
CREATE POLICY "signature_items_update_own" ON signature_items FOR UPDATE USING (signer_id = auth.uid());

-- Leave requests
CREATE POLICY "leave_own" ON leave_requests FOR ALL USING (user_id = auth.uid());

-- Events
CREATE POLICY "events_select" ON events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager'))
);

-- Safety reports, action plans, rex
CREATE POLICY "safety_select" ON safety_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "safety_insert" ON safety_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "action_plans_select" ON action_plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rex_select" ON rex_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rex_insert" ON rex_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Formations
CREATE POLICY "formations_select" ON formations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "enrollments_select" ON formation_enrollments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "enrollments_own" ON formation_enrollments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Documents
CREATE POLICY "documents_select" ON documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "signature_requests_select" ON signature_requests FOR SELECT USING (auth.uid() IS NOT NULL);

-- Expense reports
CREATE POLICY "expense_own" ON expense_reports FOR ALL USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_qse_policies_updated_at BEFORE UPDATE ON qse_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_safety_reports_updated_at BEFORE UPDATE ON safety_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_action_plans_updated_at BEFORE UPDATE ON action_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rex_reports_updated_at BEFORE UPDATE ON rex_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO article_categories (name, slug, color, type) VALUES
  ('QSE', 'qse', '#D14900', 'qse'),
  ('REX', 'rex', '#00875A', 'rex'),
  ('Info', 'info', '#0052CC', 'info'),
  ('Sécurité', 'securite', '#FF5630', 'securite'),
  ('Blog', 'blog', '#6B21A8', 'blog');
