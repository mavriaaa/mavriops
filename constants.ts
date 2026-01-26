
import { Role, User, WorkItemType, WorkItemStatus, Priority, WorkItem, Organization, Channel, Board, List, Card, Request, RequestType, RequestStatus, Task } from './types';

export const MOCK_ORG: Organization[] = [
  { id: 'comp-1', name: 'Mavri Global Corp', type: 'COMPANY' },
  { id: 'dept-1', name: 'Operations', type: 'DEPARTMENT', parentId: 'comp-1' },
  { id: 'site-a', name: 'Istanbul North Site', type: 'SITE', parentId: 'comp-1' },
  { id: 'proj-x', name: 'North Bridge Construction', type: 'PROJECT', parentId: 'site-a' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Serdar CEO', role: Role.OWNER, avatar: 'https://i.pravatar.cc/150?u=serdar', departmentId: 'dept-1', companyId: 'comp-1' },
  { id: 'u2', name: 'Deniz Manager', role: Role.MANAGER, avatar: 'https://i.pravatar.cc/150?u=deniz', departmentId: 'dept-1', companyId: 'comp-1' },
  { id: 'u3', name: 'Canan Procurement', role: Role.PROCUREMENT, avatar: 'https://i.pravatar.cc/150?u=canan', departmentId: 'dept-1', companyId: 'comp-1' },
  { id: 'u4', name: 'Barış Engineer', role: Role.EMPLOYEE, avatar: 'https://i.pravatar.cc/150?u=baris', departmentId: 'dept-1', companyId: 'comp-1' },
];

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'WI-1001',
    type: WorkItemType.REQUEST,
    title: 'Acil Beton Satınalma - Site A',
    description: 'Köprü ayakları için 200m3 C30 beton ihtiyacı.',
    status: WorkItemStatus.IN_REVIEW,
    priority: Priority.CRITICAL,
    createdBy: 'u4',
    assigneeId: 'u2',
    companyId: 'comp-1',
    siteId: 'site-a',
    projectId: 'proj-x',
    dueDate: '2024-05-20',
    createdAt: new Date().toISOString(),
    tags: ['Procurement', 'Material']
  },
  {
    id: 'WI-2002',
    type: WorkItemType.TASK,
    title: 'Haftalık Ekipman Bakımı',
    description: 'Ekskavatörlerin rutin yağ ve filtre değişimi.',
    status: WorkItemStatus.TODO,
    priority: Priority.MEDIUM,
    createdBy: 'u2',
    assigneeId: 'u4',
    companyId: 'comp-1',
    siteId: 'site-a',
    createdAt: new Date().toISOString(),
    tags: ['Maintenance']
  }
];

// Added missing mock data
export const MOCK_CHANNELS: Channel[] = [
  { id: 'c1', name: 'general', topic: 'General discussion', isPrivate: false },
  { id: 'c2', name: 'announcements', topic: 'Important updates', isPrivate: false },
];

export const MOCK_BOARDS: Board[] = [
  { id: 'b1', name: 'Main Project Board' }
];

export const MOCK_LISTS: List[] = [
  { id: 'l1', name: 'ToDo' },
  { id: 'l2', name: 'In Progress' },
  { id: 'l3', name: 'Done' }
];

export const MOCK_CARDS: Card[] = [
  { id: 'ca1', listId: 'l1', title: 'Foundations Check', assignees: ['u4'], checklists: [{ items: [{ isDone: false }] }] }
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: 'REQ-1001',
    requesterId: 'u4',
    title: 'New Excavator Rental',
    description: 'Site B needs extra capacity for earthworks.',
    type: RequestType.PURCHASE,
    status: RequestStatus.SUBMITTED,
    amount: 12000,
    currency: 'USD',
    siteId: 'site-a',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_TASKS: Task[] = [
  { id: 'T-1', title: 'Weekly Site Audit', status: 'TODO', priority: 'HIGH', assigneeId: 'u4' }
];
