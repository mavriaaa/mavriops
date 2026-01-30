
import React, { useContext, useState, useEffect } from 'react';
// Added missing import for useNavigate
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  CheckSquare, 
  AlertCircle,
  Truck,
  ArrowRight,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  History,
  ShieldCheck,
  FileSearch,
  TrendingUp,
  Download,
  Share2,
  ArrowUpRight,
  ArrowRightCircle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemType, WorkItemStatus, Role, Priority } from '../../types';
import { MOCK_USERS } from '../../constants';

const ProcurementCenter: React.FC = () => {
  // Initialized navigate hook
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newPr, setNewPr] = useState({
    title: '',
    amount: 0,
    category: 'MALZEME',
    siteId: 'SAHA-A',
    priority: Priority.MEDIUM
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const all = await ApiService.fetchWorkItems();
    setItems(all.filter(i => i.type === WorkItemType.REQUEST));
  };

  if (!context) return null;
  const { t, currentUser, addToast, refreshMetrics } = context;

  const handleCreate = async () => {
    if (!newPr.title || newPr.amount <= 0) {
      addToast('warning', 'Validasyon Hatası', 'Lütfen talep başlığı ve bütçe tutarını eksiksiz giriniz.');
      return;
    }

    setIsProcessing(true);
    try {
        const created = await ApiService.createWorkItem({
            type: WorkItemType.REQUEST,
            title: newPr.title,
            priority: newPr.amount > 50000 ? Priority.CRITICAL : (newPr.amount > 10000 ? Priority.HIGH : Priority.MEDIUM),
            siteId: newPr.siteId,
            status: WorkItemStatus.SUBMITTED,
            requestData: {
                amount: newPr.amount,
                currency: 'TRY',
                category: newPr.category,
                costCenter: 'PROC-SYNC-2024',
                items: [],
                approvalChain: [
                    { stepNo: 1, roleRequired: Role.MANAGER, status: 'PENDING' },
                    { stepNo: 2, roleRequired: Role.DIRECTOR, status: 'PENDING' }
                ]
            }
        }, currentUser);

        addToast('success', 'Süreç Başlatıldı', `${created.id} referanslı PR kaydı kurumsal iş akışına sevk edildi.`);
        setIsModalOpen(false);
        setNewPr({ title: '', amount: 0, category: 'MALZEME', siteId: 'SAHA-A', priority: Priority.MEDIUM });
        load();
        refreshMetrics();
    } finally {
        setIsProcessing(false);
    }
  };

  const handleOrderIssuance = () => {
      addToast('info', 'Sipariş Hazırlanıyor', 'Onaylı talep üzerinden resmi Satınalma Siparişi (PO) oluşturuluyor...');
      setTimeout(() => {
          addToast('success', 'Sipariş Yayınlandı', 'PO başarıyla oluşturuldu ve tedarikçiye e-posta ile iletildi.');
      }, 1500);
  };

  const getLastApprover = (item: WorkItem) => {
    if (!item.requestData || !item.requestData.approvalChain) return null;
    const approvedSteps = [...item.requestData.approvalChain].filter(s => s.status === 'APPROVED');
    if (approvedSteps.length === 0) return null;
    const lastStep = approvedSteps[approvedSteps.length - 1];
    const user = MOCK_USERS.find(u => u.id === lastStep.userId);
    return user ? { ...user, date: lastStep.decidedAt, note: lastStep.note } : null;
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: WorkItemStatus) => {
    switch (status) {
      case WorkItemStatus.APPROVED: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case WorkItemStatus.REJECTED: return 'bg-rose-100 text-rose-600 border-rose-200';
      case WorkItemStatus.IN_REVIEW: return 'bg-amber-100 text-amber-600 border-amber-200';
      case WorkItemStatus.SUBMITTED: return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-slate-50 dark:bg-[#020617] h-full flex flex-col overflow-hidden">
      
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('procurement')}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> {t('vendorSupplyChain')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-3 active:scale-95"
           >
             <Plus size={18} /> Yeni Satınalma Kaydı (PR)
           </button>
        </div>
      </div>

      {/* KPI Özet Paneli */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-600">
              <TrendingUp size={60} />
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Aksiyon Bekleyen</p>
           <h3 className="text-3xl font-black dark:text-white">{items.filter(i => i.status !== WorkItemStatus.APPROVED).length}</h3>
           <p className="text-[9px] font-bold text-amber-500 mt-2 flex items-center gap-1 uppercase">İnceleme Safhasında</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-indigo-600">
              <CheckCircle2 size={60} />
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Onaylı Talepler</p>
           <h3 className="text-3xl font-black dark:text-white">{items.filter(i => i.status === WorkItemStatus.APPROVED).length}</h3>
           <p className="text-[9px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase">Siparişe Sevk Edilebilir</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-rose-600">
              <AlertCircle size={60} />
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Kritik</p>
           <h3 className="text-3xl font-black text-rose-500">{items.filter(i => i.priority === Priority.CRITICAL).length}</h3>
           <p className="text-[9px] font-bold text-rose-400 mt-2 flex items-center gap-1 uppercase">Acil Yönetim Kararı</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-indigo-600">
              <CreditCard size={60} />
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dönem Tahsisatı</p>
           <h3 className="text-3xl font-black dark:text-white">₺842K</h3>
           <p className="text-[9px] font-bold text-indigo-500 mt-2 flex items-center gap-1 uppercase">Onaylı Satınalma Gücü</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
        
        {/* Talep Listesi Tablosu */}
        <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500 flex flex-col min-h-0`}>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden">
              <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <FileSearch size={18} className="text-emerald-600" />
                    <h2 className="text-sm font-black dark:text-white uppercase tracking-tight">{t('activePRQueue')}</h2>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Talep ID veya Tanım..." 
                         className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-48 shadow-inner" 
                       />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Filter size={18} /></button>
                 </div>
              </header>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                       <tr className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <th className="px-8 py-4">{t('status')}</th>
                          <th className="px-8 py-4">PR Bağlamı</th>
                          <th className="px-8 py-4">{t('amount')}</th>
                          <th className="px-8 py-4">Son İşlem</th>
                          <th className="px-8 py-4 text-right">Detay</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredItems.map((item) => {
                         const lastApprover = getLastApprover(item);
                         return (
                           <tr 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group ${selectedItem?.id === item.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                           >
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusBadge(item.status)}`}>
                                    {t(item.status.toLowerCase() as any) || item.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-xs font-black dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{item.title}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                                    <span className="text-slate-200">|</span>
                                    <span className="text-[9px] font-bold text-indigo-500 uppercase">{item.siteId}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black dark:text-white tracking-tighter">₺{item.requestData?.amount.toLocaleString()}</p>
                              </td>
                              <td className="px-8 py-6">
                                 {lastApprover ? (
                                   <div className="flex items-center gap-3">
                                      <img src={lastApprover.avatar} className="w-7 h-7 rounded-lg object-cover shadow-sm border border-white" />
                                      <div>
                                         <p className="text-[10px] font-black dark:text-white uppercase leading-none">{lastApprover.name}</p>
                                         <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{new Date(lastApprover.date || '').toLocaleDateString('tr-TR')}</p>
                                      </div>
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-2 text-slate-300">
                                      <Clock size={14} />
                                      <span className="text-[9px] font-black uppercase">BEKLEMEDE</span>
                                   </div>
                                 )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 inline-block transition-transform group-hover:translate-x-1" />
                              </td>
                           </tr>
                         );
                       })}
                       {filteredItems.length === 0 && (
                         <tr>
                            <td colSpan={5} className="py-24 text-center opacity-30 italic">
                               <FileSearch size={64} className="mx-auto mb-4" />
                               <p className="text-[11px] font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Detay ve Onay Akışı Paneli */}
        {selectedItem && (
          <div className="lg:col-span-5 animate-in slide-in-from-right duration-500 flex flex-col min-h-0">
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col flex-1">
                
                {/* Panel Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg`}>
                         <FileText size={24} />
                      </div>
                      <div>
                         <h3 className="text-[11px] font-black dark:text-white uppercase tracking-tighter leading-none">{selectedItem.id}</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">PR Yaşam Döngüsü</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button title="Paylaş" className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-emerald-600 transition-colors shadow-sm"><Share2 size={18} /></button>
                      <button onClick={() => setSelectedItem(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={18} /></button>
                   </div>
                </div>

                {/* Doküman İçeriği */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                   <div>
                      <h2 className="text-2xl font-black dark:text-white uppercase leading-tight tracking-tighter mb-4">{selectedItem.title}</h2>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Mali Valör</p>
                            <p className="text-xl font-black dark:text-white">₺{selectedItem.requestData?.amount.toLocaleString()}</p>
                         </div>
                         <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Kategori / Lokasyon</p>
                            <p className="text-[11px] font-black dark:text-white uppercase">{selectedItem.requestData?.category} <span className="text-slate-300 mx-1">|</span> {selectedItem.siteId}</p>
                         </div>
                      </div>
                   </div>

                   {/* Onay Zinciri Timeline */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={16} className="text-emerald-500" /> {t('approvalTimeline')}
                      </h4>
                      <div className="space-y-8 relative">
                         <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                         
                         {selectedItem.requestData?.approvalChain.map((step: any, i: number) => {
                           const approver = step.userId ? MOCK_USERS.find(u => u.id === step.userId) : null;
                           return (
                             <div key={i} className="flex gap-6 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                                  step.status === 'APPROVED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' :
                                  step.status === 'PENDING' ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse' :
                                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                                }`}>
                                   {step.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black">{step.stepNo}</span>}
                                </div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <p className={`text-[11px] font-black uppercase tracking-tight ${step.status === 'PENDING' ? 'text-emerald-600' : 'text-slate-500'}`}>{step.roleRequired}</p>
                                         {approver && (
                                            <div className="flex items-center gap-2 mt-1">
                                               <img src={approver.avatar} className="w-5 h-5 rounded-md" />
                                               <p className="text-[10px] font-bold dark:text-white uppercase">{approver.name}</p>
                                            </div>
                                         )}
                                      </div>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                                         {step.decidedAt ? new Date(step.decidedAt).toLocaleDateString('tr-TR') : 'BEKLEMEDE'}
                                      </span>
                                   </div>
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                </div>

                {/* Alt Aksiyon Çubuğu */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex gap-4">
                   <button className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95">Revize Talep Et</button>
                   {selectedItem.status !== WorkItemStatus.APPROVED && (
                     <button onClick={() => navigate('/approvals')} className="flex-2 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <ArrowRightCircle size={16} /> Onay Ekranına Git
                     </button>
                   )}
                   {selectedItem.status === WorkItemStatus.APPROVED && (
                     <button onClick={handleOrderIssuance} className="flex-2 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Truck size={16} /> Sipariş Emri (PO) Yayınla
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Yeni PR Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">Satınalma Requisition</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Kurumsal PR Protokolü</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('requestSubject')}</label>
                    <input 
                      type="text" 
                      value={newPr.title}
                      onChange={(e) => setNewPr({...newPr, title: e.target.value})}
                      placeholder="Örn: 200m3 C30 Beton Alımı - Faz 2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('totalAmount')}</label>
                      <div className="relative">
                        <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" 
                          value={newPr.amount}
                          onChange={(e) => setNewPr({...newPr, amount: Number(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none shadow-inner" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('category')}</label>
                      <select 
                        value={newPr.category}
                        onChange={(e) => setNewPr({...newPr, category: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                      >
                         <option value="MALZEME">Materyal / Ham Madde</option>
                         <option value="HIZMET">Profesyonel Servis</option>
                         <option value="FINANS">Avans Ödemesi</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('site')}</label>
                    <select 
                      value={newPr.siteId}
                      onChange={(e) => setNewPr({...newPr, siteId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                    >
                       <option value="SAHA-A">Saha Kuzey Entegrasyonu</option>
                       <option value="SAHA-B">Ankara Lojistik Hub</option>
                       <option value="SAHA-C">İzmir Liman Kompleksi</option>
                    </select>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  disabled={isProcessing}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
                 >
                   İptal
                 </button>
                 <button 
                  disabled={isProcessing}
                  onClick={handleCreate}
                  className="flex-2 px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                   {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckSquare size={20} />} 
                   Onay Akışına Sevk Et
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementCenter;
