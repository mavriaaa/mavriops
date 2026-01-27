
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Role, Priority } from '../../types';
import { MOCK_USERS } from '../../constants';
import { 
  Check, X, Clock, ShieldCheck, 
  ChevronRight, AlertCircle, Info, History, User, UserCheck
} from 'lucide-react';

const ApprovalsInbox: React.FC = () => {
  const context = useContext(AppContext);
  const [pendingItems, setPendingItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  useEffect(() => {
    load();
  }, [context?.currentUser.role]);

  const load = async () => {
    const items = await ApiService.fetchWorkItems();
    const filtered = items.filter(i => {
      const activeStep = i.requestData?.approvalChain.find(s => s.status === 'PENDING');
      return activeStep && (activeStep.roleRequired === context?.currentUser.role || context?.currentUser.role === Role.OWNER);
    });
    setPendingItems(filtered);
  };

  if (!context) return null;
  const { t, currentUser } = context;

  const handleApprove = async () => {
    if (!selectedItem) return;
    await ApiService.approveStep(selectedItem.id, currentUser, decisionNote || 'Sistem üzerinden onaylandı.');
    setSelectedItem(null);
    setDecisionNote('');
    load();
  };

  const getLastApprover = (item: WorkItem) => {
    if (!item.requestData) return null;
    const approvedSteps = [...item.requestData.approvalChain].filter(s => s.status === 'APPROVED');
    if (approvedSteps.length === 0) return null;
    const lastStep = approvedSteps[approvedSteps.length - 1];
    return MOCK_USERS.find(u => u.id === lastStep.userId);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
            {t('pendingApprovals')}
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-2">
            <ShieldCheck size={12} className="text-indigo-500" /> Karar ve Onay Kontrol Merkezi
          </p>
        </div>
        <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
          Toplam Bekleyen: {pendingItems.length} İşlem
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Sol Liste Paneli */}
        <div className="xl:col-span-7 space-y-4">
           {pendingItems.length > 0 ? pendingItems.map(item => {
             const lastApprover = getLastApprover(item);
             return (
               <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className={`group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl ${
                  selectedItem?.id === item.id ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800'
                }`}
               >
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                          item.priority === Priority.CRITICAL ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'
                        }`}>{item.priority}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                     </div>
                     <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                        <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                     </div>
                  </div>

                  <div className="flex items-start justify-between">
                     <div className="space-y-4">
                        <h2 className="text-xl font-black dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight uppercase leading-tight">{item.title}</h2>
                        <div className="flex items-center gap-8">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Tutar</p>
                              <p className="text-lg font-black dark:text-white">₺{item.requestData?.amount.toLocaleString()}</p>
                           </div>
                           <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Lokasyon</p>
                              <p className="text-xs font-bold dark:text-white uppercase">{item.siteId}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {lastApprover && (
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <UserCheck size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">En Son Onaylayan</p>
                          <p className="text-[10px] font-black dark:text-white uppercase">{lastApprover.name}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">BİR ÜST ONAY BEKLENİYOR</span>
                    </div>
                  )}
               </div>
             );
           }) : (
             <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <ShieldCheck size={64} className="text-slate-200 mb-6" />
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">Karar Kuyruğu Temiz</h3>
                <p className="text-xs text-slate-400 font-medium mt-2">Onay bekleyen herhangi bir işlem bulunmamaktadır.</p>
             </div>
           )}
        </div>

        {/* Sağ Detay Paneli */}
        <div className="xl:col-span-5">
           {selectedItem ? (
             <div className="sticky top-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-2xl animate-in slide-in-from-right-10 duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <ShieldCheck size={200} />
                </div>
                
                <h3 className="text-2xl font-black dark:text-white tracking-tighter uppercase mb-8 flex items-center gap-3">
                  <History className="text-indigo-600" /> Onay Zinciri
                </h3>
                
                <div className="space-y-8 relative">
                   {/* Dikey Çizgi */}
                   <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-50 dark:bg-slate-800" />

                   <div className="space-y-6">
                      {selectedItem.requestData?.approvalChain.map((step, i) => (
                        <div key={i} className="flex gap-6 relative z-10">
                           <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                             step.status === 'APPROVED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                             step.status === 'PENDING' ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 animate-pulse' :
                             'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                           }`}>
                              {step.status === 'APPROVED' ? <Check size={18} /> : <span className="text-[11px] font-black">{step.stepNo}</span>}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className={`text-[11px] font-black uppercase tracking-widest ${step.status === 'PENDING' ? 'text-indigo-600' : 'text-slate-500'}`}>{step.roleRequired}</p>
                                    {step.userId && <p className="text-[10px] font-bold dark:text-white mt-1 uppercase">{MOCK_USERS.find(u => u.id === step.userId)?.name}</p>}
                                 </div>
                                 <span className="text-[9px] font-bold text-slate-400">
                                    {step.decidedAt ? new Date(step.decidedAt).toLocaleDateString('tr-TR') : 'BEKLİYOR'}
                                 </span>
                              </div>
                              {step.note && (
                                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-2 border-emerald-500">
                                   <p className="text-[10px] italic text-slate-500">"{step.note}"</p>
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Karar Notu</label>
                      <textarea 
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner resize-none"
                        placeholder="Karar gerekçenizi buraya ekleyin..."
                      />
                   </div>

                   <div className="flex gap-4">
                      <button className="flex-1 py-5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all active:scale-95">Reddet</button>
                      <button 
                        onClick={handleApprove}
                        className="flex-2 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                         <Check size={20} /> Talebi Onayla
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center opacity-40 h-[600px]">
                <Info size={48} className="mb-6 text-slate-300" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Onay Sürecini Görmek İçin Öğe Seçin</h3>
                <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">Seçilen talebin tüm onay adımları ve geçmişi burada listelenecektir.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalsInbox;
