
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
  TASK = 'TASK',
  REQUEST = 'REQUEST',
  INCIDENT = 'INCIDENT',
  REPORT = 'REPORT'
}

export enum WorkItemStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION = 'REVISION',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  departmentId: string;
  companyId: string;
  delegationTo?: string; // Yetki devri yapılan user id
}

export interface Organization {
  id: string;
  name: string;
  type: 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'SITE' | 'PROJECT';
  parentId?: string;
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
  siteId?: string;
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

export interface RequestDetails {
  workItemId: string;
  requestType: 'PURCHASE' | 'ADVANCE' | 'EXPENSE' | 'LEAVE';
  amount: number;
  currency: string;
  neededDate: string;
}

export interface ApprovalStep {
  id: string;
  workItemId: string;
  stepNo: number;
  approverId: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION';
  note?: string;
  decidedAt?: string;
}

export interface ProcurementPO {
  id: string;
  workItemId: string; // İlgili Satınalma Talebi
  vendorId: string;
  poNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CLOSED';
  totalAmount: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  payload: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

// Added missing types
export interface Message {
  id: string;
  channelId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: Record<string, number>;
}

export interface Channel {
  id: string;
  name: string;
  topic?: string;
  isPrivate: boolean;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  assignees: string[];
  checklists: { items: { isDone: boolean }[] }[];
}

export interface List {
  id: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION = 'REVISION'
}

export enum RequestType {
  PURCHASE = 'PURCHASE',
  ADVANCE = 'ADVANCE',
  EXPENSE = 'EXPENSE'
}

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

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string;
}
