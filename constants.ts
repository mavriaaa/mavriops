
import { Role, WorkItemStatus, WorkItemType, Priority, WorkItem, User, Project, Site, ProjectStatus, SiteStatus, Budget } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ahmet Patron', role: Role.OWNER, avatar: 'https://i.pravatar.cc/150?u=u1', companyId: 'c1', status: 'online', allowedProjectIds: ['p1', 'p2'] },
  { id: 'u2', name: 'Selin Admin', role: Role.ADMIN, avatar: 'https://i.pravatar.cc/150?u=u2', companyId: 'c1', status: 'online', allowedProjectIds: ['p1', 'p2'] },
  { id: 'u3', name: 'Mehmet Proje Müdürü', role: Role.PROJECT_MANAGER, avatar: 'https://i.pravatar.cc/150?u=u3', companyId: 'c1', status: 'online', allowedProjectIds: ['p1'] },
  { id: 'u4', name: 'Caner Şantiye Şefi', role: Role.SITE_CHIEF, avatar: 'https://i.pravatar.cc/150?u=u4', companyId: 'c1', status: 'online', allowedProjectIds: ['p1'] },
  { id: 'u5', name: 'Demet Satınalma', role: Role.PROCUREMENT, avatar: 'https://i.pravatar.cc/150?u=u5', companyId: 'c1', status: 'online', allowedProjectIds: ['p1', 'p2'] },
  { id: 'u6', name: 'Hülya Muhasebe', role: Role.ACCOUNTANT, avatar: 'https://i.pravatar.cc/150?u=u6', companyId: 'c1', status: 'online', allowedProjectIds: ['p1', 'p2'] },
  { id: 'u7', name: 'Barış Mühendis', role: Role.EMPLOYEE, avatar: 'https://i.pravatar.cc/150?u=u7', companyId: 'c1', status: 'online', allowedProjectIds: ['p1'] },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Mavri Tower Residence', projectCode: 'PRJ-001', code: 'PRJ-001', status: ProjectStatus.ACTIVE, startDate: '2024-01-01', totalBudget: 5000000, clientName: 'Mavri Corp', locationCity: 'İstanbul', primaryManagerId: 'u3' },
  { id: 'p2', name: 'Ege Entegre GES', projectCode: 'PRJ-002', code: 'PRJ-002', status: ProjectStatus.ACTIVE, startDate: '2024-02-15', totalBudget: 12000000, clientName: 'Ege Power', locationCity: 'İzmir', primaryManagerId: 'u3' }
];

