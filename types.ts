
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_CHIEF = 'SITE_CHIEF',
  PROCUREMENT = 'PROCUREMENT',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  SUPERVISOR = 'SUPERVISOR'
}

export enum WorkItemStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  NEED_INFO = 'NEED_INFO',
  REJECTED = 'REJECTED',
  APPROVED_L1 = 'APPROVED_L1',
  APPROVED_L2 = 'APPROVED_L2',
  APPROVED_FINAL = 'APPROVED_FINAL',
  ORDERED = 'ORDERED',
  DELIVERED = 'DELIVERED',
  INVOICED = 'INVOICED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
  APPROVED = 'APPROVED',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum WorkItemType {
  MATERIAL = 'MATERIAL',
  SERVICE = 'SERVICE',
  EXPENSE = 'EXPENSE',
  ADVANCE = 'ADVANCE',
  TASK = 'TASK',
  REQUEST = 'REQUEST',
  SITE_APPROVAL = 'SITE_APPROVAL'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PLANNING = 'PLANNING',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED'
}

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  PLANNING = 'PLANNING',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

export enum RequestType {
  PURCHASE = 'PURCHASE',
  ADVANCE = 'ADVANCE',
  SERVICE = 'SERVICE'
}

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  code: string;
  status: ProjectStatus;
  startDate: string;
  totalBudget: number;
  clientName: string;
  locationCity: string;
  primaryManagerId: string;
}

export interface Site {
  id: string;
  projectId: string;
  name: string;
  siteCode: string;
  code: string;
  status: SiteStatus;
  budgetMonthlyLimit: number;
  fieldTeam: string[];
  leadUserId: string;
  riskLevel: 'LOW' | 'MED' | 'HIGH';
}

export interface Budget {
  id: string;
  scopeId: string;
  scopeType: 'SITE' | 'PROJECT';
  amount: number;
  consumed: number;
  period: string;
  overLimitRoleRequired: Role;
}

export interface Message {
  id: string;
  channelId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: string[];
  parentId?: string;
  isBotMessage?: boolean;
  botData?: BotContent;
  linkedWorkItemId?: string;
  replyCount?: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  assignees: string[];
  checklists: {
    id: string;
    items: {
      id: string;
      title: string;
      isDone: boolean;
    }[];
  }[];
}

export interface List {
  id: string;
  name: string;
}

export interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'reaction' | 'info';
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface FinancialTransaction {
  id: string;
  projectId: string;
  siteId: string;
  type: 'EXPENSE' | 'INCOME';
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
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

export interface WorkflowStep {
  id: string;
  stepNo: number;
  mode: 'ROLE' | 'USER';
  roleRequired: Role;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requireNote: boolean;
  userId?: string;
  decidedAt?: string;
  note?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  appliesTo: RequestType;
  isActive: boolean;
  steps: WorkflowStep[];
  conditions: {
    field: string;
    operator: '>' | '<' | '==';
    value: any;
  }[];
}

export type RaciRole = 'R' | 'A' | 'C' | 'I';

export interface RaciEntry {
  workItemId: string;
  userId: string;
  role: RaciRole;
}

export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: Priority;
  projectId: string;
  siteId: string;
  createdBy: string;
  assigneeId?: string;
  amount: number;
  currency: string;
  quantity?: number;
  unit?: string;
  requestedDate: string;
  deadline?: string;
  tags: string[];
  attachments: Attachment[];
  timeline: TimelineEvent[];
  procurementData?: {
    poNumber?: string;
    orderDate?: string;
    deliveryDate?: string;
    vendorName?: string;
    offers?: Attachment[];
  };
  invoice?: {
    cariName?: string;
    invoiceNo: string;
    invoiceDate: string;
    currency: string;
    netAmount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    dueDate?: string;
    attachments: Attachment[];
  };
  payment?: {
    paymentStatus: 'PLANNED' | 'PAID';
    paidDate?: string;
    paidAmount?: number;
    paymentNote?: string;
    linkedCashTxnId?: string;
  };
  updatedAt?: string;
  companyId?: string;
  progress?: number;
  createdAt: string;
  // Added fields to resolve missing property errors
  requestData?: {
    amount: number;
    currency: string;
    category: string;
    costCenter?: string;
    type?: RequestType;
    items?: any[];
    approvalChain: {
      stepNo: number;
      roleRequired: Role;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      userId?: string;
      decidedAt?: string;
      note?: string;
    }[];
    vendor?: string;
  };
  raci?: RaciEntry[];
}

export interface CashAccount {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CARD';
  currency: string;
}

export interface CashTxn {
  id: string;
  projectId: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  amount: number;
  currency: string;
  date: string;
  accountId: string;
  toAccountId?: string;
  category: string;
  counterpartyName?: string;
  description: string;
  workItemId?: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  status: 'POSTED' | 'CANCELLED';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  createdAt: string;
  size: number;
}

export interface TimelineEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'COMMENT' | 'SYSTEM' | 'APPROVAL' | 'REJECTION' | 'NEED_INFO' | 'PR_CREATED' | 'PAID' | 'INVOICED';
  actorId: string;
  actorName: string;
  summary: string;
  note?: string;
  timestamp: string;
  metadata?: any;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  companyId: string;
  status: 'online' | 'away' | 'offline';
  allowedProjectIds: string[];
}

export interface MetricSummary {
  pendingApprovals: number;
  activeTasks: number;
  criticalIssues: number;
  activeWorkforce: number;
  totalWorkforce: number;
  financials: {
    approvedExpenses: number;
    pendingExpenses: number;
    totalIncome: number;
    currency: string;
  };
  activeRequests?: number;
  monthlySpend?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  actorId: string;
  actorName: string;
  entityType: 'WORK_ITEM' | 'PROJECT' | 'SITE' | 'USER';
  entityId: string;
  summary: string;
  createdAt: string;
  metadata?: any;
}
