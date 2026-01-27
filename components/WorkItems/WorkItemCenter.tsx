
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemType, WorkItemStatus, Priority, Role, Attachment } from '../../types';
import { MOCK_USERS } from '../../constants';
import { 
  Search, Clock, AlertTriangle, CheckCircle2, 
  ChevronRight, Tag, Zap, Paperclip, UserPlus, 
  X, FileText, CheckCircle, Info, ShieldCheck, 
  HardHat, Camera, Send, MapPin, Layers, Eye,
  History, User, Image as ImageIcon, Calendar,
  TrendingUp, Filter, Plus
} from 'lucide-react';
import AttachmentList from '../Common/AttachmentList';

const WorkItemCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [filter, setFilter] = useState<WorkItemType | 'HEPSİ'>('HEPSİ');
  const [detailItem, setDetailItem] = useState<WorkItem | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [completeModalItem, setCompleteModalItem] = useState<WorkItem | null>(null);
  const [completionData, setCompletionData] = useState({ note: '', attachments: [] as Attachment[] });
  
  const [newTaskData, setNewTaskData] = useState({
    title: '', description: '', siteId: 'site-a', priority: Priority.MEDIUM, assigneeId: ''
  });

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    const data = await ApiService.fetchWorkItems();
    setItems(filter === 'HEPSİ' ? data : data.filter(i => i.type === filter));
  };

  if (!context) return null;
  const { t, currentUser, addToast } = context;

  const canAssign = [Role.OWNER, Role.MANAGER, Role.SUPERVISOR, Role.ADMIN].includes(currentUser.role);

  const handleQuickCreate = async () => {
    if (!newTaskData.title || !newTaskData.assigneeId) {
        addToast('warning', 'Eksik Bilgi', 'Lütfen başlık ve sorumlu personel seçiniz.');
        return;
    }
    await ApiService.createWorkItem({ 
        ...newTaskData, 
        type: WorkItemType.TASK, 
        status: WorkItemStatus.IN_PROGRESS, 
        progress: 0 
    }, currentUser);
    
    setIsNewTaskModalOpen(false);
    setNewTaskData({ title: '', description: '', siteId: 'site-a', priority: Priority.MEDIUM, assigneeId: '' });
    load();
    addToast('success', 'Görev Atandı', 'İş başarıyla ilgili personele iletildi.');
  };

  const handleComplete = async () => {
    if (!completeModalItem || !completionData.note || completionData.attachments.length === 0) {
        addToast('warning', 'Kanıt Gerekli', 'Lütfen tamamlama notu ve en az bir görsel kanıt ekleyin.');
        return;
    }
    await ApiService.completeWorkItem(completeModalItem.id, completionData, currentUser.id);
    setCompleteModalItem(null);
    setCompletionData({ note: '', attachments: [] });
    load();
    addToast('success', 'İş Tamamlandı', 'Saha kanıtları ve rapor arşive eklendi.');
  };

  return (
    <div className="p-8 space-y-6 flex flex-col h-full bg-slate-50 dark:bg-[#020617]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-white uppercase">{t('workItems')}</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
             <p className="text-[12px] font-medium text-slate-500">Merkezi Operasyon ve Görev Takibi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="ID veya Başlık ara..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" 
              />
           </div>
           {canAssign && (
             <button 
              onClick={() => setIsNewTaskModalOpen(true)} 
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
             >
               <Plus size={16} /> Görev Dağıt
             </button>
           )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit rounded-xl">
         {['HEPSİ', WorkItemType.REQUEST, WorkItemType.TASK, WorkItemType.REPORT].map((type) => (
           <button 
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
              filter === type ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
           >
             {type === 'HEPSİ' ? 'TÜMÜ' : type}
           </button>
         ))}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-1">
         <table className="w-full text-left border-collapse table-fixed">
            <thead>
               <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 w-32">Kimlik & Önc.</th>
                  <th className="px-6 py-4">Görev & Saha</th>
                  <th className="px-6 py-4 w-48">Sorumlu</th>
                  <th className="px-6 py-4 w-32">Durum</th>
                  <th className="px-6 py-4 w-20 text-right">İşlem</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {items.map(item => {
                 const assignee = MOCK_USERS.find(u => u.id === item.assigneeId);
                 const isMe = item.assigneeId === currentUser.id;
                 
                 return (
                   <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer group">
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-indigo-600">{item.id}</span>
                            <div className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.priority === Priority.CRITICAL ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>{item.priority}</div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="min-w-0">
                            <p className="text-[13px] font-semibold dark:text-white truncate uppercase tracking-tight">{item.title}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {item.siteId}</p>
                            <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                               <div style={{ width: `${item.progress || 0}%` }} className="h-full bg-indigo-500 transition-all duration-500" />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         {assignee ? (
                           <div className="flex items-center gap-2.5">
                              <img src={assignee.avatar} className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                              <div className="min-w-0">
                                 <p className="text-[12px] font-semibold truncate dark:text-slate-200">{assignee.name}</p>
                                 <p className="text-[10px] text-slate-500 uppercase">{assignee.role}</p>
                              </div>
                           </div>
                         ) : <span className="text-[11px] text-slate-400 italic">Atanmamış</span>}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === WorkItemStatus.DONE ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="text-[11px] font-bold dark:text-slate-300 uppercase">{item.status}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {item.status !== WorkItemStatus.DONE && isMe ? (
                            <button onClick={(e) => { e.stopPropagation(); setCompleteModalItem(item); }} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"><CheckCircle size={18} /></button>
                         ) : (
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 inline-block" />
                         )}
                      </td>
                   </tr>
                 );
               })}
            </tbody>
         </table>
      </div>

      {/* Detail Drawer */}
      {detailItem && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800 flex flex-col">
              <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg"><Eye size={20} /></div>
                    <div>
                       <h2 className="text-lg font-bold dark:text-white tracking-tight uppercase">İş Detayı</h2>
                       <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{detailItem.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setDetailItem(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                 <section className="space-y-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                       <h3 className="text-lg font-bold dark:text-white uppercase leading-tight mb-4">{detailItem.title}</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Statü</p>
                             <p className="text-[13px] font-semibold dark:text-white uppercase mt-1">{detailItem.status}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Öncelik</p>
                             <p className="text-[13px] font-semibold dark:text-white uppercase mt-1">{detailItem.priority}</p>
                          </div>
                       </div>
                       <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} /> İlerleme</span>
                             <span className="text-sm font-bold text-indigo-600">%{detailItem.progress || 0}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div style={{ width: `${detailItem.progress || 0}%` }} className="h-full bg-indigo-500 transition-all duration-1000" />
                          </div>
                       </div>
                    </div>
                 </section>

                 <section>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} /> Açıklama</h4>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                       {detailItem.description || 'Ek açıklama bulunmuyor.'}
                    </p>
                 </section>

                 {detailItem.status === WorkItemStatus.DONE && (
                   <section className="space-y-4 animate-in fade-in duration-500">
                      <h4 className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Saha Geri Bildirimi</h4>
                      <div className="p-6 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl">
                         <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-6">"{detailItem.completionNote}"</p>
                         <AttachmentList attachments={detailItem.attachments} onUpload={()=>{}} onRemove={()=>{}} isReadOnly={true} />
                      </div>
                   </section>
                 )}
              </div>

              <footer className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900">
                 <button onClick={() => setDetailItem(null)} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all text-center">Kapat</button>
                 <button className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Geçmişi Gör</button>
              </footer>
           </div>
        </div>
      )}

      {/* Merkezi Görev Dağıtım Modalı */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
                 <div>
                    <h2 className="text-lg font-bold dark:text-white tracking-tight uppercase">Yeni Görev Dağıt</h2>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Personel ataması ve operasyonel planlama</p>
                 </div>
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Görev Başlığı</label>
                    <input 
                      type="text" 
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                      placeholder="Örn: Saha A Beton Dökümü"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Detaylar</label>
                    <textarea 
                      value={newTaskData.description}
                      onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                      placeholder="İş tanımı ve talimatlar..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all h-24 resize-none" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Öncelik</label>
                      <select 
                        value={newTaskData.priority}
                        onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-medium dark:text-white outline-none"
                      >
                         <option value={Priority.LOW}>Düşük</option>
                         <option value={Priority.MEDIUM}>Orta</option>
                         <option value={Priority.HIGH}>Yüksek</option>
                         <option value={Priority.CRITICAL}>Kritik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Lokasyon</label>
                      <select 
                        value={newTaskData.siteId}
                        onChange={(e) => setNewTaskData({...newTaskData, siteId: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-medium dark:text-white outline-none"
                      >
                         <option value="site-a">İstanbul Kuzey</option>
                         <option value="site-b">Ankara Batı</option>
                         <option value="site-c">İzmir Lojistik</option>
                      </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Sorumlu Personel</label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                       {MOCK_USERS.map(u => (
                         <button 
                          key={u.id}
                          onClick={() => setNewTaskData({...newTaskData, assigneeId: u.id})}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${
                            newTaskData.assigneeId === u.id 
                            ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                         >
                            <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                               <p className="text-xs font-bold dark:text-white">{u.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase">{u.role}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all">İptal</button>
                 <button onClick={handleQuickCreate} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all">Görevi Onayla</button>
              </div>
           </div>
        </div>
      )}

      {/* Saha Geri Bildirim Modalı (Görevi Kapat) */}
      {completeModalItem && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg"><HardHat size={20} /></div>
                    <div>
                       <h2 className="text-lg font-bold dark:text-white tracking-tight uppercase">İşi Tamamla</h2>
                       <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Saha raporu ve kanıt gönderimi</p>
                    </div>
                 </div>
                 <button onClick={() => setCompleteModalItem(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Tamamlama Raporu</label>
                    <textarea 
                      value={completionData.note}
                      onChange={(e) => setCompletionData({...completionData, note: e.target.value})}
                      placeholder="Yapılan işlemler hakkında kısa bilgi verin..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all h-24 resize-none" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Saha Fotoğrafları (Zorunlu)</label>
                    <AttachmentList 
                      attachments={completionData.attachments}
                      onUpload={(a) => setCompletionData(prev => ({ ...prev, attachments: [...prev.attachments, a] }))}
                      onRemove={(id) => setCompletionData(prev => ({ ...prev, attachments: prev.attachments.filter(x => x.id !== id) }))}
                    />
                 </div>
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex gap-3">
                    <Info size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Gönderdiğiniz kanıtlar hakediş ve kalite kontrol süreçleri için arşivlenecektir.</p>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                 <button onClick={() => setCompleteModalItem(null)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all">İptal</button>
                 <button 
                  onClick={handleComplete}
                  disabled={!completionData.note || completionData.attachments.length === 0}
                  className="flex-1 py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Kanıtları Onayla ve Kapat
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkItemCenter;
