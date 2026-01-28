
import { Budget, RequestType, Role } from '../types';
import { MOCK_BUDGETS } from '../constants';

export class BudgetService {
  private static STORAGE_KEY = 'mavri_budgets';

  static getBudgets(): Budget[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  }

  static getBudgetForSite(siteId: string): Budget | undefined {
    return this.getBudgets().find(b => b.scopeId === siteId && b.scopeType === 'SITE');
  }

  static checkLimit(siteId: string, amount: number): { isOver: boolean, budget?: Budget } {
    const budget = this.getBudgetForSite(siteId);
    if (!budget) return { isOver: false };
    const isOver = (budget.consumed + amount) > budget.amount;
    return { isOver, budget };
  }

  static consume(siteId: string, amount: number) {
    const budgets = this.getBudgets();
    const idx = budgets.findIndex(b => b.scopeId === siteId);
    if (idx > -1) {
      budgets[idx].consumed += amount;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(budgets));
    }
  }
}
