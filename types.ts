

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
  INCIDENT = 'INCIDENT'
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

export interface Organization {
  id: string;
  name: string;
  type: 'COMPANY' | 'DEPARTMENT' | 'SITE' | 'PROJECT';
  parentId?: string;
}

export interface Channel {
  id: string;
  name: string;
  topic?: string;
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
    items: { isDone: boolean }[];
  }[];
}

export enum RequestType {
  PURCHASE = 'PURCHASE',
  ADVANCE = 'ADVANCE',
  EXPENSE = 'EXPENSE'
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// --- NEW ENTERPRISE TYPES ---

export enum RaciRole {
  RESPONSIBLE = 'R',
  ACCOUNTABLE = 'A',
  CONSULTED = 'C',
  INFORMED = 'I'
}

export interface WorkItemRaci {
  workItemId: string;
  userId: string;
  role: RaciRole;
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

export interface AuditLog {
  id: string;
  entityId: string;
  actorId: string;
  action: string;
  payload: any;
  timestamp: string;
}

// --- END NEW TYPES ---

// Fix: Added Request interface to satisfy constants.ts imports
export interface Request {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  amount: number;
  currency: string;
  siteId: string;
  createdAt: string;
}

// Fix: Added Task interface to satisfy constants.ts imports
export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string;
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
  projectId?: string;
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
  raci?: WorkItemRaci[]; // Added additive
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
  workItems: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    assignee: string;
    dueDate: string;
    source: string;
  }>;
  actions: Array<{
    task: string;
    assignee: string;
    dueDate: string;
    source: string;
  }>;
  missingInfo: string[];
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
  botData?: BotContent;
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
