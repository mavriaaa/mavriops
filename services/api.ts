
import { 
  WorkItem, WorkItemType, WorkItemStatus, Role, Priority, 
  Message, User, Attachment, UserPreferences, Notification,
  RaciRole, WorkItemRaci, RequestType
} from '../types';
import { WorkflowService } from './workflowService';
import { BudgetService } from './budgetService';
import { ENABLE_WORKFLOW_BUILDER, ENABLE_BUDGETS } from '../constants';

const STORAGE_KEYS = {
  WORK_ITEMS: 'mavri_work_items_v2',
  PREFERENCES: 'mavri_user_prefs',
  AUDIT: 'mavri_audit_logs',
  MESSAGES: 'mavri_messages',
  NOTIFICATIONS: 'mavri_notifications'
};

export class ApiService {
  private static get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static async globalSearch(query: string): Promise<any[]> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const q = query.toLowerCase();
    return items.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.id.toLowerCase().includes(q) ||
      i.siteId.toLowerCase().includes(q)
    ).slice(0, 10);
  }

  static async uploadFile(file: File, onProgress: (p: number) => void): Promise<Attachment> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
            uploadedBy: 'u1',
            createdAt: new Date().toISOString()
          });
        }
      }, 200);
    });
  }

  static async fetchWorkItems(): Promise<WorkItem[]> {
    return this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
  }

  static async fetchWorkItemsBySite(siteId: string): Promise<WorkItem[]> {
    const all = await this.fetchWorkItems();
    return all.filter(item => item.siteId === siteId || item.siteId === 'GENEL');
  }

  static async createWorkItem(data: Partial<WorkItem>, creator: User): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    
    let finalRequestData = data.requestData || {};
    if (data.type === WorkItemType.REQUEST && ENABLE_WORKFLOW_BUILDER) {
        const wf = WorkflowService.findMatchingWorkflow(finalRequestData.type as RequestType, finalRequestData);
        if (wf) {
            finalRequestData.approvalChain = WorkflowService.generateApprovalChain(wf);
            this.logAudit(`WF-${wf.id}`, creator.id, 'WORKFLOW_APPLIED', { wfName: wf.name });
        }
        
        if (ENABLE_BUDGETS) {
            const { isOver, budget } = BudgetService.checkLimit(data.siteId || 'GENEL', finalRequestData.amount || 0);
            if (isOver && budget) {
                finalRequestData.isOverBudget = true;
                finalRequestData.approvalChain.push({
                    stepNo: finalRequestData.approvalChain.length + 1,
                    roleRequired: budget.overLimitRoleRequired,
                    status: 'PENDING',
                    note: 'Bütçe aşımı nedeniyle ek onay gerekli.'
                });
                this.logAudit(budget.id, creator.id, 'BUDGET_OVER_LIMIT_TRIGGERED', { amount: finalRequestData.amount });
            }
        }
    }

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
      raci: data.raci || [],
      ...data,
      requestData: finalRequestData
    } as WorkItem;

    items.unshift(newItem);
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    this.logAudit(newItem.id, creator.id, 'CREATE', newItem);
    return newItem;
  }

  static async updateWorkItem(id: string, updates: Partial<WorkItem>, actorId: string): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    this.logAudit(id, actorId, 'UPDATE', updates);
    return items[idx];
  }

  static async completeWorkItem(id: string, completion: { note: string, attachments: Attachment[] }, actorId: string): Promise<WorkItem> {
    const items = this.get<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    
    items[idx] = { 
      ...items[idx], 
      status: WorkItemStatus.DONE,
      completionNote: completion.note,
      attachments: [...items[idx].attachments, ...completion.attachments],
      completedAt: new Date().toISOString(),
      completedBy: actorId,
      updatedAt: new Date().toISOString(),
      progress: 100
    };
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    this.logAudit(id, actorId, 'COMPLETE', completion);
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
            chain[stepIdx] = {
                ...chain[stepIdx],
                status: 'APPROVED',
                userId: actor.id,
                decidedAt: new Date().toISOString(),
                note
            };
            item.requestData.approvalChain = chain;
            if (!chain.some((s: any) => s.status === 'PENDING')) {
                item.status = WorkItemStatus.APPROVED;
                if (ENABLE_BUDGETS) {
                    BudgetService.consume(item.siteId, item.requestData.amount);
                    this.logAudit(item.id, actor.id, 'BUDGET_CONSUMED', { amount: item.requestData.amount });
                }
            } else {
                item.status = WorkItemStatus.IN_REVIEW;
            }
        }
    }
    
    items[idx] = { ...item, updatedAt: new Date().toISOString() };
    this.save(STORAGE_KEYS.WORK_ITEMS, items);
    this.logAudit(id, actor.id, 'APPROVE_STEP', { note });
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
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      this.save(STORAGE_KEYS.MESSAGES, all);
      return all[idx];
    }
    throw new Error("Message not found");
  }

  static savePreferences(prefs: UserPreferences) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  }

  static getPreferences(): UserPreferences {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      language: 'tr',
      sidebarCollapsed: false,
      accentColor: '#4f46e5',
      notificationLevel: 'all',
      defaultLanding: '/'
    };
  }

  private static logAudit(entityId: string, actorId: string, action: string, payload: any) {
    const logs = this.get<any>(STORAGE_KEYS.AUDIT);
    logs.unshift({ id: Date.now().toString(), entityId, actorId, action, payload, timestamp: new Date().toISOString() });
    this.save(STORAGE_KEYS.AUDIT, logs);
  }

  static async getNotifications(): Promise<Notification[]> {
    return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  static async updateRaci(id: string, raci: WorkItemRaci[], actorId: string): Promise<WorkItem> {
    const item = await this.updateWorkItem(id, { raci }, actorId);
    this.logAudit(id, actorId, 'RACI_UPDATED', raci);
    return item;
  }
}
