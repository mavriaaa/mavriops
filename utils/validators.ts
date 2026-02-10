
import { WorkItem, User, Role, Attachment } from '../types';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const isActionAllowed = (
  item: WorkItem,
  user: User,
  activeProjectId: string,
  requiredRole?: Role[]
): ValidationResult => {
  // 1. Proje Scope Kontrolü
  if (item.projectId !== activeProjectId) {
    return { isValid: false, message: 'Bu kayıt seçili proje kapsamında değil.' };
  }

  // 2. Rol Yetki Kontrolü
  if (requiredRole && !requiredRole.includes(user.role) && user.role !== Role.OWNER && user.role !== Role.ADMIN) {
    return { isValid: false, message: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  return { isValid: true };
};

export const validateFinancialForm = (data: {
  amount: number;
  description: string;
  attachments: Attachment[];
}): ValidationResult => {
  if (data.amount <= 0) return { isValid: false, message: 'Tutar 0\'dan büyük olmalıdır.' };
  if (data.description.trim().length < 10) return { isValid: false, message: 'Açıklama en az 10 karakter olmalıdır.' };
  
  // 5.000 TRY ve üzeri attachment zorunluluğu
  if (data.amount >= 5000 && data.attachments.length === 0) {
    return { isValid: false, message: '5.000 TRY ve üzeri işlemler için belge (ek) yüklenmesi zorunludur.' };
  }

  return { isValid: true };
};
