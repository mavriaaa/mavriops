
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemType, WorkItemStatus, Priority, Role, Attachment } from '../../types';
import { MOCK_USERS, ENABLE_RACI } from '../../constants';
import { 
  Search, Clock, AlertTriangle, CheckCircle2, 
  ChevronRight, Tag, Zap, Paperclip, UserPlus, 
  X, FileText, CheckCircle, Info, ShieldCheck, 
  HardHat, Camera, Send, MapPin, Layers, Eye,
  History, User, Image as ImageIcon, Calendar,
  TrendingUp, Filter, Plus, ClipboardList
} from 'lucide-react';
import UserAvatar from '../Common/UserAvatar';
import AttachmentList from '../Common/AttachmentList';
import RaciPanel from './RaciPanel';
import EmptyState from '../Common/EmptyState';
import Timeline from '../Common/Timeline';

const WorkItemCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [filter, setFilter] = useState<WorkItemType | 'HEPSİ'>('HEPSİ');
  const [detailItem, setDetailItem] = useState<WorkItem | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  const [newTaskData, setNewTaskData] = useState({
    title: '', description: '', siteId: 'site-a', priority: Priority.MEDIUM, assigneeId: ''
  });

  useEffect(() => {
    load();
  }, [filter, context?.activeProjectId]);

  const load = async () => {
    if (!context?.activeProjectId) return;
    const data = await ApiService.fetchWorkItems();
    const projectItems = data.filter(i => i.projectId === context.activeProjectId);
    setItems(filter === 'HEPSİ' ? projectItems : projectItems.filter(i => i.type === filter));
    
    if (detailItem) {
        const updated = projectItems.find(x => x.id === detailItem.id);
        if (updated) setDetailItem(updated);
    }
  };

  if (!context) return null;
  const { t, currentUser, addToast, refreshMetrics, activeProjectId } = context;

  const handleQuickCreate = async () => {
    if (!newTaskData.title || !newTaskData.assigneeId) {
        addToast('warning', 'Eksik Bilgi', 'Lütfen başlık ve sorumlu personel seçiniz.');
        return;
    }
    await ApiService.createWorkItem({ 
        ...newTaskData, 
        type: WorkItemType.TASK, 
        status: WorkItemStatus.IN_PROGRESS, 
        progress: 0,
        projectId: activeProjectId 
    }, currentUser);
    
    setIsNewTaskModalOpen(false);
    setNewTaskData({ title: '', description: '', siteId: 'site-a', priority: Priority.MEDIUM, assigneeId: '' });
    load();
    refreshMetrics();
    addToast('success', 'Görev Atandı', 'İş başarıyla ilgili personele iletildi.');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <ClipboardList size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('workItems')}</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Operasyonel Görev Dağıtım Merkezi
              </p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="İş ID veya Başlık ara..."
                className="pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold w-72 outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all" 
              />
           </div>
           <button 
            onClick={() => setIsNewTaskModalOpen(true)} 
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"
           >
             <Plus size={18} /> {t('newWorkItem')}
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
         {items.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                   <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 w-40 text-center">Öncelik</th>
                      <th className="px-8 py-5">İş Kalemi & Saha</th>
                      <th className="px-8 py-5 w-60">Sorumlu</th>
                      <th className="px-8 py-5 w-40">Durum</th>
                      <th className="px-8 py-5 w-20 text-right">İşlem</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {items.map(item => {
                     const assignee = MOCK_USERS.find(u => u.id === item.assigneeId);
                     return (
                       <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group">
                          <td className="px-8 py-6 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                item.priority === Priority.CRITICAL ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                             }`}>{item.priority}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="min-w-0">
                                <p className="text-sm font-black dark:text-white truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 mt-1">
                                   <MapPin size={10} className="text-indigo-500" /> {item.siteId} <span className="opacity-30">|</span> {item.id}
                                </p>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             {assignee ? (
                               <div className="flex items-center gap-3">
                                  <UserAvatar name={assignee.name} size="sm" />
                                  <div>
                                     <p className="text-[11px] font-black dark:text-slate-200 leading-none uppercase">{assignee.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{assignee.role}</p>
                                  </div>
                               </div>
                             ) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ATANMADI</span>}
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.status === WorkItemStatus.DONE ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                                <span className="text-[10px] font-black dark:text-slate-300 uppercase tracking-widest">{item.status}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1 inline-block" />
                          </td>
                       </tr>
                     );
                   })}
                </tbody>
            </table>
         ) : (
             <EmptyState 
                title="İş Kaydı Bulunmuyor" 
                description="Seçilen proje veya filtre kriterlerine uygun aktif görev bulunamadı."
                actionLabel="Görev Ataması Başlat"
                onAction={() => setIsNewTaskModalOpen(true)}
             />
         )}
      </div>

      {detailItem && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/60 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-700 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Eye size={24} /></div>
                    <div>
                       <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">İş Detayı</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detailItem.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setDetailItem(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors"><X size={24} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                 <section className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <h3 className="text-2xl font-black dark:text-white uppercase leading-tight mb-6">{detailItem.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{detailItem.description}</p>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mevcut Statü</p>
                          <span className="text-sm font-black dark:text-white uppercase">{detailItem.status}</span>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kritiklik</p>
                          <span className={`text-sm font-black uppercase ${detailItem.priority === Priority.CRITICAL ? 'text-rose-500' : 'dark:text-white'}`}>{detailItem.priority}</span>
                       </div>
                    </div>
                 </section>

                 <section>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3"><History size={18} className="text-indigo-500" /> Audit Timeline</h4>
                    <Timeline events={detailItem.timeline || []} />
                 </section>

                 {ENABLE_RACI && (
                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <RaciPanel workItem={detailItem} currentUser={currentUser} onUpdate={load} />
                    </section>
                 )}
              </div>

              <footer className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-900 shrink-0">
                 <button onClick={() => setDetailItem(null)} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all text-center">Kapat</button>
                 <button className="flex-2 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">Dosyaları İndir</button>
              </footer>
           </div>
        </div>
      )}

      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-slate-800/50 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Yeni Görev</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Saha Operasyon Kaydı</p>
                 </div>
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Görev Başlığı</label>
                    <input 
                      type="text" 
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                      placeholder="Örn: Kolon Donatı Kontrolü"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none shadow-inner" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Öncelik</label>
                      <select 
                        value={newTaskData.priority}
                        onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none"
                      >
                         <option value={Priority.LOW}>Düşük</option>
                         <option value={Priority.MEDIUM}>Orta</option>
                         <option value={Priority.HIGH}>Yüksek</option>
                         <option value={Priority.CRITICAL}>Kritik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sorumlu Personel</label>
                      <select 
                        value={newTaskData.assigneeId}
                        onChange={(e) => setNewTaskData({...newTaskData, assigneeId: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none"
                      >
                         <option value="">Seçiniz...</option>
                         {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50/50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all">İptal</button>
                 <button onClick={handleQuickCreate} className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl active:scale-95 transition-all">Onayla ve Ata</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkItemCenter;
