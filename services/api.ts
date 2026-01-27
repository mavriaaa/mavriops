
import { 
  WorkItem, WorkItemType, WorkItemStatus, Role, Priority, 
  Message, User, Attachment, UserPreferences, Notification 
} from '../types';

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
      ...data
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

  static async assignWorkItem(id: string, assigneeId: string, actorId: string): Promise<WorkItem> {
    return this.updateWorkItem(id, { 
      assigneeId, 
      status: WorkItemStatus.IN_PROGRESS 
    }, actorId);
  }

  static async completeWorkItem(id: string, data: { note: string, attachments: Attachment[] }, actorId: string): Promise<WorkItem> {
    return this.updateWorkItem(id, {
      status: WorkItemStatus.DONE,
      completionNote: data.note,
      attachments: data.attachments,
      completedBy: actorId,
      completedAt: new Date().toISOString()
    }, actorId);
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

  static async fetchChannelHistory(channelId: string, limit: number = 50): Promise<Message[]> {
    const all = this.get<Message>(STORAGE_KEYS.MESSAGES);
    return all.filter(m => m.channelId === channelId).slice(-limit);
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

  static async convertMessageToTask(msg: Message, actor: User): Promise<WorkItem> {
    return this.createWorkItem({
      type: WorkItemType.TASK,
      title: `Task: ${msg.content.substring(0, 40)}${msg.content.length > 40 ? '...' : ''}`,
      description: msg.content,
      status: WorkItemStatus.TODO,
      priority: Priority.MEDIUM,
      siteId: 'GENEL'
    }, actor);
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
    const logs = this.get(STORAGE_KEYS.AUDIT);
    logs.unshift({ id: Date.now(), entityId, actorId, action, payload, time: new Date() });
    this.save(STORAGE_KEYS.AUDIT, logs);
  }

  static async getNotifications(): Promise<Notification[]> {
    return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }
}
