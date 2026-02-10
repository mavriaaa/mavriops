
export type Language = 'tr' | 'en';

export const translations = {
  tr: {
    // Menu
    dashboard: "Komuta Merkezi",
    requests: "Talepler",
    inbox: "Gelen Kutusu",
    reports: "Raporlar",
    accounting: "Muhasebe Merkezi",
    admin: "Sistem Ayarları",
    projects: "Projeler & Sahalar",
    users: "Kullanıcılar & Roller",
    workflows: "Onay Akışları",
    masterdata: "Ana Veri Yönetimi",
    search: "Ara...",
    
    // Statuses
    DRAFT: "Taslak",
    SUBMITTED: "Onay Bekliyor",
    NEED_INFO: "Revizyon Bekliyor",
    REJECTED: "Reddedildi",
    APPROVED_FINAL: "Onaylandı",
    ORDERED: "Sipariş Geçildi",
    DELIVERED: "Teslim Alındı",
    INVOICED: "Faturalandırıldı",
    CLOSED: "Kapandı",
    DONE: "Tamamlandı",
    ACTIVE: "Aktif",

    // Roles
    OWNER: "Patron / CEO",
    ADMIN: "Sistem Yöneticisi",
    PROJECT_MANAGER: "Proje Müdürü",
    SITE_CHIEF: "Şantiye Şefi",
    PROCUREMENT: "Satınalma Birimi",
    ACCOUNTANT: "Muhasebe / Finans",
    EMPLOYEE: "Saha Personeli",

    // Finance Labels
    cariName: "Cari Ünvan",
    invoiceNo: "Fatura Seri/No",
    invoiceDate: "Fatura Tarihi",
    netAmount: "Net Tutar",
    vatRate: "KDV Oranı (%)",
    vatAmount: "KDV Tutarı",
    totalAmount: "Genel Toplam",
    dueDate: "Vade Tarihi",
    paymentStatus: "Ödeme Durumu",
    paidDate: "Ödeme Tarihi",
    paymentNote: "Hazine Notu",
    PLANNED: "Planlandı",
    PAID: "Ödendi",

    // Actions
    newRequest: "Yeni Talep",
    approve: "Onayla",
    reject: "Reddet",
    save: "Kaydet",
    cancel: "Vazgeç",
    amount: "Mali Değer",
    finance: "Finans & Ödeme",
    summary: "Özet",
    process: "Süreç Akışı",
    procurement: "Satınalma"
  }
};

export const getTranslation = (key: string): string => {
  if (!key) return "";
  const normalizedKey = key.toUpperCase();
  return (translations.tr as any)[normalizedKey] || (translations.tr as any)[key] || key;
};
