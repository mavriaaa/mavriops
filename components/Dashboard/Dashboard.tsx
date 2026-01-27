
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { 
  Zap, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Activity, 
  ArrowUpRight, BarChart3, TrendingUp, Users, MapPin, Target, ChevronRight,
  Search, Plus, ListChecks, History, DollarSign, PieChart
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Priority } from '../../types';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [items, setItems] = useState<WorkItem[]>([]);
  
  useEffect(() => {
    ApiService.fetchWorkItems().then(setItems);
  }, []);

  if (!context) return null;
  const { t } = context;

  const stats = {
    pendingApprovals: items.filter(i => i.status === WorkItemStatus.IN_REVIEW || i.status === WorkItemStatus.SUBMITTED).length,
    activeTasks: items.filter(i => i.status === WorkItemStatus.IN_PROGRESS || i.status === WorkItemStatus.TODO).length,
    critical: items.filter(i => i.priority === Priority.CRITICAL).length,
    completionRate: 92
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-white">Operasyonel Genel Bakış</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem durumu nominal, aktif eskalasyon bulunmuyor.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">124 Personel Aktif</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Onay Bekleyen" value={stats.pendingApprovals} icon={Clock} color="amber" onClick={() => navigate('/approvals')} />
        <SummaryCard title="Aktif Görevler" value={stats.activeTasks} icon={Zap} color="indigo" onClick={() => navigate('/work-items')} />
        <SummaryCard title="Kritik Risk" value={stats.critical} icon={AlertTriangle} color="rose" onClick={() => navigate('/field')} />
        <SummaryCard title="Başarı Oranı" value={`%${stats.completionRate}`} icon={CheckCircle2} color="emerald" onClick={() => navigate('/reports')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity Log */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
             <h2 className="text-sm font-semibold dark:text-white flex items-center gap-2">
                <History size={16} className="text-indigo-500" /> Son Aktiviteler
             </h2>
             <button className="text-[11px] font-bold text-indigo-500 hover:underline">Tümünü Gör</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {items.slice(0, 6).map((item) => (
               <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${item.priority === Priority.CRITICAL ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <ListChecks size={16} />
                     </div>
                     <div>
                        <p className="text-[13px] font-semibold dark:text-slate-200 uppercase">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.id} • {item.siteId} • {new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                     </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.status === WorkItemStatus.APPROVED ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                  }`}>{item.status}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
              <PieChart size={100} className="absolute -bottom-6 -right-6 opacity-10" />
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Mali Özet</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <span className="text-[11px] opacity-80 uppercase">Onaylı Gider</span>
                    <span className="text-lg font-bold">₺1.2M</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <span className="text-[11px] opacity-80 uppercase">Bekleyen</span>
                    <span className="text-lg font-bold">₺420K</span>
                 </div>
              </div>
              <button onClick={() => navigate('/accounting')} className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all">Detaylı Analiz</button>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-xs font-bold dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                 <Target size={14} className="text-rose-500" /> Kritik Bölgeler
              </h3>
              <div className="space-y-4">
                 {['İstanbul Kuzey', 'Ankara Batı'].map(site => (
                   <div key={site} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                         <span className="text-[12px] font-medium dark:text-slate-300">{site}</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-500 uppercase px-2 py-0.5 bg-rose-500/10 rounded">3 Risk</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color, onClick }: any) => {
  const colors: any = {
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  };

  return (
    <button onClick={onClick} className="text-left bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${colors[color]}`}>
         <Icon size={20} />
      </div>
      <h3 className="text-2xl font-bold dark:text-white tracking-tight">{value}</h3>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{title}</p>
    </button>
  );
};

export default Dashboard;
