
// @google/genai guidelines followed: Using consistent mock data and correct types.
import { Role, Project, Site, ProjectStatus, SiteStatus, WorkItemType, WorkItemStatus, Priority, WorkItem, Organization, Channel, Board, List, Card, RequestType, Budget, Task, User, WorkflowDefinition } from './types';

export const ENABLE_WORKFLOW_BUILDER = true;
export const ENABLE_BUDGETS = true;
export const ENABLE_RACI = true;

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    projectCode: 'PRJ-2024-0001',
    name: 'Mavri Tower Residence',
    clientName: 'Global Investment Group',
    locationCity: 'İstanbul',
    locationDistrict: 'Sarıyer',
    startDate: '2024-01-10',
    status: ProjectStatus.ACTIVE,
    ownerUserId: 'u1',
    primaryManagerId: 'u2',
    totalBudget: 150000000,
    currency: 'TRY',
    managers: ['u2'],
    description: 'Şehir merkezinde lüks konut ve ofis projesi.',
    tags: ['Lüks', 'Konut', 'Merkezi'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z'
  },
  {
    id: 'prj-2',
    projectCode: 'PRJ-2024-0002',
    name: 'Ege Entegre GES Tesisleri',
    clientName: 'EnerjiSA Entegre',
    locationCity: 'İzmir',
    locationDistrict: 'Aliağa',
    startDate: '2024-03-15',
    status: ProjectStatus.DRAFT,
    ownerUserId: 'u1',
    primaryManagerId: 'u2',
    totalBudget: 450000000,
    currency: 'TRY',
    managers: ['u2'],
    description: '50MW Güneş Enerji Santrali kurulumu ve şebeke entegrasyonu.',
    tags: ['Enerji', 'GES', 'Yeşil Dönüşüm'],
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z'
  }
];

