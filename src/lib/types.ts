// ============================================
// Database Types for INNOVTEC Intranet
// ============================================

export type UserRole = 'admin' | 'directeur' | 'manager' | 'collaborateur';
export type UserLocale = 'fr' | 'pt';
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleCategoryType = 'qse' | 'rex' | 'info' | 'securite' | 'blog';
export type SeverityLevel = 'faible' | 'moyen' | 'eleve' | 'critique';
export type ActionStatus = 'en_cours' | 'cloture' | 'en_retard' | 'annule';
export type PriorityLevel = 'basse' | 'normale' | 'haute' | 'urgente';
export type EventType = 'formation' | 'reunion' | 'visite' | 'deadline' | 'conge';
export type FormationType = 'presentiel' | 'elearning' | 'mixte';
export type FormationStatus = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
export type EnrollmentStatus = 'inscrit' | 'en_cours' | 'termine' | 'abandonne';
export type DocumentStatus = 'brouillon' | 'en_attente' | 'signe' | 'refuse' | 'archive';
export type LeaveType = 'conge_paye' | 'rtt' | 'maladie' | 'sans_solde' | 'autre';
export type ApprovalStatus = 'en_attente' | 'approuve' | 'refuse';
export type PolicyStatus = 'draft' | 'active' | 'archived';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: UserRole;
  team_id: string | null;
  position: string | null;
  phone: string | null;
  is_active: boolean;
  locale: UserLocale;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  color: string;
  created_at: string;
  manager?: Profile;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  type: ArticleCategoryType;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_id: string;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: ArticleCategory;
  author?: Profile;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface QSEPolicy {
  id: string;
  title: string;
  content: string | null;
  version: string;
  status: PolicyStatus;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface SafetyReport {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  severity: SeverityLevel;
  status: ActionStatus;
  photos: string[];
  reporter_id: string;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  assignee?: Profile;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  status: ActionStatus;
  priority: PriorityLevel;
  due_date: string | null;
  responsible_id: string | null;
  team_id: string | null;
  attachments: string[];
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  responsible?: Profile;
  team?: Team;
}

export interface RexReport {
  id: string;
  title: string;
  description: string | null;
  causes: string | null;
  actions_taken: string | null;
  lessons_learned: string | null;
  photos: string[];
  author_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ArticleCategory;
}

export interface SSEMetric {
  id: string;
  month: number;
  year: number;
  metric_name: string;
  value: number;
  target: number | null;
  unit: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  team_id: string | null;
  created_by: string;
  color: string | null;
  created_at: string;
  team?: Team;
}

export interface Formation {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: FormationType;
  duration_hours: number | null;
  max_participants: number | null;
  status: FormationStatus;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  instructor: string | null;
  documents: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormationEnrollment {
  id: string;
  formation_id: string;
  user_id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  formation?: Formation;
  user?: Profile;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface SignatureRequest {
  id: string;
  document_id: string;
  requested_by: string;
  title: string;
  message: string | null;
  due_date: string | null;
  status: DocumentStatus;
  created_at: string;
  completed_at: string | null;
  document?: Document;
  items?: SignatureItem[];
}

export interface SignatureItem {
  id: string;
  request_id: string;
  signer_id: string;
  status: DocumentStatus;
  signed_at: string | null;
  signature_data: string | null;
  rejection_reason: string | null;
  order_index: number;
  signer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ExpenseReport {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  amount: number;
  receipt_url: string | null;
  status: ApprovalStatus;
  approved_by: string | null;
  submitted_at: string;
  approved_at: string | null;
}
