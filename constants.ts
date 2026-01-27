
import { Role, User, WorkItemType, WorkItemStatus, Priority, WorkItem, Organization, Channel, Board, List, Card, Request, RequestType, RequestStatus, Task } from './types';

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

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'WI-1001',
    type: WorkItemType.REQUEST,
    title: 'Acil Beton Satınalma - Saha A',
    description: 'Köprü ayakları için 200m3 C30 beton ihtiyacı. Döküm takvimi sıkışık.',
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
    }
  },
  {
    id: 'WI-1002',
    type: WorkItemType.REQUEST,
    title: 'Jeneratör Yakıt İkmali - Saha B',
    description: 'Kesintisiz güç kaynağı için 5000L Mazot alımı.',
    status: WorkItemStatus.SUBMITTED,
    priority: Priority.HIGH,
    createdBy: 'u4',
    assigneeId: 'u2',
    companyId: 'comp-1',
    siteId: 'site-b',
    dueDate: '2024-05-22',
    progress: 10,
    attachments: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Yakıt', 'Lojistik'],
    requestData: {
      amount: 215000,
      currency: 'TRY',
      category: 'SAHA',
      costCenter: 'OPS-FUEL',
      items: [],
      approvalChain: [
        { stepNo: 1, roleRequired: Role.SUPERVISOR, status: 'PENDING' },
        { stepNo: 2, roleRequired: Role.MANAGER, status: 'PENDING' }
      ]
    }
  },
  {
    id: 'WI-1003',
    type: WorkItemType.REQUEST,
    title: 'Saha Ekibi Konaklama Hakedişi',
    description: 'Mayıs ayı dış ekip konaklama ve yemek giderleri.',
    status: WorkItemStatus.IN_REVIEW,
    priority: Priority.MEDIUM,
    createdBy: 'u2',
    assigneeId: 'u1',
    companyId: 'comp-1',
    siteId: 'site-a',
    dueDate: '2024-05-30',
    progress: 50,
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Personel', 'Finans'],
    requestData: {
      amount: 82400,
      currency: 'TRY',
      category: 'FINANS',
      costCenter: 'HR-TRAVEL',
      items: [],
      approvalChain: [
        { stepNo: 1, roleRequired: Role.MANAGER, status: 'APPROVED', userId: 'u2', decidedAt: new Date(Date.now() - 86400000).toISOString(), note: 'Faturalar kontrol edildi.' },
        { stepNo: 2, roleRequired: Role.OWNER, status: 'PENDING' }
      ]
    }
  },
  {
    id: 'WI-1004',
    type: WorkItemType.REQUEST,
    title: 'Kule Vinç Periyodik Muayene',
    description: 'İSG yönetmeliği gereği zorunlu teknik kontrol hizmet alımı.',
    status: WorkItemStatus.SUBMITTED,
    priority: Priority.CRITICAL,
    createdBy: 'u4',
    assigneeId: 'u3',
    companyId: 'comp-1',
    siteId: 'site-c',
    dueDate: '2024-05-21',
    progress: 5,
    attachments: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['İSG', 'Teknik'],
    requestData: {
      amount: 14500,
      currency: 'TRY',
      category: 'SAHA',
      costCenter: 'SAFE-24',
      items: [],
      approvalChain: [
        { stepNo: 1, roleRequired: Role.PROCUREMENT, status: 'PENDING' },
        { stepNo: 2, roleRequired: Role.MANAGER, status: 'PENDING' }
      ]
    }
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
    progress: 0,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Bakım']
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