export const MOCK_SITES: Site[] = [
  {
    id: 'site-a',
    siteCode: 'SAHA-PRJ1-001',
    projectId: 'prj-1',
    name: 'İstanbul Kuzey Entegrasyonu',
    type: 'INSAAT',
    address: 'Ayazağa Mah. No:12',
    status: SiteStatus.ACTIVE,
    budgetMonthlyLimit: 500000,
    riskLevel: 'MED',
    leadUserId: 'u4',
    fieldTeam: ['u4', 'u5'],
    communicationChannelId: 'c1',
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-05-10T12:00:00Z'
  },
  {
    id: 'site-c',
    siteCode: 'SAHA-PRJ2-001',
    projectId: 'prj-2',
    name: 'Aliağa Panel Sahası 1',
    type: 'GES',
    status: SiteStatus.PLANNING,
    budgetMonthlyLimit: 1200000,
    riskLevel: 'LOW',
    leadUserId: 'u4',
    fieldTeam: [],
    communicationChannelId: 'c4',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sinem CEO', role: Role.OWNER, avatar: 'https://i.pravatar.cc/150?u=u1', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u2', name: 'Deniz Müdür', role: Role.MANAGER, avatar: 'https://i.pravatar.cc/150?u=u2', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u3', name: 'Canan Satınalma', role: Role.PROCUREMENT, avatar: 'https://i.pravatar.cc/150?u=u3', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u4', name: 'Barış Mühendis', role: Role.EMPLOYEE, avatar: 'https://i.pravatar.cc/150?u=u4', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
  { id: 'u5', name: 'Mert Muhasebe', role: Role.ACCOUNTANT, avatar: 'https://i.pravatar.cc/150?u=u5', departmentId: 'dept-1', companyId: 'comp-1', status: 'online' },
];

export const INITIAL_SEED_DATA: WorkItem[] = [
  {
    id: 'R-7001',
    type: WorkItemType.REQUEST,
    title: 'Acil Beton Tedariği - Faz 2',
    description: 'İstanbul Kuzey sahası için 400m3 C35 beton ihtiyacı.',
    status: WorkItemStatus.IN_REVIEW,
    priority: Priority.CRITICAL,
    createdBy: 'u4',
    assigneeId: 'u2',
    companyId: 'comp-1',
    siteId: 'site-a',
    projectId: 'prj-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [],
    tags: ['Satınalma', 'Kritik'],
    requestData: {
      amount: 850000,
      currency: 'TRY',
      category: 'MALZEME',
      approvalChain: [
        { stepNo: 1, roleRequired: Role.MANAGER, status: 'APPROVED', userId: 'u2', decidedAt: new Date().toISOString(), note: 'Saha planına uygun.' },
        { stepNo: 2, roleRequired: Role.DIRECTOR, status: 'PENDING' }
      ]
    },
    timeline: [
        { id: 't1', type: 'APPROVAL', actorId: 'u2', actorName: 'Deniz Müdür', summary: 'Müdür onayı verildi.', timestamp: new Date().toISOString() },
        { id: 't0', type: 'SYSTEM', actorId: 'u4', actorName: 'Barış Mühendis', summary: 'Talep oluşturuldu.', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]
  }
];

export const MOCK_CHANNELS: Channel[] = [
  { id: 'c1', name: 'genel', topic: 'Genel Operasyonel Haberleşme', isPrivate: false },
  { id: 'c2', name: 'duyurular', topic: 'Kurumsal Duyurular', isPrivate: false },
];

// FIX: Export missing mock data for Kanban boards
export const MOCK_BOARDS: Board[] = [
  { id: 'b1', name: 'Saha Operasyon Takibi' },
  { id: 'b2', name: 'Tedarik Zinciri Planlama' }
];

export const MOCK_LISTS: List[] = [
  { id: 'l1', name: 'Yapılacaklar' },
  { id: 'l2', name: 'Devam Edenler' },
  { id: 'l3', name: 'Kontrol / Onay' },
  { id: 'l4', name: 'Tamamlananlar' }
];

export const MOCK_CARDS: Card[] = [
  { 
    id: 'card-1', 
    listId: 'l1', 
    title: 'Beton Numunesi Alımı', 
    assignees: ['u4'], 
    checklists: [{ id: 'cl1', items: [{ id: 'cli1', title: 'Laboratuvar Onayı', isDone: false }] }] 
  },
  { 
    id: 'card-2', 
    listId: 'l2', 
    title: 'Saha Temizliği ve Düzenleme', 
    assignees: ['u4', 'u5'], 
    checklists: [] 
  }
];

// FIX: Export missing mock data for Task Board
export const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Saha Güvenlik Denetimi', status: 'TODO', priority: 'HIGH', assigneeId: 'u4' },
  { id: 'task-2', title: 'Malzeme Kabulü ve İstifleme', status: 'TODO', priority: 'MEDIUM', assigneeId: 'u2' },
  { id: 'task-3', title: 'Haftalık Rapor Hazırlığı', status: 'DOING', priority: 'LOW', assigneeId: 'u1' }
];

// FIX: Export missing mock data for Workflow Service
export const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-1',
    name: 'Standart Satınalma Akışı',
    appliesTo: RequestType.PURCHASE,
    isActive: true,
    steps: [
      { id: 'ws1', stepNo: 1, mode: 'ROLE', roleRequired: Role.MANAGER, requireNote: true },
      { id: 'ws2', stepNo: 2, mode: 'ROLE', roleRequired: Role.DIRECTOR, requireNote: true }
    ],
    conditions: [
      { field: 'amount', operator: '>', value: 5000 }
    ]
  }
];

// FIX: Export missing mock data for Budget Service
export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    scopeType: 'SITE',
    scopeId: 'site-a',
    period: 'MONTHLY',
    amount: 500000,
    currency: 'TRY',
    consumed: 120000,
    overLimitRoleRequired: Role.DIRECTOR
  },
  {
    id: 'bud-2',
    scopeType: 'SITE',
    scopeId: 'site-c',
    period: 'MONTHLY',
    amount: 1200000,
    currency: 'TRY',
    consumed: 0,
    overLimitRoleRequired: Role.MANAGER
  }
];
