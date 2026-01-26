
import { WorkItem, AuditLog, Notification, Message, Request, RequestStatus } from '../types';
import { MOCK_WORK_ITEMS, MOCK_REQUESTS } from '../constants';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Initialize local storage with mock data if empty
const initStorage = () => {
  if (!localStorage.getItem('pro_work_items')) {
    localStorage.setItem('pro_work_items', JSON.stringify(MOCK_WORK_ITEMS));
  }
  if (!localStorage.getItem('pro_requests')) {
    localStorage.setItem('pro_requests', JSON.stringify(MOCK_REQUESTS));
  }
};

initStorage();

export const ApiService = {
  async fetchWorkItems(): Promise<WorkItem[]> {
    await delay(300);
    const stored = localStorage.getItem('pro_work_items');
    return stored ? JSON.parse(stored) : [];
  },

  async createWorkItem(item: WorkItem): Promise<WorkItem> {
    const stored = await this.fetchWorkItems();
    const newList = [item, ...stored];
    localStorage.setItem('pro_work_items', JSON.stringify(newList));
    
    await this.createAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      actorId: item.createdBy,
      action: 'WORK_ITEM_CREATED',
      entityType: 'WORK_ITEM',
      entityId: item.id,
      payload: item,
      createdAt: new Date().toISOString()
    });

    return item;
  },

  async fetchRequests(): Promise<Request[]> {
    await delay(200);
    const stored = localStorage.getItem('pro_requests');
    return stored ? JSON.parse(stored) : [];
  },

  async updateRequestStatus(requestId: string, status: RequestStatus, actorId: string): Promise<void> {
    const requests = await this.fetchRequests();
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    localStorage.setItem('pro_requests', JSON.stringify(updated));
    
    await this.createAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      actorId,
      action: `REQUEST_${status}`,
      entityType: 'REQUEST',
      entityId: requestId,
      payload: { status },
      createdAt: new Date().toISOString()
    });
  },

  async createRequest(request: Request): Promise<Request> {
    const stored = await this.fetchRequests();
    const newList = [request, ...stored];
    localStorage.setItem('pro_requests', JSON.stringify(newList));
    return request;
  },

  async createAuditLog(log: AuditLog) {
    const stored = localStorage.getItem('pro_audit_logs');
    const logs = stored ? JSON.parse(stored) : [];
    logs.unshift(log);
    localStorage.setItem('pro_audit_logs', JSON.stringify(logs));
  },

  async getNotifications(): Promise<Notification[]> {
    return [
      {
        id: 'n1',
        userId: 'u1',
        title: 'Critical Escalation',
        content: 'WorkItem WI-1001 has exceeded SLA response time.',
        isRead: false,
        type: 'escalation',
        createdAt: new Date().toISOString()
      },
      {
        id: 'n2',
        userId: 'u1',
        title: 'Approval Required',
        content: 'Deniz M. submitted PR #1005 for your review.',
        isRead: false,
        type: 'approval',
        createdAt: new Date().toISOString()
      }
    ];
  },

  async fetchMessages(channelId: string): Promise<Message[]> {
    await delay(100);
    const key = `msgs_${channelId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  async sendMessage(msg: Message): Promise<Message> {
    const key = `msgs_${msg.channelId}`;
    const msgs = await this.fetchMessages(msg.channelId || 'general');
    const newList = [...msgs, msg];
    localStorage.setItem(key, JSON.stringify(newList));
    return msg;
  }
};