export const MOCK_SITES: Site[] = [
  { id: 's1', projectId: 'p1', name: 'A Blok Temel', siteCode: 'SAHA-01', code: 'SAHA-01', status: SiteStatus.ACTIVE, budgetMonthlyLimit: 500000, fieldTeam: ['u7'], leadUserId: 'u4', riskLevel: 'LOW' },
  { id: 's2', projectId: 'p1', name: 'B Blok Kaba İnşaat', siteCode: 'SAHA-02', code: 'SAHA-02', status: SiteStatus.ACTIVE, budgetMonthlyLimit: 750000, fieldTeam: ['u7'], leadUserId: 'u4', riskLevel: 'LOW' },
  { id: 's3', projectId: 'p2', name: 'Güneş Paneli Sahası 1', siteCode: 'SAHA-03', code: 'SAHA-03', status: SiteStatus.ACTIVE, budgetMonthlyLimit: 1000000, fieldTeam: ['u7'], leadUserId: 'u4', riskLevel: 'LOW' }
];

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  {
    id: 'REQ-1001',
    type: WorkItemType.MATERIAL,
    title: 'Acil Beton Tedariği - C35',
    description: 'Saha-01 için 400m3 C35 beton ihtiyacı bulunmaktadır.',
    status: WorkItemStatus.SUBMITTED,
    priority: Priority.CRITICAL,
    projectId: 'p1',
    siteId: 's1',
    createdBy: 'u7',
    amount: 850000,
    currency: 'TRY',
    quantity: 400,
    unit: 'm3',
    requestedDate: '2024-06-01',
    createdAt: '2024-06-01',
    tags: ['Acil', 'Beton'],
    attachments: [],
    timeline: [
      { id: 't1', type: 'SYSTEM', actorId: 'u7', actorName: 'Barış Mühendis', summary: 'Talep oluşturuldu.', timestamp: new Date().toISOString() }
    ],
    requestData: {
      amount: 850000,
      currency: 'TRY',
      category: 'MALZEME',
      approvalChain: [
        { stepNo: 1, roleRequired: Role.MANAGER, status: 'PENDING' }
      ]
    }
  },
  {
    id: 'ACC-8801',
    type: WorkItemType.MATERIAL,
    title: 'Demir Donatı - Faz 1 Teslimatı',
    description: 'Şantiyeye teslim edildi, fatura bekleniyor.',
    status: WorkItemStatus.DELIVERED,
    priority: Priority.HIGH,
    projectId: 'p1',
    siteId: 's1',
    createdBy: 'u4',
    amount: 125000,
    currency: 'TRY',
    requestedDate: '2024-05-10',
    createdAt: '2024-05-10',
    tags: ['Muhasebe-Test'],
    attachments: [],
    timeline: [{ id: 't-881', type: 'STATUS_CHANGE', actorId: 'u5', actorName: 'Demet Satınalma', summary: 'Teslimat onaylandı.', timestamp: new Date().toISOString() }],
    procurementData: { vendorName: 'Mavri Çelik A.Ş.', poNumber: 'PO-992' }
  },
  {
    id: 'ACC-8802',
    type: WorkItemType.SERVICE,
    title: 'Hafriyat İşçilik Faturası',
    description: 'Faturası işlendi, ödeme bekliyor.',
    status: WorkItemStatus.INVOICED,
    priority: Priority.MEDIUM,
    projectId: 'p1',
    siteId: 's2',
    createdBy: 'u4',
    amount: 45000,
    currency: 'TRY',
    requestedDate: '2024-05-12',
    createdAt: '2024-05-12',
    tags: ['Muhasebe-Test'],
    attachments: [],
    timeline: [{ id: 't-882', type: 'INVOICED', actorId: 'u6', actorName: 'Hülya Muhasebe', summary: 'Fatura sisteme işlendi.', timestamp: new Date().toISOString() }],
    invoice: {
      cariName: 'Toprak Lojistik Ltd.',
      invoiceNo: 'FT-2024-001',
      invoiceDate: '2024-05-15',
      currency: 'TRY',
      netAmount: 37500,
      vatRate: 20,
      vatAmount: 7500,
      totalAmount: 45000,
      dueDate: '2024-06-15',
      attachments: []
    },
    payment: { paymentStatus: 'PLANNED' }
  }
];

export const MOCK_CHANNELS = [
  { id: 'c1', name: 'genel-saha', isPrivate: false, topic: 'Ana Saha Haberleşme' },
  { id: 'c2', name: 'lojistik', isPrivate: false, topic: 'Sevkiyat ve Araç Takibi' }
];

export const MOCK_BOARDS = [{ id: 'b1', name: 'İş Takibi' }];
export const MOCK_LISTS = [
  { id: 'l1', name: 'ToDo' },
  { id: 'l2', name: 'Doing' },
  { id: 'l3', name: 'Done' }
];
export const MOCK_CARDS = [
  { id: 'ca1', listId: 'l1', title: 'Beton Dökümü Planla', assignees: ['u7'], checklists: [] },
  { id: 'ca2', listId: 'l2', title: 'Demir Bağlama', assignees: ['u7'], checklists: [] }
];

export const MOCK_TASKS = [
  { id: 't1', title: 'Task 1', status: 'TODO', priority: 'HIGH', assigneeId: 'u7' }
];

export const MOCK_WORKFLOWS = [];

export const MOCK_BUDGETS: Budget[] = [
  { id: 'b1', scopeId: 's1', scopeType: 'SITE', amount: 1000000, consumed: 850000, period: 'Haziran 2024', overLimitRoleRequired: Role.OWNER }
];

export const ENABLE_WORKFLOW_BUILDER = true;
export const ENABLE_BUDGETS = true;
export const INITIAL_SEED_DATA = INITIAL_WORK_ITEMS;
export const ENABLE_RACI = true;
