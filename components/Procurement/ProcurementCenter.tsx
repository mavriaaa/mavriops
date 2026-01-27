
import React, { useContext, useState, useEffect } from 'react';
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
  History
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemType, WorkItemStatus, Role, Priority } from '../../types';
import { MOCK_USERS } from '../../constants';

const ProcurementCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPr, setNewPr] = useState({
    title: '',
    amount: 0,
    category: 'MALZEME',
    siteId: 'SAHA-A'
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const all = await ApiService.fetchWorkItems();
    setItems(all.filter(i => i.type === WorkItemType.REQUEST));
  };

  if (!context) return null;
  const { t, currentUser } = context;

  const handleCreate = async () => {
    if (!newPr.title) return;
    await ApiService.createWorkItem({
      type: WorkItemType.REQUEST,
      title: newPr.title,
      priority: newPr.amount > 20000 ? Priority.HIGH : Priority.MEDIUM,
      siteId: newPr.siteId,
      requestData: {
        amount: newPr.amount,
        currency: 'TRY',
        category: newPr.category,
        costCenter: 'SATINALMA-24',
        items: [],
        approvalChain: []
      }
    }, currentUser);
    setIsModalOpen(false);
    load();
  };

  const getLastApprover = (item: WorkItem) => {
    if (!item.requestData) return null;
    const approvedSteps = item.requestData.approvalChain.filter(s => s.status === 'APPROVED');
    if (approvedSteps.length === 0) return null;
    const lastStep = approvedSteps[approvedSteps.length - 1];
    const user = MOCK_USERS.find(u => u.id === lastStep.userId);
    return user ? { name: user.name, date: lastStep.decidedAt } : null;
  };

  const getActiveStep = (item: WorkItem) => {
    return item.requestData?.approvalChain.find(s => s.status === 'PENDING');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      {/* Başlık ve Aksiyonlar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
              {t('procurement')}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Tedarik Zinciri ve Satınalma Motoru</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95"
           >
             <Plus size={18} /> Yeni Satınalma Talebi
           </button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kuyruk Durumu</p>
              <h3 className="text-3xl font-black dark:text-white">{items.filter(i => i.status === WorkItemStatus.IN_REVIEW).length} Talep</h3>
              <p className="text-xs font-bold text-emerald-500 mt-2">İnceleme Bekleyen</p>
           </div>
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Package size={32} />
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-all shadow-sm">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Onaylananlar</p>
              <h3 className="text-3xl font-black dark:text-white">{items.filter(i => i.status === WorkItemStatus.APPROVED).length} Sipariş</h3>
              <p className="text-xs font-bold text-indigo-500 mt-2">Sipariş Emri Oluşturuldu</p>
           </div>
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Truck size={32} />
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-rose-500 transition-all shadow-sm">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reddedilenler</p>
              <h3 className="text-3xl font-black dark:text-white">{items.filter(i => i.status === WorkItemStatus.REJECTED).length} Talep</h3>
              <p className="text-xs font-bold text-rose-500 mt-2">Bütçe / Kriter Dışı</p>
           </div>
           <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
              <AlertCircle size={32} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Talep Listesi */}
        <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
                 <FileText className="text-emerald-500" /> Aktif Satınalma Talepleri
               </h2>
               <div className="flex gap-2">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input type="text" placeholder="Ara..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5">Durum</th>
                      <th className="px-8 py-5">Talep ve ID</th>
                      <th className="px-8 py-5">Tutar</th>
                      <th className="px-8 py-5">Son Onaylayan</th>
                      <th className="px-8 py-5 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map(item => {
                      const lastApprover = getLastApprover(item);
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedItem?.id === item.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                        >
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                              item.status === WorkItemStatus.APPROVED ? 'bg-emerald-100 text-emerald-600' :
                              item.status === WorkItemStatus.REJECTED ? 'bg-rose-100 text-rose-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-xs font-black dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{item.title}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{item.id} • {item.siteId}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs font-black dark:text-white">₺{item.requestData?.amount.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-6">
                            {lastApprover ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                    <CheckCircle2 size={12} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black dark:text-white uppercase">{lastApprover.name}</p>
                                    <p className="text-[9px] text-slate-400">{new Date(lastApprover.date || '').toLocaleDateString()}</p>
                                 </div>
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Onay Bekleniyor</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 inline-block transition-transform group-hover:translate-x-1" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Detay Paneli */}
        {selectedItem && (
          <div className="lg:col-span-5 animate-in slide-in-from-right duration-500">
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-2xl sticky top-10">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Talep Detayı</h2>
                   <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-8">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Başlık ve ID</p>
                      <h3 className="text-lg font-black dark:text-white uppercase leading-tight mb-2">{selectedItem.title}</h3>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{selectedItem.id} | {selectedItem.siteId}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Toplam Tutar</p>
                         <p className="text-xl font-black dark:text-white">₺{selectedItem.requestData?.amount.toLocaleString()}</p>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Öncelik</p>
                         <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                           selectedItem.priority === Priority.CRITICAL ? 'bg-rose-500 text-white' :
                           selectedItem.priority === Priority.HIGH ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                         }`}>
                           {selectedItem.priority}
                         </span>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <History size={14} className="text-emerald-500" /> Onay Geçmişi ve Zinciri
                      </h4>
                      <div className="space-y-6 relative">
                         {/* Dikey Çizgi */}
                         <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800" />
                         
                         {selectedItem.requestData?.approvalChain.map((step, i) => {
                           const approver = step.userId ? MOCK_USERS.find(u => u.id === step.userId) : null;
                           return (
                             <div key={i} className="flex gap-6 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                  step.status === 'APPROVED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                  step.status === 'PENDING' ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse' :
                                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                                }`}>
                                   {step.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black">{step.stepNo}</span>}
                                </div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <p className={`text-[11px] font-black uppercase ${step.status === 'PENDING' ? 'text-emerald-600' : 'text-slate-500'}`}>{step.roleRequired}</p>
                                         {approver && <p className="text-[10px] font-bold dark:text-white mt-0.5">{approver.name}</p>}
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-400">
                                         {step.decidedAt ? new Date(step.decidedAt).toLocaleDateString() : 'BEKLİYOR'}
                                      </span>
                                   </div>
                                   {step.note && (
                                     <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-emerald-500">
                                        <p className="text-[10px] font-medium text-slate-500 italic">"{step.note}"</p>
                                     </div>
                                   )}
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                      <button className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-2xl hover:bg-slate-200 transition-all">Reddet</button>
                      <button className="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all">Sipariş Emri Çık</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Yeni PR Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Yeni Satınalma Talebi</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem üzerinden onay akışı başlatılır</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Talep Başlığı</label>
                    <input 
                      type="text" 
                      value={newPr.title}
                      onChange={(e) => setNewPr({...newPr, title: e.target.value})}
                      placeholder="Örn: 200 Ton Çimento Satınalma"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tahmini Tutar (TRY)</label>
                      <div className="relative">
                        <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" 
                          value={newPr.amount}
                          onChange={(e) => setNewPr({...newPr, amount: Number(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori</label>
                      <select 
                        value={newPr.category}
                        onChange={(e) => setNewPr({...newPr, category: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="MALZEME">Malzeme</option>
                         <option value="HIZMET">Hizmet / Servis</option>
                         <option value="FINANS">Finans / Avans</option>
                      </select>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all"
                 >
                   İptal
                 </button>
                 <button 
                  onClick={handleCreate}
                  className="flex-2 px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                 >
                   <CheckSquare size={18} /> Talebi Başlat
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementCenter;
