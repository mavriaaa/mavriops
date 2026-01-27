
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../App';
import { 
  Truck, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  MoreVertical,
  Plus,
  Send,
  Radio as RadioIcon,
  User,
  Image as ImageIcon,
  ChevronRight,
  Zap,
  Users,
  BarChart3,
  X,
  Target,
  Settings,
  BellRing,
  Info,
  Timer,
  HardHat,
  Construction
} from 'lucide-react';

interface DispatchTask {
  id: string;
  task: string;
  team: string;
  priority: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  status: 'BEKLEMEDE' | 'YOLDA' | 'SAHADA' | 'TAMAMLANDI';
  deadline: string;
  siteId: string;
  progress: number; // Yüzde bazlı ilerleme
  description?: string;
  assignedEquipment?: string[];
}

const FieldOpsBoard: React.FC = () => {
  const context = useContext(AppContext);
  const [activeSiteId, setActiveSiteId] = useState('SAHA-A');
  const [chatMessage, setChatMessage] = useState('');
  const [siteMessages, setSiteMessages] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<DispatchTask | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [dispatches, setDispatches] = useState<DispatchTask[]>([
    { id: 'DP-001', task: 'Faz 2 Kazı İşlemleri', team: 'Mavi Ekip', priority: 'YÜKSEK', status: 'SAHADA', deadline: 'Bugün 17:00', siteId: 'SAHA-A', progress: 65, description: 'Temel kazısı için ekskavatör yönlendirmesi yapıldı.', assignedEquipment: ['Ekskavatör-01', 'Damperli Kamyon-04'] },
    { id: 'DP-002', task: 'Elektrik Tesisat Kurulumu', team: 'Voltaj Takımı', priority: 'ORTA', status: 'YOLDA', deadline: 'Yarın 10:00', siteId: 'SAHA-A', progress: 10, description: 'C blok iç tesisat kablolama çalışması.' },
    { id: 'DP-003', task: 'Malzeme Tedarik Teslimatı', team: 'Lojistik A', priority: 'KRİTİK', status: 'BEKLEMEDE', deadline: '2 Saat İçinde', siteId: 'SAHA-A', progress: 0, description: 'Acil çimento sevkiyatı bekleniyor.' },
    { id: 'DP-004', task: 'Kule Vinç Bakımı', team: 'Teknik Ekip', priority: 'YÜKSEK', status: 'TAMAMLANDI', deadline: 'Tamamlandı', siteId: 'SAHA-B', progress: 100, description: 'Rutin aylık periyodik bakım tamamlandı.' },
  ]);

  const [newTask, setNewTask] = useState<Partial<DispatchTask>>({
    task: '',
    team: '',
    priority: 'ORTA',
    status: 'BEKLEMEDE',
    progress: 0
  });

  const [sites, setSites] = useState([
    { id: 'SAHA-A', name: 'İstanbul Kuzey', progress: 68, workers: 42, status: 'Aktif' },
    { id: 'SAHA-B', name: 'Ankara Batı Hub', progress: 42, workers: 28, status: 'Yavaş' },
    { id: 'SAHA-C', name: 'İzmir Lojistik', progress: 95, workers: 15, status: 'Tamamlanmak Üzere' },
  ]);

  if (!context) return null;
  const { t, currentUser } = context;

  useEffect(() => {
    const history = [
      { id: '1', user: 'Barış Mühendis', text: 'Beton mikseri kapıda bekliyor, onay bekliyoruz.', time: '09:12', siteId: 'SAHA-A' },
      { id: '2', user: 'Caner Şef', text: 'Onay verildi, döküme başlayabilirsiniz.', time: '09:15', siteId: 'SAHA-A' },
      { id: '3', user: 'Mert Saha', text: 'Vibratör arızalandı, yedek lazım.', time: '10:02', siteId: 'SAHA-A' },
    ];
    setSiteMessages(history.filter(m => m.siteId === activeSiteId));
  }, [activeSiteId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [siteMessages]);

  const handleSendMessage = (text?: string) => {
    const msgToSend = text || chatMessage;
    if (!msgToSend.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      user: currentUser.name,
      text: msgToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      siteId: activeSiteId
    };
    setSiteMessages(prev => [...prev, newMsg]);
    if (!text) setChatMessage('');
  };

  const handleCreateDispatch = () => {
    if (!newTask.task || !newTask.team) return;
    const item: DispatchTask = {
      id: `DP-${Math.floor(100 + Math.random() * 900)}`,
      task: newTask.task,
      team: newTask.team,
      priority: newTask.priority || 'ORTA',
      status: 'BEKLEMEDE',
      deadline: 'Yeni Atandı',
      siteId: activeSiteId,
      progress: 0
    };
    setDispatches([item, ...dispatches]);
    setIsNewTaskModalOpen(false);
    setNewTask({ task: '', team: '', priority: 'ORTA', progress: 0 });
    handleSendMessage(`📢 YENİ GÖREV: ${item.task} (${item.team}) sahaya atandı.`);
  };

  const updateTaskStatus = (taskId: string, newStatus: DispatchTask['status']) => {
    const updated = dispatches.map(d => {
      if (d.id === taskId) {
        let prog = d.progress;
        if (newStatus === 'TAMAMLANDI') prog = 100;
        if (newStatus === 'BEKLEMEDE') prog = 0;
        return { ...d, status: newStatus, progress: prog };
      }
      return d;
    });
    setDispatches(updated);
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus, progress: newStatus === 'TAMAMLANDI' ? 100 : prev.progress } : null);
    }

    if (newStatus === 'TAMAMLANDI') {
       setSites(sites.map(s => s.id === activeSiteId ? { ...s, progress: Math.min(100, s.progress + 5) } : s));
    }

    handleSendMessage(`🔄 DURUM GÜNCELLEME: ${taskId} nolu görev artık [${newStatus}] durumunda.`);
  };

  const handleTaskClick = (job: DispatchTask) => {
    setSelectedTask(job);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'YOLDA': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'SAHADA': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'TAMAMLANDI': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'KRİTİK': return 'bg-rose-600 text-white';
      case 'YÜKSEK': return 'bg-orange-500 text-white';
      case 'ORTA': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0];

  return (
    <div className="p-8 space-y-8 h-full flex flex-col animate-in fade-in duration-700 overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Üst Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
            <RadioIcon size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
              {t('fieldOps')}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Target size={12} className="text-indigo-500" /> Komuta Merkezi: {activeSite.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
           >
             <Plus size={18} /> Yeni Sevkıyat
           </button>
        </div>
      </div>

      {/* Saha Seçici */}
      <div className="flex gap-4 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        {sites.map(site => (
          <button 
            key={site.id}
            onClick={() => setActiveSiteId(site.id)}
            className={`relative min-w-[280px] p-6 rounded-[2rem] border-2 transition-all text-left group overflow-hidden ${
              activeSiteId === site.id 
                ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-2xl shadow-indigo-600/10' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            {activeSiteId === site.id && (
              <div className="absolute top-0 right-0 p-4">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-xl ${activeSiteId === site.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                  <MapPin size={20} />
               </div>
               <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${activeSiteId === site.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                 {site.id}
               </span>
            </div>
            <h3 className="font-black text-lg dark:text-white tracking-tight mb-1">{site.name}</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <Users size={12} /> {site.workers} Personel <span className="text-slate-200">|</span> <Activity size={12} /> {site.status}
            </div>
            <div className="mt-5 space-y-1.5">
               <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="text-slate-400">Genel İlerleme</span>
                  <span className="text-indigo-600 font-bold">%{site.progress}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${site.progress}%` }} 
                    className={`h-full transition-all duration-1000 ${activeSiteId === site.id ? 'bg-indigo-600' : 'bg-slate-300'}`} 
                  />
               </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        
        {/* Görev Listesi */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-h-0 overflow-hidden">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                 <div>
                    <h2 className="text-lg font-black dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                      <Zap size={20} className="text-indigo-500" /> Saha İş Akışı
                    </h2>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-500"><BarChart3 size={20} /></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-500"><Settings size={20} /></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                 {dispatches.filter(d => d.siteId === activeSiteId).map((job) => (
                   <div 
                    key={job.id} 
                    onClick={() => handleTaskClick(job)}
                    className={`w-full group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 text-left transition-all flex flex-col gap-4 cursor-pointer ${
                      selectedTask?.id === job.id 
                        ? 'border-indigo-600 shadow-xl' 
                        : 'border-slate-50 dark:border-slate-800 hover:border-indigo-100'
                    }`}
                   >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors ${
                             job.status === 'TAMAMLANDI' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600'
                           }`}>
                              {job.status === 'TAMAMLANDI' ? <CheckCircle2 size={24} /> : <Truck size={24} />}
                           </div>
                           <div>
                              <p className="font-black text-sm dark:text-white uppercase tracking-tight mb-0.5">{job.task}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tight bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{job.team}</span>
                                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getPriorityColor(job.priority)}`}>{job.priority}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(job.status)}`}>
                               {job.status}
                           </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                            <span>Görev İlerlemesi</span>
                            <span className="font-bold text-indigo-600">%{job.progress}</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <div 
                              style={{ width: `${job.progress}%` }} 
                              className={`h-full transition-all duration-700 rounded-full ${
                                job.status === 'TAMAMLANDI' ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                              }`} 
                            />
                         </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
                         <div className="flex items-center gap-3 text-slate-400">
                            <Clock size={12} />
                            <span className="text-[9px] font-bold uppercase">{job.deadline}</span>
                         </div>
                         <div className="flex items-center gap-1 text-indigo-600 text-[10px] font-black uppercase">
                            Detayları Gör <ChevronRight size={14} />
                         </div>
                      </div>
                   </div>
                 ))}
                 {dispatches.filter(d => d.siteId === activeSiteId).length === 0 && (
                   <div className="py-20 text-center opacity-40">
                      <Construction size={64} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-xs font-black uppercase tracking-widest">Bu sahada aktif görev yok</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sağ Panel: Telsiz */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-h-0 overflow-hidden">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                 <h2 className="text-sm font-black dark:text-white flex items-center gap-3 uppercase tracking-tight">
                   <RadioIcon size={20} className="text-indigo-500" /> Saha Telsizi
                 </h2>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canlı Yayın</span>
                 </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                 {siteMessages.map((m) => (
                   <div key={m.id} className={`flex flex-col ${m.user === currentUser.name ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black dark:text-white uppercase">{m.user}</span>
                         <span className="text-[9px] text-slate-400 font-bold">{m.time}</span>
                      </div>
                      <div className={`max-w-[90%] p-4 rounded-3xl text-xs font-bold leading-relaxed shadow-sm transition-all ${
                        m.user === currentUser.name 
                         ? 'bg-indigo-600 text-white rounded-tr-none' 
                         : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <div className="relative flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-3xl p-2 border-2 border-transparent focus-within:border-indigo-500 transition-all">
                    <button className="p-2 text-slate-400 hover:text-indigo-500"><ImageIcon size={20} /></button>
                    <input 
                       type="text" 
                       value={chatMessage}
                       onChange={(e) => setChatMessage(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                       placeholder="Sahaya anons geç..."
                       className="flex-1 bg-transparent border-none outline-none text-xs font-bold dark:text-white px-2"
                    />
                    <button 
                       onClick={() => handleSendMessage()}
                       className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                    >
                       <Send size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Görev Detay Modalı */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl">
                       <Construction size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{selectedTask.task}</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GÖREV ID: {selectedTask.id} • {selectedTask.siteId}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDetailModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><Users size={12} /> Operasyonel Ekip</p>
                       <p className="text-sm font-black dark:text-white uppercase">{selectedTask.team}</p>
                    </div>
                    <div className={`p-6 rounded-[2rem] border ${getStatusColor(selectedTask.status)}`}>
                       <p className="text-[10px] font-black uppercase mb-3 flex items-center gap-2 opacity-60"><Activity size={12} /> Mevcut Durum</p>
                       <p className="text-sm font-black uppercase">{selectedTask.status}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><Timer size={12} /> Termin Tarihi</p>
                       <p className="text-sm font-black dark:text-white uppercase">{selectedTask.deadline}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                          <span>Operasyonel İlerleme</span>
                          <span className="text-indigo-600 font-bold">%{selectedTask.progress}</span>
                       </div>
                       <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                          <div 
                            style={{ width: `${selectedTask.progress}%` }} 
                            className="h-full bg-indigo-600 rounded-full shadow-lg transition-all duration-1000" 
                          />
                       </div>
                    </div>
                    
                    <div>
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14} /> Görev Açıklaması</h4>
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl italic">
                         {selectedTask.description || 'Bu görev için ek açıklama girilmemiştir.'}
                       </p>
                    </div>

                    {selectedTask.assignedEquipment && (
                      <div>
                         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HardHat size={14} /> Atanan Ekipmanlar</h4>
                         <div className="flex flex-wrap gap-2">
                            {selectedTask.assignedEquipment.map((eq, i) => (
                              <span key={i} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-xl border border-indigo-100 dark:border-indigo-800">
                                {eq}
                              </span>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex flex-wrap gap-4">
                 <div className="w-full mb-2 flex gap-2">
                    {['BEKLEMEDE', 'YOLDA', 'SAHADA', 'TAMAMLANDI'].map((st: any) => (
                      <button 
                        key={st}
                        onClick={() => updateTaskStatus(selectedTask.id, st)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                          selectedTask.status === st 
                            ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                 </div>
                 <button 
                  onClick={() => {
                    handleSendMessage(`📢 ACİL UYARI: ${selectedTask.team} ekibi, ${selectedTask.task} görevi için ivedilikle aksiyon almalıdır!`);
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1 py-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                    <BellRing size={18} /> Ekibi Telsizden Uyar
                 </button>
                 <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                 >
                   Dosyayı Kapat
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Yeni Sevkıyat Modalı */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Yeni Sevkıyat / Görev</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operasyonel birim ataması yapılıyor</p>
                 </div>
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Görev Tanımı</label>
                    <input 
                      type="text" 
                      value={newTask.task}
                      onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                      placeholder="Örn: C Blok Kolon Beton Dökümü"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sorumlu Ekip</label>
                      <input 
                        type="text" 
                        value={newTask.team}
                        onChange={(e) => setNewTask({...newTask, team: e.target.value})}
                        placeholder="Örn: Beton Ekibi 1"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Öncelik</label>
                      <select 
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="DÜŞÜK">Düşük</option>
                         <option value="ORTA">Orta</option>
                         <option value="YÜKSEK">Yüksek</option>
                         <option value="KRİTİK">Kritik</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
                 >
                   İptal
                 </button>
                 <button 
                  onClick={handleCreateDispatch}
                  className="flex-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                   <CheckCircle2 size={18} /> Atamayı Onayla
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FieldOpsBoard;
