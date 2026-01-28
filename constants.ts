
import { Role, User, WorkItemType, WorkItemStatus, Priority, WorkItem, Organization, Channel, Board, List, Card, Request, RequestType, RequestStatus, Task, Budget, WorkflowDefinition } from './types';

// --- ENTERPRISE FEATURE FLAGS ---
export const ENABLE_WORKFLOW_BUILDER = true; // Set to true for implementation demo
export const ENABLE_BUDGETS = true;
export const ENABLE_RACI = true;

export const MOCK_ORG: Organization[] = [
  { id: 'comp-1', name: 'Mavri Global A.Ş.', type: 'COMPANY' },
  { id: 'dept-1', name: 'Operasyon', type: 'DEPARTMENT', parentId: 'comp-1' },
  { id: 'site-a', name: 'İstanbul Kuzey Şantiyesi', type: 'SITE', parentId: 'comp-1' },
  { id: 'site-b', name: 'Ankara Batı Lojistik', type: 'SITE', parentId: 'comp-1' },
  { id: 'site-c', name: 'İzmir Liman Projesi', type: 'SITE', parentId: 'comp-1' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sinem CEO', role: Role.OWNER, avatar: 'https://i.pravatar.cc/150?u=sinem', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u2', name: 'Deniz Müdür', role: Role.MANAGER, avatar: 'https://i.pravatar.cc/150?u=deniz', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u3', name: 'Canan Satınalma', role: Role.PROCUREMENT, avatar: 'https://i.pravatar.cc/150?u=canan', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u4', name: 'Barış Mühendis', role: Role.EMPLOYEE, avatar: 'https://i.pravatar.cc/150?u=baris', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
];

export const MOCK_BUDGETS: Budget[] = [
  { id: 'b-1', scopeType: 'SITE', scopeId: 'site-a', period: 'MONTHLY', amount: 500000, consumed: 120000, currency: 'TRY', overLimitRoleRequired: Role.OWNER },
  { id: 'b-2', scopeType: 'SITE', scopeId: 'site-b', period: 'MONTHLY', amount: 200000, consumed: 185000, currency: 'TRY', overLimitRoleRequired: Role.DIRECTOR },
];

export const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-1',
    name: 'Yüksek Tutarlı Satınalma',
    appliesTo: RequestType.PURCHASE,
    isActive: true,
    conditions: [
      { field: 'amount', operator: '>', value: 100000 }
    ],
    steps: [
      { id: 'ws-1', stepNo: 1, mode: 'ROLE', roleRequired: Role.MANAGER, requireNote: true },
      { id: 'ws-2', stepNo: 2, mode: 'ROLE', roleRequired: Role.DIRECTOR, requireNote: true },
      { id: 'ws-3', stepNo: 3, mode: 'ROLE', roleRequired: Role.OWNER, requireNote: true },
    ]
  }
];

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'WI-1001',
    type: WorkItemType.REQUEST,
    title: 'Acil Beton Satınalma - Saha A',
    description: 'Köprü ayakları için 200m3 C30 beton ihtiyacı.',
    status: WorkItemStatus.IN_REVIEW,
    priority: Priority.CRITICAL,
    createdBy: 'u4',
    assigneeId: 'u2',
    companyId: 'comp-1',
    siteId: 'site-a',
    dueDate: '2024-05-25',
    progress: 35,
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Satınalma', 'Malzeme'],
    requestData: {
      amount: 450000,
      currency: 'TRY',
      category: 'MALZEME',
      costCenter: 'INS-2024',
      items: [],
      approvalChain: [
        { stepNo: 1, roleRequired: Role.SUPERVISOR, status: 'APPROVED', userId: 'u2', decidedAt: new Date(Date.now() - 86400000).toISOString(), note: 'Miktar projeye uygun, onaylandı.' },
        { stepNo: 2, roleRequired: Role.MANAGER, status: 'PENDING' }
      ]
    },
    raci: [
      { workItemId: 'WI-1001', userId: 'u4', role: 'R' as any },
      { workItemId: 'WI-1001', userId: 'u2', role: 'A' as any }
    ]
  }
];

export const MOCK_CHANNELS: Channel[] = [
  { id: 'c1', name: 'genel', topic: 'Genel tartışma kanalı', isPrivate: false },
  { id: 'c2', name: 'duyurular', topic: 'Önemli güncellemeler', isPrivate: false },
];

export const MOCK_BOARDS: Board[] = [
  { id: 'b1', name: 'Ana Proje Tahtası' }
];

export const MOCK_LISTS: List[] = [
  { id: 'l1', name: 'Yapılacaklar' },
  { id: 'l2', name: 'Devam Edenler' },
  { id: 'l3', name: 'Tamamlananlar' }
];

export const MOCK_CARDS: Card[] = [
  { id: 'ca1', listId: 'l1', title: 'Temel Kontrolü', assignees: ['u4'], checklists: [{ items: [{ isDone: false }] }] }
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: 'REQ-1001',
    requesterId: 'u4',
    title: 'Yeni Ekskavatör Kiralama',
    description: 'Saha B toprak işleri için ek kapasite gereksinimi.',
    type: RequestType.PURCHASE,
    status: RequestStatus.SUBMITTED,
    amount: 12000,
    currency: 'USD',
    siteId: 'site-a',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_TASKS: Task[] = [
  { id: 'T-1', title: 'Haftalık Saha Denetimi', status: 'TODO', priority: 'HIGH', assigneeId: 'u4' }
];
