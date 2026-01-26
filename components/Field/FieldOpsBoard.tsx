
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { 
  Truck, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  MoreVertical,
  Plus
} from 'lucide-react';

const FieldOpsBoard: React.FC = () => {
  const context = useContext(AppContext);
  const [activeSite, setActiveSite] = useState('SITE-A');
  const [dispatches, setDispatches] = useState([
    { task: 'Excavation Phase 2', team: 'Blue Crew', priority: 'HIGH', deadline: 'Today 17:00' },
    { task: 'Electrical Wiring Install', team: 'Voltaic Team', priority: 'MEDIUM', deadline: 'Tomorrow 10:00' },
    { task: 'Material Supply Delivery', team: 'Logistics A', priority: 'CRITICAL', deadline: 'In 2 Hours' },
    { task: 'Quality Audit Site North', team: 'Quality Board', priority: 'LOW', deadline: 'Next Week' },
  ]);

  if (!context) return null;
  const { t } = context;

  const sites = [
    { id: 'SITE-A', name: 'Istanbul North', progress: 68, workers: 12 },
    { id: 'SITE-B', name: 'Ankara West Hub', progress: 42, workers: 8 },
    { id: 'SITE-C', name: 'Izmir Logistics', progress: 95, workers: 15 },
  ];

  const handleAssignDispatch = () => {
    const taskName = prompt("Görev Adı:");
    if (!taskName) return;
    const newJob = {
      task: taskName,
      team: 'Unassigned Team',
      priority: 'MEDIUM',
      deadline: 'Pending'
    };
    setDispatches([newJob, ...dispatches]);
  };

  const handleResolveAlert = (index: number) => {
    alert("Olay çözüldü olarak işaretlendi ve raporlandı.");
  };

  return (
    <div className="p-10 space-y-10 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white flex items-center gap-3 text-indigo-600">
            <Truck size={32} /> {t('fieldOps')}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time Field Activity Tracking</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleAssignDispatch}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
           >
             <Plus size={16} /> Assign Dispatch
           </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
        {sites.map(site => (
          <button 
            key={site.id}
            onClick={() => setActiveSite(site.id)}
            className={`px-8 py-5 rounded-3xl border-2 transition-all shrink-0 text-left min-w-[240px] ${
              activeSite === site.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
               <MapPin size={24} className={activeSite === site.id ? 'text-white' : 'text-slate-400'} />
               <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${activeSite === site.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                 {site.id}
               </span>
            </div>
            <h3 className="font-black text-lg mb-1">{site.name}</h3>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-80">
               <span>{site.workers} Personnel</span>
               <span>{site.progress}% Complete</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                <Activity className="text-indigo-500" /> Active Dispatch Queue ({activeSite})
              </h2>
              <div className="flex gap-2">
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase">On Schedule</span>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {dispatches.map((job, i) => (
                <div key={i} className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                         <Truck size={24} />
                      </div>
                      <div>
                         <p className="font-black text-sm dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{job.task}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Dispatch to: <span className="text-indigo-500">{job.team}</span></p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <div className="flex items-center gap-1.5 justify-end text-slate-400 mb-1">
                            <Clock size={12} />
                            <span className="text-[10px] font-black uppercase">{job.deadline}</span>
                         </div>
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                           job.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 
                           job.priority === 'HIGH' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                         }`}>
                           {job.priority}
                         </span>
                      </div>
                      <MoreVertical size={20} className="text-slate-300" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/20 p-8 shadow-sm">
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tighter mb-6 flex items-center gap-2">
                 <CheckCircle2 size={20} /> Verified Check-ins
              </h3>
              <div className="space-y-4">
                 {[
                   { name: 'Barış Engineer', time: '08:15', loc: 'Entry A' },
                   { name: 'Caner Supervisor', time: '08:42', loc: 'Entry B' },
                   { name: 'Mert Worker', time: '09:05', loc: 'Entry A' },
                 ].map((c, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-default">
                      <img src={`https://i.pravatar.cc/100?u=${c.name}`} className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform" alt="avatar" />
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold dark:text-white truncate uppercase">{c.name}</p>
                         <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">Clocked in at {c.time} • {c.loc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                 <AlertTriangle className="text-amber-500" /> Field Alerts
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase leading-relaxed">
                      Material shortage reported for concrete mix at Zone 4.
                    </p>
                    <button 
                      onClick={() => handleResolveAlert(0)}
                      className="mt-3 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase hover:underline active:opacity-60"
                    >
                      Resolve Incident
                    </button>
                 </div>
                 <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase leading-relaxed">
                      Heavy rain forecast starting 14:00. Safety warning issued.
                    </p>
                    <button 
                      onClick={() => alert("Uyarı tüm personele iletildi.")}
                      className="mt-3 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase hover:underline"
                    >
                      Acknowledge
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FieldOpsBoard;
