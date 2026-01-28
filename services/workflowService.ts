
import { WorkflowDefinition, WorkflowStep, RequestType, WorkItem } from '../types';
import { MOCK_WORKFLOWS } from '../constants';

export class WorkflowService {
  private static STORAGE_KEY = 'mavri_workflows';

  static getWorkflows(): WorkflowDefinition[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_WORKFLOWS;
  }

  static saveWorkflow(wf: WorkflowDefinition) {
    const all = this.getWorkflows();
    const idx = all.findIndex(x => x.id === wf.id);
    if (idx > -1) all[idx] = wf;
    else all.push(wf);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  static findMatchingWorkflow(type: RequestType, payload: any): WorkflowDefinition | null {
    const workflows = this.getWorkflows().filter(w => w.appliesTo === type && w.isActive);
    
    for (const wf of workflows) {
      const isMatch = wf.conditions.every(cond => {
        const val = payload[cond.field];
        switch (cond.operator) {
          case '>': return val > cond.value;
          case '<': return val < cond.value;
          case '==': return val == cond.value;
          default: return false;
        }
      });
      if (isMatch) return wf;
    }
    return null;
  }

  static generateApprovalChain(wf: WorkflowDefinition): any[] {
    return wf.steps.map(step => ({
      stepNo: step.stepNo,
      roleRequired: step.roleRequired,
      status: 'PENDING',
      requireNote: step.requireNote
    }));
  }
}
