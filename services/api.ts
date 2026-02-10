
import { 
  WorkItem, WorkItemType, WorkItemStatus, Role, Priority, 
  User, Attachment, AuditEvent, MetricSummary, CashAccount, CashTxn,
  Project, Site, Message, Notification, FinancialTransaction, RaciEntry, ProjectStatus
} from '../types';
import { INITIAL_WORK_ITEMS, MOCK_PROJECTS, MOCK_SITES, MOCK_USERS } from '../constants';

const STORAGE_KEYS = {
  WORK_ITEMS: 'mavri_work_items_v4',
  CASH_ACCOUNTS: 'mavri_cash_accounts_v4',
  CASH_TXNS: 'mavri_cash_txns_v4',
  AUDIT: 'mavri_audit_logs_v4',
  PROJECTS: 'mavri_projects_v4',
  SITES: 'mavri_sites_v4',
  MESSAGES: 'mavri_messages_v4',
  NOTIFICATIONS: 'mavri_notifications_v4',
  FINANCIAL_TXNS: 'mavri_financial_txns_v4'
};

export class ApiService {
  private static get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      if (data === null || data === undefined) {
          if (key === STORAGE_KEYS.WORK_ITEMS) { this.save(key, INITIAL_WORK_ITEMS); return JSON.parse(JSON.stringify(INITIAL_WORK_ITEMS)) as T[]; }
          if (key === STORAGE_KEYS.PROJECTS) { this.save(key, MOCK_PROJECTS); return JSON.parse(JSON.stringify(MOCK_PROJECTS)) as T[]; }
          if (key === STORAGE_KEYS.SITES) { this.save(key, MOCK_SITES); return JSON.parse(JSON.stringify(MOCK_SITES)) as T[]; }
          if (key === STORAGE_KEYS.CASH_ACCOUNTS) {
            const init: CashAccount[] = [
              { id: 'acc-1', name: 'Merkez Kasa', type: 'CASH', currency: 'TRY' },
              { id: 'acc-2', name: 'Ziraat Bankası - Ana', type: 'BANK', currency: 'TRY' },
              { id: 'acc-3', name: 'Şirket Kredi Kartı', type: 'CARD', currency: 'TRY' }
            ];
            this.save(key, init); return init as unknown as T[];
          }
          const empty: T[] = [];
          this.save(key, empty);
          return empty;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(`ApiService Error reading key ${key}:`, e);
      return [];
    }
  }

  private static save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`ApiService Error saving key ${key}:`, e);
    }
  }

  static async fetchWorkItems(): Promise<WorkItem[]> {
    return this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
  }

  static async createWorkItem(data: Partial<WorkItem>, actor: User): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    
    const timestamp = Date.now();
    const newItem: WorkItem = {
      // FIX: Removed duplicate 'id' property here because it is explicitly set after the spread below to prevent overwriting
      type: data.type || WorkItemType.TASK,
      title: data.title || 'İsimsiz Talep',
      description: data.description || '',
      status: data.status || WorkItemStatus.SUBMITTED,
      priority: data.priority || Priority.MEDIUM,
      projectId: data.projectId || '',
      siteId: data.siteId || '',
      createdBy: actor.id,
      amount: data.amount || 0,
      currency: data.currency || 'TRY',
      requestedDate: new Date().toISOString(),
      // FIX: Removed duplicate 'createdAt' property here because it is explicitly set after the spread below to prevent overwriting
      tags: data.tags || [],
      attachments: data.attachments || [],
      timeline: [{
        id: `tl-${timestamp}`,
        type: 'SYSTEM',
        actorId: actor.id,
        actorName: actor.name,
        summary: 'Kayıt oluşturuldu.',
        timestamp: new Date().toISOString()
      }],
      requestData: data.requestData || {
        amount: data.amount || 0,
        currency: 'TRY',
        category: 'GENEL',
        approvalChain: []
      },
      ...data,
      // Korunması gereken alanlar ezilmesin
      id: `REQ-${timestamp}`,
      createdAt: new Date().toISOString()
    } as WorkItem;

    items.unshift(newItem);
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    await this.logAudit('WORK_ITEM', newItem.id, 'CREATE', 'Yeni iş kalemi oluşturuldu.', actor);
    return newItem;
  }

  static async updateWorkItem(id: string, updates: Partial<WorkItem>, actor: User): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Kayıt bulunamadı");
    
    const prevStatus = items[idx].status;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    
    if (updates.status && updates.status !== prevStatus) {
      items[idx].timeline.unshift({
        id: `tl-${Date.now()}`,
        type: updates.status === WorkItemStatus.INVOICED ? 'INVOICED' : (updates.status === WorkItemStatus.CLOSED ? 'PAID' : 'STATUS_CHANGE'),
        actorId: actor.id,
        actorName: actor.name,
        summary: `Durum güncellendi: ${updates.status}`,
        timestamp: new Date().toISOString()
      });
      await this.logAudit('WORK_ITEM', id, 'STATUS_UPDATE', `Durum ${prevStatus} -> ${updates.status} olarak güncellendi.`, actor);
    }
    
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    return items[idx];
  }

  static async approveStep(id: string, actor: User, note: string) {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      const item = items[idx];
      if (item.requestData) {
        const activeStep = item.requestData.approvalChain.find(s => s.status === 'PENDING');
        if (activeStep) {
          activeStep.status = 'APPROVED';
          activeStep.userId = actor.id;
          activeStep.decidedAt = new Date().toISOString();
          activeStep.note = note;
          
          const nextStep = item.requestData.approvalChain.find(s => s.status === 'PENDING');
          if (!nextStep) {
            item.status = WorkItemStatus.APPROVED;
          }
          
          this.save(STORAGE_KEYS.WORK_ITEMS, items);
          await this.logAudit('WORK_ITEM', id, 'APPROVAL', `Onay adımı tamamlandı: ${activeStep.roleRequired}`, actor);
        }
      }
    }
  }

  static async updateRaci(id: string, raci: RaciEntry[], actor: User) {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx].raci = raci;
      this.save(STORAGE_KEYS.WORK_ITEMS, items);
      await this.logAudit('WORK_ITEM', id, 'RACI_UPDATE', 'RACI matrisi güncellendi.', actor);
    }
  }

  static async fetchProjects(): Promise<Project[]> {
    return this.get<Project>(STORAGE_KEYS.PROJECTS);
  }

  static async createProject(data: Partial<Project>, actor: User): Promise<Project> {
    const projects = this.get<Project>(STORAGE_KEYS.PROJECTS);
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: data.name || '',
      projectCode: data.projectCode || `PRJ-${Math.floor(Math.random()*1000)}`,
      code: data.code || `PRJ-${Math.floor(Math.random()*1000)}`,
      status: ProjectStatus.PLANNING,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      totalBudget: data.totalBudget || 0,
      clientName: data.clientName || '',
      locationCity: data.locationCity || '',
      primaryManagerId: data.primaryManagerId || actor.id
    };
    projects.push(newProject);
    this.save(STORAGE_KEYS.PROJECTS, projects);
    await this.logAudit('PROJECT', newProject.id, 'CREATE', 'Yeni proje tanımlandı.', actor);
    return newProject;
  }

  static async fetchSites(projectId?: string): Promise<Site[]> {
    const all = this.get<Site>(STORAGE_KEYS.SITES);
    return projectId ? all.filter(s => s.projectId === projectId) : all;
  }

  static async createSite(data: Partial<Site>, actor: User): Promise<Site> {
    const sites = this.get<Site>(STORAGE_KEYS.SITES);
    const newSite: Site = {
      id: `s-${Date.now()}`,
      projectId: data.projectId || '',
      name: data.name || '',
      siteCode: `SAHA-${Math.floor(Math.random()*1000)}`,
      code: `SAHA-${Math.floor(Math.random()*1000)}`,
      status: data.status || 'ACTIVE' as any,
      budgetMonthlyLimit: data.budgetMonthlyLimit || 0,
      fieldTeam: [],
      leadUserId: data.leadUserId || actor.id,
      riskLevel: data.riskLevel || 'LOW'
    };
    sites.push(newSite);
    this.save(STORAGE_KEYS.SITES, sites);
    await this.logAudit('SITE', newSite.id, 'CREATE', 'Yeni saha tanımlandı.', actor);
    return newSite;
  }

  static fetchUsers(): User[] {
    return JSON.parse(JSON.stringify(MOCK_USERS));
  }

  static async getMetricSummary(projectId?: string): Promise<MetricSummary> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const filtered = projectId ? items.filter(i => i.projectId === projectId) : items;
    
    return {
      pendingApprovals: filtered.filter(i => i.status === WorkItemStatus.SUBMITTED).length,
      activeTasks: filtered.filter(i => i.status === WorkItemStatus.IN_PROGRESS).length,
      criticalIssues: filtered.filter(i => i.priority === Priority.CRITICAL).length,
      activeWorkforce: 42,
      totalWorkforce: 50,
      financials: {
        approvedExpenses: filtered.filter(i => i.status === WorkItemStatus.CLOSED).reduce((acc, i) => acc + i.amount, 0),
        pendingExpenses: filtered.filter(i => i.status === WorkItemStatus.SUBMITTED).reduce((acc, i) => acc + i.amount, 0),
        totalIncome: 1500000,
        currency: 'TRY'
      },
      activeRequests: filtered.filter(i => i.type === WorkItemType.REQUEST).length
    };
  }

  static async fetchMessages(channelId?: string, parentId?: string): Promise<Message[]> {
    const all = this.get<Message>(STORAGE_KEYS.MESSAGES);
    return all.filter(m => (channelId ? m.channelId === channelId : true) && (parentId ? m.parentId === parentId : !m.parentId));
  }

  static async sendMessage(msg: Message): Promise<Message> {
    const all = this.get<Message>(STORAGE_KEYS.MESSAGES);
    all.push(msg);
    this.save(STORAGE_KEYS.MESSAGES, all);
    return msg;
  }

  static async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const all = this.get<Message>(STORAGE_KEYS.MESSAGES);
    const idx = all.findIndex(m => m.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      this.save(STORAGE_KEYS.MESSAGES, all);
      return all[idx];
    }
    throw new Error("Mesaj bulunamadı");
  }

  static async getNotifications(): Promise<Notification[]> {
    return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  static async fetchFinancialTransactions(): Promise<FinancialTransaction[]> {
    return this.get<FinancialTransaction>(STORAGE_KEYS.FINANCIAL_TXNS);
  }

  static async createFinancialTransaction(data: Partial<FinancialTransaction>, actor: User): Promise<FinancialTransaction> {
    const all = this.get<FinancialTransaction>(STORAGE_KEYS.FINANCIAL_TXNS);
    const newTx: FinancialTransaction = {
      id: `FT-${Date.now()}`,
      projectId: data.projectId || '',
      siteId: data.siteId || '',
      type: data.type || 'EXPENSE',
      title: data.title || '',
      amount: data.amount || 0,
      category: data.category || 'GENEL',
      date: data.date || new Date().toISOString().split('T')[0],
      vendor: data.vendor
    };
    all.unshift(newTx);
    this.save(STORAGE_KEYS.FINANCIAL_TXNS, all);
    return newTx;
  }

  static async fetchCashAccounts(): Promise<CashAccount[]> {
    return this.get<CashAccount>(STORAGE_KEYS.CASH_ACCOUNTS);
  }

  static async fetchCashTxns(projectId?: string): Promise<CashTxn[]> {
    const all = this.get<CashTxn>(STORAGE_KEYS.CASH_TXNS);
    return projectId ? all.filter(t => t.projectId === projectId) : all;
  }

  static async createCashTxn(data: Partial<CashTxn>, actor: User): Promise<CashTxn> {
    const txns = this.get<CashTxn>(STORAGE_KEYS.CASH_TXNS);
    const newTxn: CashTxn = {
      id: `TXN-${Date.now()}`,
      projectId: data.projectId || '',
      type: data.type || 'OUT',
      amount: data.amount || 0,
      currency: data.currency || 'TRY',
      date: data.date || new Date().toISOString().split('T')[0],
      accountId: data.accountId || '',
      toAccountId: data.toAccountId,
      category: data.category || 'DİĞER',
      counterpartyName: data.counterpartyName,
      description: data.description || '',
      workItemId: data.workItemId,
      attachments: data.attachments || [],
      createdBy: actor.name,
      createdAt: new Date().toISOString(),
      status: 'POSTED'
    };
    txns.unshift(newTxn);
    this.save(STORAGE_KEYS.CASH_TXNS, txns);
    return newTxn;
  }

  static async logAudit(entityType: AuditEvent['entityType'], entityId: string, type: string, summary: string, actor: User) {
      const logs = this.get<AuditEvent>(STORAGE_KEYS.AUDIT);
      logs.unshift({
          id: `AUD-${Date.now()}`,
          type, actorId: actor.id, actorName: actor.name,
          entityType, entityId, summary, createdAt: new Date().toISOString()
      });
      this.save(STORAGE_KEYS.AUDIT, logs);
  }

  static async getAuditLogs(): Promise<AuditEvent[]> {
      return this.get<AuditEvent>(STORAGE_KEYS.AUDIT);
  }

  static async uploadFile(file: File, onProgress?: (p: number) => void): Promise<Attachment> {
    if (onProgress) {
      onProgress(50);
      setTimeout(() => onProgress(100), 500);
    }
    return {
      id: `FILE-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      uploadedBy: 'u-current', 
      createdAt: new Date().toISOString()
    };
  }
}
