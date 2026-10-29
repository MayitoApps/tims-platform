export type CampaignStatus = 'ideation' | 'in_production' | 'review' | 'ready' | 'active' | 'completed';

export type LeadStage = 'prospect' | 'mql_qualified' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export type ExternalPlatform = 'figma' | 'drive' | 'canva' | 'dropbox' | 'other';

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  platform: ExternalPlatform;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'marketing' | 'sales' | 'admin';
  initials: string;
}

export interface Campaign {
  id: string;
  code: string; // e.g. "CMP-2026-01"
  title: string;
  description: string;
  status: CampaignStatus;
  leadOwner: UserProfile;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  channels: string[];
  externalLinks: ExternalLink[];
  tasksCount: number;
  completedTasksCount: number;
  leadsGenerated: number;
}

export interface MarketingTask {
  id: string;
  campaignId: string;
  campaignTitle: string;
  title: string;
  phase: 'brief' | 'copywriting' | 'design' | 'review' | 'approved';
  assignee: UserProfile;
  dueDate: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  externalLinks: ExternalLink[];
}

export interface SalesLead {
  id: string;
  code: string; // e.g. "LED-104"
  contactName: string;
  company: string;
  email: string;
  phone: string;
  stage: LeadStage;
  dealValue: number;
  sourceCampaignId?: string;
  sourceCampaignTitle?: string;
  assignedRep: UserProfile;
  qualifiedByMarketing: boolean;
  notes: string;
  lastContactDate: string;
  nextFollowUpDate: string;
}

export interface SalesAsset {
  id: string;
  title: string;
  category: 'one_pager' | 'deck' | 'case_study' | 'pricing' | 'video' | 'guidelines';
  platform: ExternalPlatform;
  url: string;
  description: string;
  updatedAt: string;
  version: string;
  author: string;
}

export interface BriefDoc {
  id: string;
  campaignId: string;
  title: string;
  subtitle: string;
  objective: string;
  targetAudience: string;
  valueProposition: string;
  keyDeliverables: string[];
  timelineNotes: string;
  author: UserProfile;
  lastModified: string;
}
