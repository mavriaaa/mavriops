
import { WorkItemStatus, Role } from '../types';

export const WORKFLOW_TRANSITIONS: Record<WorkItemStatus, WorkItemStatus[]> = {
  [WorkItemStatus.DRAFT]: [WorkItemStatus.SUBMITTED, WorkItemStatus.CANCELLED],
  [WorkItemStatus.SUBMITTED]: [WorkItemStatus.NEED_INFO, WorkItemStatus.APPROVED_L1, WorkItemStatus.REJECTED],
  [WorkItemStatus.NEED_INFO]: [WorkItemStatus.SUBMITTED, WorkItemStatus.CANCELLED],
  [WorkItemStatus.APPROVED_L1]: [WorkItemStatus.APPROVED_L2, WorkItemStatus.REJECTED],
  [WorkItemStatus.APPROVED_L2]: [WorkItemStatus.APPROVED_FINAL, WorkItemStatus.REJECTED],
  [WorkItemStatus.APPROVED_FINAL]: [WorkItemStatus.ORDERED, WorkItemStatus.CANCELLED],
  [WorkItemStatus.ORDERED]: [WorkItemStatus.DELIVERED, WorkItemStatus.CANCELLED],
  [WorkItemStatus.DELIVERED]: [WorkItemStatus.INVOICED],
  [WorkItemStatus.INVOICED]: [WorkItemStatus.CLOSED],
  [WorkItemStatus.CLOSED]: [],
  [WorkItemStatus.CANCELLED]: [],
  [WorkItemStatus.REJECTED]: [],
  // Legacy or generic statuses
  [WorkItemStatus.DONE]: [],
  [WorkItemStatus.APPROVED]: [WorkItemStatus.CLOSED],
  [WorkItemStatus.IN_REVIEW]: [WorkItemStatus.APPROVED],
  [WorkItemStatus.IN_PROGRESS]: [WorkItemStatus.DONE]
};

export const getNextStatuses = (current: WorkItemStatus): WorkItemStatus[] => {
  return WORKFLOW_TRANSITIONS[current] || [];
};

export const canTransitionTo = (current: WorkItemStatus, target: WorkItemStatus): boolean => {
  return getNextStatuses(current).includes(target);
};

export const getRolePermissions = (status: WorkItemStatus): Role[] => {
  switch (status) {
    case WorkItemStatus.SUBMITTED:
    case WorkItemStatus.NEED_INFO:
      return [Role.MANAGER, Role.PROJECT_MANAGER, Role.DIRECTOR, Role.OWNER];
    case WorkItemStatus.APPROVED_L1:
    case WorkItemStatus.APPROVED_L2:
      return [Role.DIRECTOR, Role.OWNER];
    case WorkItemStatus.DELIVERED:
    case WorkItemStatus.INVOICED:
    case WorkItemStatus.CLOSED:
      return [Role.ACCOUNTANT, Role.OWNER, Role.ADMIN];
    default:
      return [Role.ADMIN, Role.OWNER];
  }
};
