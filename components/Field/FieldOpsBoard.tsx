
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
  Construction,
  Navigation,
  // Added missing Filter icon import
  Filter
} from 'lucide-react';

interface DispatchTask {
  id: string;
  task: string;
  team: string;
  priority: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  status: 'BEKLEMEDE' | 'YOLDA' | 'SAHADA' | 'TAMAMLANDI';
  deadline: string;
  siteId: string;
  progress: number;
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
    { id: 'DP-001', task: 'Faz 2 Kazı İşlemleri', team: 'Mavi Ekip', priority: 'YÜKSEK', status: 'SAHADA', deadline: 'Bugün 17:00', siteId: 'SAHA-A', progress: 65, description: 'Temel kazısı için ekskavatör yönlendirmesi yapıldı. Zemin etüdü raporu bekleniyor.', assignedEquipment: ['Ekskavatör-01', 'Damperli Kamyon-04'] },
    { id: 'DP-002', task: 'Elektrik Tesisat Kurulumu', team: 'Voltaj Takımı', priority: 'ORTA', status: 'YOLDA', deadline: 'Yarın 10:00', siteId: 'SAHA-A', progress: 10, description: 'C blok iç tesisat kablolama çalışması. Kablolar merkez depodan yüklendi.' },
    { id: 'DP-003', task: 'Malzeme Tedarik Teslimatı', team: 'Lojistik A', priority: 'KRİTİK', status: 'BEKLEMEDE', deadline: '2 Saat İçinde', siteId: 'SAHA-A', progress: 0, description: 'Acil çimento sevkiyatı bekleniyor. Tedarikçi yolda olduğunu belirtti.' },
    { id: 'DP-004', task: 'Kule Vinç Bakımı', team: 'Teknik Ekip', priority: 'YÜKSEK', status: 'TAMAMLANDI', deadline: 'Tamamlandı', siteId: 'SAHA-B', progress: 100, description: 'Rutin aylık periyodik bakım tamamlandı. Yağ değişimi ve halat kontrolü yapıldı.' },
  ]);

  const [newTask, setNewTask] = useState<Partial<DispatchTask>>({
    task: '',
    team: '',
    priority: 'ORTA',
    status: 'BEKLEMEDE',
    progress: 0
  });

  const [sites] = useState([
    { id: 'SAHA-A', name: 'İstanbul Kuzey', progress: 68, workers: 42, status: 'Aktif' },
    { id: 'SAHA-B', name: 'Ankara Batı Hub', progress: 42, workers: 28, status: 'Yavaş' },
    { id: 'SAHA-C', name: 'İzmir Lojistik', progress: 95, workers: 15, status: 'Tamamlanmak Üzere' },
  ]);

  if (!context) return null;
  const { currentUser, addToast } = context;

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

  const updateTaskStatus = (taskId: string, newStatus: DispatchTask['status']) => {
    const updated = dispatches.map(d => {
      if (d.id === taskId) {
        let prog = d.progress;
        if (newStatus === 'TAMAMLANDI') prog = 100;
        if (newStatus === 'BEKLEMEDE' && prog === 100) prog = 0;
        return { ...d, status: newStatus, progress: prog };
      }
      return d;
    });
    setDispatches(updated);
    
    const targetTask = updated.find(t => t.id === taskId);
    if (targetTask) {
       setSelectedTask(targetTask);
       handleSendMessage(`🔄 DURUM GÜNCELLEME: ${targetTask.task} [${newStatus}] durumuna geçti.`);
       addToast('info', 'Durum Güncellendi', `${targetTask.id} nolu görev artık ${newStatus}.`);
    }
  };

  const handleTaskClick = (job: DispatchTask) => {
    setSelectedTask(job);
    setIsDetailModalOpen(true);
  };

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock };
      case 'YOLDA': return { color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Navigation, animate: 'animate-pulse' };
      case 'SAHADA': return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: HardHat };
      case 'TAMAMLANDI': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
      default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Info };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'KRİTİK': return 'bg-rose-500 text-white shadow-rose-500/20';
      case 'YÜKSEK': return 'bg-orange-500 text-white shadow-orange-500/20';
      case 'ORTA': return 'bg-indigo-500 text-white shadow-indigo-500/20';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="p-8 space-y-8 h-full flex flex-col animate-in fade-in duration-700 overflow-hidden bg-slate-50 dark:bg-[#020617]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
            <RadioIcon size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-white uppercase leading-none">
              Saha Operasyonları
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Target size={12} className="text-indigo-500" /> Aktif Saha: {(sites.find(s => s.id === activeSiteId) || sites[0]).name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3 active:scale-95"
           >
             <Plus size={18} /> Yeni Görev Atama
           </button>
        </div>
      </div>

      {/* Site Selector Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        {sites.map(site => (
          <button 
            key={site.id}
            onClick={() => setActiveSiteId(site.id)}
            className={`relative min-w-[260px] p-5 rounded-2xl border-2 transition-all text-left group overflow-hidden ${
              activeSiteId === site.id 
                ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2.5 rounded-xl ${activeSiteId === site.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                  <MapPin size={18} />
               </div>
               <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${activeSiteId === site.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                 {site.id}
               </span>
            </div>
            <h3 className="font-bold text-base dark:text-white tracking-tight mb-1">{site.name}</h3>
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               <Users size={10} /> {site.workers} Personel <span className="text-slate-200">|</span> <Activity size={10} /> {site.status}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        
        {/* Task List Section */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-h-0 overflow-hidden">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden shadow-sm">
              <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                 <h2 className="text-sm font-bold dark:text-white flex items-center gap-2 uppercase tracking-tight">
                   <Zap size={18} className="text-indigo-500" /> Operasyonel Akış
                 </h2>
                 <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"><Filter size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"><Settings size={18} /></button>
                 </div>
              </header>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                 {dispatches.filter(d => d.siteId === activeSiteId).map((job) => {
                   const ui = getStatusUI(job.status);
                   return (
                     <div 
                      key={job.id} 
                      onClick={() => handleTaskClick(job)}
                      className={`w-full group p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 text-left transition-all flex flex-col gap-3 cursor-pointer relative overflow-hidden ${
                        selectedTask?.id === job.id 
                          ? 'border-indigo-600 shadow-xl scale-[1.01]' 
                          : 'border-slate-50 dark:border-slate-800 hover:border-indigo-100'
                      }`}
                     >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${ui.bg} ${ui.color} ${ui.animate}`}>
                                <ui.icon size={20} />
                             </div>
                             <div>
                                <p className="font-bold text-sm dark:text-white uppercase tracking-tight">{job.task}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tight bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{job.team}</span>
                                   <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded shadow-sm ${getPriorityBadge(job.priority)}`}>{job.priority}</span>
                                </div>
                             </div>
                          </div>
                          <div className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full border ${ui.bg} ${ui.color} ${ui.border}`}>
                             {job.status}
                          </div>
                        </div>

                        <div className="mt-2">
                           <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1.5">
                              <span>Tamamlanma</span>
                              <span className={`${ui.color}`}>%{job.progress}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                              <div 
                                style={{ width: `${job.progress}%` }} 
                                className={`h-full transition-all duration-700 rounded-full ${
                                  job.status === 'TAMAMLANDI' ? 'bg-emerald-500' : 
                                  job.status === 'BEKLEMEDE' ? 'bg-amber-400' : 'bg-indigo-500'
                                }`} 
                              />
                           </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
                           <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} />
                              <span className="text-[9px] font-bold uppercase">{job.deadline}</span>
                           </div>
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                        </div>
                     </div>
                   );
                 })}
                 {dispatches.filter(d => d.siteId === activeSiteId).length === 0 && (
                   <div className="py-20 text-center opacity-40">
                      <Construction size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-[11px] font-bold uppercase tracking-widest">Bu sahada bekleyen görev bulunmuyor</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Radio Channel Section */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-h-0 overflow-hidden">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden shadow-sm">
              <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                 <h2 className="text-sm font-bold dark:text-white flex items-center gap-2 uppercase tracking-tight">
                   <RadioIcon size={18} className="text-indigo-500" /> Saha Telsiz Kanalı
                 </h2>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Canlı Haberleşme</span>
                 </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                 {siteMessages.map((m) => (
                   <div key={m.id} className={`flex flex-col ${m.user === currentUser.name ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                         <span className="text-[9px] font-bold dark:text-white uppercase">{m.user}</span>
                         <span className="text-[8px] text-slate-400 font-medium">{m.time}</span>
                      </div>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                        m.user === currentUser.name 
                         ? 'bg-indigo-600 text-white rounded-tr-none' 
                         : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 border-2 border-transparent focus-within:border-indigo-500 transition-all shadow-inner">
                    <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><ImageIcon size={20} /></button>
                    <input 
                       type="text" 
                       value={chatMessage}
                       onChange={(e) => setChatMessage(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                       placeholder="Sahaya anons geç..."
                       className="flex-1 bg-transparent border-none outline-none text-xs font-semibold dark:text-white px-1"
                    />
                    <button 
                       onClick={() => handleSendMessage()}
                       className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                    >
                       <Send size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className={`p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center ${getStatusUI(selectedTask.status).bg}`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-white dark:bg-slate-900 ${getStatusUI(selectedTask.status).color}`}>
                       {React.createElement(getStatusUI(selectedTask.status).icon, { size: 28 })}
                    </div>
                    <div>
                       <h2 className="text-xl font-bold dark:text-white tracking-tight uppercase leading-none">{selectedTask.task}</h2>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{selectedTask.id} • {selectedTask.siteId}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDetailModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"><X size={20} /></button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Users size={12} /> Sorumlu Ekip</p>
                       <p className="text-xs font-bold dark:text-white uppercase tracking-tight">{selectedTask.team}</p>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Timer size={12} /> Hedef Zaman</p>
                       <p className="text-xs font-bold dark:text-white uppercase tracking-tight">{selectedTask.deadline}</p>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">
                       <span>İş İlerleme Durumu</span>
                       <span className={`font-black ${getStatusUI(selectedTask.status).color}`}>%{selectedTask.progress}</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200 dark:border-slate-800">
                       <div 
                         style={{ width: `${selectedTask.progress}%` }} 
                         className={`h-full rounded-full shadow-lg transition-all duration-1000 ${
                           selectedTask.status === 'TAMAMLANDI' ? 'bg-emerald-500' : 'bg-indigo-600'
                         }`} 
                       />
                    </div>
                    {/* Progress Slider (Interactive) */}
                    {selectedTask.status !== 'TAMAMLANDI' && (
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={selectedTask.progress}
                        onChange={(e) => setDispatches(prev => prev.map(t => t.id === selectedTask.id ? {...t, progress: parseInt(e.target.value)} : t))}
                        className="w-full mt-4 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    )}
                 </div>
                 
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Görev Talimatı</h4>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-indigo-500 italic">
                       <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                         "{selectedTask.description || 'Bu görev için henüz detaylı bir talimat girilmemiş.'}"
                       </p>
                    </div>
                 </div>

                 {selectedTask.assignedEquipment && (
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><HardHat size={14} /> Atanan Saha Ekipmanları</h4>
                      <div className="flex flex-wrap gap-2">
                         {selectedTask.assignedEquipment.map((eq, i) => (
                           <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-500 text-[10px] font-bold uppercase rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                             {eq}
                           </span>
                         ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Modal Footer (Actions) */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                 <div className="flex gap-2">
                    {['BEKLEMEDE', 'YOLDA', 'SAHADA', 'TAMAMLANDI'].map((st: any) => (
                      <button 
                        key={st}
                        onClick={() => updateTaskStatus(selectedTask.id, st)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                          selectedTask.status === st 
                            ? 'bg-indigo-600 text-white shadow-xl scale-105 z-10' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        handleSendMessage(`🚨 ACİL ANONS: ${selectedTask.team} ekibi, ${selectedTask.id} nolu görev için hızlı rapor bekliyoruz!`);
                        addToast('warning', 'Ekip Uyarıldı', 'Telsizden acil anons geçildi.');
                      }}
                      className="flex-1 py-4 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                       <BellRing size={16} /> Ekibi Telsizle Uyar
                    </button>
                    <button 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all"
                    >
                      Kapat
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* New Task Modal (Simplified for brevity) */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                 <h2 className="text-xl font-bold dark:text-white tracking-tight uppercase">Yeni Saha Sevkıyatı</h2>
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Görev Tanımı</label>
                    <input 
                      type="text" 
                      value={newTask.task}
                      onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                      placeholder="Örn: Kat 4 Kolon Donatı Kontrolü"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Ekip</label>
                      <input 
                        type="text" 
                        value={newTask.team}
                        onChange={(e) => setNewTask({...newTask, team: e.target.value})}
                        placeholder="Örn: Denetim Ekibi"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Öncelik</label>
                      <select 
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="DÜŞÜK">Düşük</option>
                         <option value="ORTA">Orta</option>
                         <option value="YÜKSEK">Yüksek</option>
                         <option value="KRİTİK">Kritik</option>
                      </select>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsNewTaskModalOpen(false)} className="flex-1 py-4 text-xs font-bold uppercase text-slate-500">İptal</button>
                 <button 
                  onClick={() => {
                    if(!newTask.task || !newTask.team) return;
                    const item: DispatchTask = {
                      id: `DP-${Math.floor(100 + Math.random() * 900)}`,
                      task: newTask.task,
                      team: newTask.team,
                      priority: newTask.priority || 'ORTA',
                      status: 'BEKLEMEDE',
                      deadline: 'Hemen',
                      siteId: activeSiteId,
                      progress: 0
                    };
                    setDispatches([item, ...dispatches]);
                    setIsNewTaskModalOpen(false);
                    setNewTask({ task: '', team: '', priority: 'ORTA' });
                    addToast('success', 'Sevkıyat Oluşturuldu', `${item.team} sahaya yönlendirildi.`);
                  }}
                  className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                 >
                   Atamayı Başlat
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FieldOpsBoard;
