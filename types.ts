
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  PROCUREMENT = 'PROCUREMENT',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE'
}

export enum WorkItemType {
  REQUEST = 'REQUEST',
  TASK = 'TASK',
  REPORT = 'REPORT',
  INCIDENT = 'INCIDENT',
  SITE_APPROVAL = 'SITE_APPROVAL'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  SLOW = 'SLOW',
  PLANNING = 'PLANNING',
  CLOSED = 'CLOSED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  clientName?: string;
  locationCity?: string;
  locationDistrict?: string;
  startDate?: string;
  plannedEndDate?: string;
  status: ProjectStatus;
  ownerUserId: string;
  primaryManagerId: string;
  totalBudget: number;
  currency: string;
  managers: string[];
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  siteCode: string;
  projectId: string;
  name: string;
  type: 'GES' | 'INSAAT' | 'LOJISTIK' | 'DEPO' | 'OFIS' | 'DIGER';
  address?: string;
  status: SiteStatus;
  budgetMonthlyLimit: number;
  budgetTotalLimit?: number;
  riskLevel: 'LOW' | 'MED' | 'HIGH';
  leadUserId: string;
  fieldTeam: string[];
  communicationChannelId: string;
  createdAt: string;
  updatedAt: string;
}

export enum WorkItemStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  CANCELLED = 'CANCELLED',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
  OPEN = 'OPEN',
  TRIAGED = 'TRIAGED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: 'tr' | 'en';
  sidebarCollapsed: boolean;
  accentColor: string;
  notificationLevel: 'all' | 'mentions' | 'none';
  defaultLanding: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  departmentId: string;
  companyId: string;
  status: 'online' | 'away' | 'offline';
  preferences?: UserPreferences;
}

export interface MetricSummary {
  pendingApprovals: number;
  activeTasks: number;
  criticalIssues: number;
  completionRate: number;
  totalWorkforce: number;
  activeWorkforce: number;
  financials: {
    approvedExpenses: number;
    pendingExpenses: number;
    totalIncome: number;
    currency: string;
  };
}

export interface TimelineEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'COMMENT' | 'APPROVAL' | 'REJECTION' | 'PR_CREATED' | 'PAH' | 'PAID' | 'SYSTEM' | 'ENTITY_CREATED';
  actorId: string;
  actorName: string;
  summary: string;
  timestamp: string;
  metadata?: any;
}

export interface AuditEvent {
  id: string;
  type: string;
  actorId: string;
  actorName: string;
  entityType: 'REQUEST' | 'TASK' | 'BUDGET' | 'USER' | 'FILE' | 'FINANCE' | 'PROJECT' | 'SITE';
  entityId: string;
  summary: string;
  createdAt: string;
  metadata?: any;
}

export interface FinancialTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  vendor?: string;
  siteId: string;
  projectId: string; // Zorunlu Proje İlişkisi
  recordedBy: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  appliesTo: RequestType;
  isActive: boolean;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
}

export interface WorkflowStep {
  id: string;
  stepNo: number;
  mode: 'ROLE' | 'USER' | 'DYNAMIC';
  roleRequired?: Role;
  userId?: string;
  dynamicKey?: 'SITE_MANAGER' | 'PROJECT_MANAGER';
  slaHours?: number;
  requireNote: boolean;
}

export interface WorkflowCondition {
  field: 'amount' | 'category' | 'siteId';
  operator: '>' | '<' | '==' | 'in';
  value: any;
}

export interface Budget {
  id: string;
  scopeType: 'SITE' | 'PROJECT';
  scopeId: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  amount: number;
  currency: string;
  consumed: number;
  overLimitRoleRequired: Role;
}

export enum RequestType {
  PURCHASE = 'PURCHASE',
  ADVANCE = 'ADVANCE',
  EXPENSE = 'EXPENSE',
  SITE_CREATION = 'SITE_CREATION'
}

export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: Priority;
  createdBy: string;
  assigneeId?: string;
  companyId: string;
  siteId: string;
  projectId: string; // Zorunlu Proje İlişkisi
  dueDate?: string;
  progress?: number;
  attachments: Attachment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  requestData?: any;
  completionNote?: string;
  completedAt?: string;
  completedBy?: string;
  raci?: any[];
  timeline?: TimelineEvent[];
}

export interface Message {
  id: string;
  channelId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: any[];
  parentId?: string;
  linkedWorkItemId?: string;
  attachments?: Attachment[];
  replyCount?: number;
  isBotMessage?: boolean;
  botData?: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  workItemId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'COMPANY' | 'SITE';
  parentId?: string;
}

export interface Channel {
  id: string;
  name: string;
  topic: string;
  isPrivate: boolean;
}

export interface Board {
  id: string;
  name: string;
}

export interface List {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  assignees: string[];
  checklists: {
    id: string;
    items: { id: string; title: string; isDone: boolean }[];
  }[];
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface BotContent {
  summary: {
    overall: string;
    criticalRisk: string;
    pendingApprovals: string;
    overdueTasks: string;
    nextStep: string;
  };
  workItems: {
    id: string;
    title: string;
    status: string;
    source: string;
  }[];
  actions: {
    task: string;
    assignee: string;
    source: string;
  }[];
  missingInfo: string[];
}

export type RaciRole = 'R' | 'A' | 'C' | 'I';
