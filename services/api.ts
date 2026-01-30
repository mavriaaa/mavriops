
import { 
  WorkItem, WorkItemType, WorkItemStatus, Role, Priority, 
  Message, User, Attachment, UserPreferences, Notification,
  RequestType, AuditEvent, MetricSummary, FinancialTransaction,
  Project, Site, ProjectStatus, SiteStatus
} from '../types';
import { WorkflowService } from './workflowService';
import { BudgetService } from './budgetService';
import { ENABLE_WORKFLOW_BUILDER, ENABLE_BUDGETS, INITIAL_SEED_DATA, MOCK_PROJECTS, MOCK_SITES, MOCK_USERS } from '../constants';

const STORAGE_KEYS = {
  WORK_ITEMS: 'mavri_work_items_v3',
  PREFERENCES: 'mavri_user_prefs_v3',
  AUDIT: 'mavri_audit_logs_v3',
  MESSAGES: 'mavri_messages_v3',
  NOTIFICATIONS: 'mavri_notifications_v3',
  FINANCE: 'mavri_finance_ledger_v3',
  PROJECTS: 'mavri_projects_v3',
  SITES: 'mavri_sites_v3'
};

export class ApiService {
  private static get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
        if (key === STORAGE_KEYS.WORK_ITEMS) { this.save(key, INITIAL_SEED_DATA); return INITIAL_SEED_DATA as unknown as T[]; }
        if (key === STORAGE_KEYS.PROJECTS) { this.save(key, MOCK_PROJECTS); return MOCK_PROJECTS as unknown as T[]; }
        if (key === STORAGE_KEYS.SITES) { this.save(key, MOCK_SITES); return MOCK_SITES as unknown as T[]; }
    }
    return data ? JSON.parse(data) : [];
  }

  private static save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- PROJECT & SITE API ---
  static async fetchProjects(): Promise<Project[]> {
    return this.get<Project>(STORAGE_KEYS.PROJECTS);
  }

  static async fetchSites(projectId?: string): Promise<Site[]> {
    const all = this.get<Site>(STORAGE_KEYS.SITES);
    return projectId ? all.filter(s => s.projectId === projectId) : all;
  }

  static async createProject(data: Partial<Project>, actor: User): Promise<Project> {
    const items = this.get<Project>(STORAGE_KEYS.PROJECTS);
    const newPrj: Project = {
      id: `prj-${Date.now()}`,
      projectCode: `PRJ-2024-${String(items.length + 1).padStart(4, '0')}`,
      name: data.name || 'İsimsiz Proje',
      status: data.status || ProjectStatus.ACTIVE,
      ownerUserId: actor.id,
      managers: data.managers || [],
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Project;
    items.unshift(newPrj);
    this.save(STORAGE_KEYS.PROJECTS, items);
    await this.logAudit('PROJECT', newPrj.id, 'CREATE', `Yeni proje oluşturuldu: ${newPrj.name}`, actor);
    return newPrj;
  }

  static async createSite(data: Partial<Site>, actor: User): Promise<Site | WorkItem> {
    const isLead = actor.role === Role.SUPERVISOR;
    
    if (isLead) {
        const approvalRequest = await this.createWorkItem({
            type: WorkItemType.SITE_APPROVAL,
            title: `Yeni Şantiye Talebi: ${data.name}`,
            priority: Priority.MEDIUM,
            siteId: 'GENEL',
            projectId: data.projectId || 'GENEL',
            status: WorkItemStatus.SUBMITTED,
            requestData: {
                type: RequestType.SITE_CREATION,
                siteData: data,
                approvalChain: [
                    { stepNo: 1, roleRequired: Role.MANAGER, status: 'PENDING' }
                ]
            }
        }, actor);
        return approvalRequest;
    }

    const items = this.get<Site>(STORAGE_KEYS.SITES);
    const newSite: Site = {
      id: `site-${Date.now()}`,
      siteCode: `SAHA-${data.projectId?.split('-')[1] || 'GEN'}-${String(items.length + 1).padStart(3, '0')}`,
      status: SiteStatus.ACTIVE,
      budgetMonthlyLimit: data.budgetMonthlyLimit || 0,
      riskLevel: data.riskLevel || 'LOW',
      leadUserId: data.leadUserId || actor.id,
      fieldTeam: data.fieldTeam || [],
      communicationChannelId: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Site;

    items.unshift(newSite);
    this.save(STORAGE_KEYS.SITES, items);
    await this.logAudit('SITE', newSite.id, 'CREATE', `Yeni şantiye aktif edildi: ${newSite.name}`, actor);
    return newSite;
  }

  static async getMetricSummary(projectId?: string): Promise<MetricSummary> {
    const items = (await this.fetchWorkItems()).filter(i => !projectId || i.projectId === projectId);
    const ledger = (await this.fetchFinancialTransactions()).filter(t => !projectId || t.projectId === projectId);
    
    const workforce = 124; 
    const activePeople = 8; 

    const pendingApprovals = items.filter(i => 
      (i.type === WorkItemType.REQUEST || i.type === WorkItemType.SITE_APPROVAL) && 
      (i.status === WorkItemStatus.SUBMITTED || i.status === WorkItemStatus.IN_REVIEW)
    ).length;

    const activeTasks = items.filter(i => 
      i.type === WorkItemType.TASK && 
      (i.status === WorkItemStatus.TODO || i.status === WorkItemStatus.IN_PROGRESS)
    ).length;

    const criticalIssues = items.filter(i => i.priority === Priority.CRITICAL && i.status !== WorkItemStatus.DONE).length;

    const approvedRequests = items.filter(i => i.type === WorkItemType.REQUEST && i.status === WorkItemStatus.APPROVED);
    const manualExpenses = ledger.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = ledger.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);

    return {
      pendingApprovals,
      activeTasks,
      criticalIssues,
      completionRate: 92,
      totalWorkforce: workforce,
      activeWorkforce: activePeople,
      financials: {
        approvedExpenses: approvedRequests.reduce((sum, r) => sum + (r.requestData?.amount || 0), 0) + manualExpenses,
        pendingExpenses: 0,
        totalIncome,
        currency: 'TRY'
      }
    };
  }

  static async fetchWorkItems(): Promise<WorkItem[]> {
    return this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
  }

  static async fetchFinancialTransactions(): Promise<FinancialTransaction[]> {
    return this.get<FinancialTransaction>(STORAGE_KEYS.FINANCE);
  }

  static async createFinancialTransaction(data: Partial<FinancialTransaction>, actor: User): Promise<FinancialTransaction> {
    const ledger = this.get<FinancialTransaction>(STORAGE_KEYS.FINANCE);
    const newTx: FinancialTransaction = {
      id: `FTX-${Date.now()}`,
      type: data.type || 'EXPENSE',
      title: data.title || 'İsimsiz İşlem',
      amount: data.amount || 0,
      currency: data.currency || 'TRY',
      category: data.category || 'GENEL',
      date: data.date || new Date().toISOString().split('T')[0],
      vendor: data.vendor,
      siteId: data.siteId || 'GENEL',
      projectId: data.projectId || 'prj-1',
      recordedBy: actor.id,
      createdAt: new Date().toISOString(),
      attachments: data.attachments || []
    };
    ledger.unshift(newTx);
    this.save(STORAGE_KEYS.FINANCE, ledger);
    await this.logAudit('FINANCE', newTx.id, 'MANUAL_ENTRY', `${newTx.type} kaydı oluşturuldu: ${newTx.title}`, actor);
    return newTx;
  }

  static async logAudit(entityType: AuditEvent['entityType'], entityId: string, type: string, summary: string, actor: User, metadata?: any) {
      const logs = this.get<AuditEvent>(STORAGE_KEYS.AUDIT);
      const newEvent: AuditEvent = {
          id: `AUD-${Date.now()}`,
          type,
          actorId: actor.id,
          actorName: actor.name,
          entityType,
          entityId,
          summary,
          createdAt: new Date().toISOString(),
          metadata
      };
      logs.unshift(newEvent);
      this.save(STORAGE_KEYS.AUDIT, logs);
  }

  static async getAuditLogs(projectId?: string): Promise<AuditEvent[]> {
      const logs = this.get<AuditEvent>(STORAGE_KEYS.AUDIT);
      // We could filter logs by projectId if we added projectId to AuditEvent, but for now we'll just return all or could filter metadata
      return logs;
  }

  static async createWorkItem(data: Partial<WorkItem>, creator: User): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const newItem: WorkItem = {
      id: `${data.type?.charAt(0) || 'W'}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: data.status || WorkItemStatus.SUBMITTED,
      priority: data.priority || Priority.MEDIUM,
      attachments: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyId: creator.companyId,
      createdBy: creator.id,
      projectId: data.projectId || 'prj-1',
      timeline: [{ id: `tl-${Date.now()}`, type: 'SYSTEM', actorId: creator.id, actorName: creator.name, summary: 'İş öğesi oluşturuldu.', timestamp: new Date().toISOString() }],
      ...data
    } as WorkItem;
    items.unshift(newItem);
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    return newItem;
  }

  static async updateWorkItem(id: string, updates: Partial<WorkItem>, actor: User): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    return items[idx];
  }

  static async approveStep(id: string, actor: User, note: string): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    
    const item = items[idx];
    if (item.requestData && item.requestData.approvalChain) {
        const chain = [...item.requestData.approvalChain];
        const stepIdx = chain.findIndex((s: any) => s.status === 'PENDING');
        if (stepIdx !== -1) {
            chain[stepIdx] = { ...chain[stepIdx], status: 'APPROVED', userId: actor.id, decidedAt: new Date().toISOString(), note };
            item.requestData.approvalChain = chain;
            if (!chain.some((s: any) => s.status === 'PENDING')) {
                item.status = WorkItemStatus.APPROVED;
                if (item.type === WorkItemType.SITE_APPROVAL) {
                    const sites = this.get<Site>(STORAGE_KEYS.SITES);
                    const siteData = item.requestData.siteData;
                    const newSite: Site = {
                      id: `site-${Date.now()}`,
                      siteCode: `SAHA-${siteData.projectId?.split('-')[1] || 'GEN'}-${String(sites.length + 1).padStart(3, '0')}`,
                      status: SiteStatus.ACTIVE,
                      communicationChannelId: `c-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      ...siteData
                    };
                    sites.unshift(newSite);
                    this.save(STORAGE_KEYS.SITES, sites);
                }
            } else {
                item.status = WorkItemStatus.IN_REVIEW;
            }
        }
    }
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    return item;
  }

  static async fetchMessages(channelId?: string, parentId?: string): Promise<Message[]> {
    const all = this.get<Message>(STORAGE_KEYS.MESSAGES);
    if (parentId) return all.filter(m => m.parentId === parentId);
    return all.filter(m => m.channelId === channelId);
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
    if (idx === -1) throw new Error("Message not found");
    all[idx] = { ...all[idx], ...updates };
    this.save(STORAGE_KEYS.MESSAGES, all);
    return all[idx];
  }

  static async updateRaci(workItemId: string, raci: any[], actor: User): Promise<WorkItem> {
    return this.updateWorkItem(workItemId, { raci }, actor);
  }

  static fetchUsers(): User[] {
    return MOCK_USERS;
  }

  static savePreferences(prefs: UserPreferences) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  }

  static getPreferences(): UserPreferences {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return saved ? JSON.parse(saved) : { theme: 'dark', language: 'tr', sidebarCollapsed: false, accentColor: '#4f46e5', notificationLevel: 'all', defaultLanding: '/' };
  }

  static async getNotifications(): Promise<Notification[]> {
    return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  static async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<Attachment> {
    return new Promise((resolve) => {
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        if (onProgress) onProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          resolve({
            id: `FILE-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
            uploadedBy: 'u1', 
            createdAt: new Date().toISOString()
          });
        }
      }, 100);
    });
  }
}
