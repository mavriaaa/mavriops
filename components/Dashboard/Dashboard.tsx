
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { 
  Zap, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Activity, 
  ArrowUpRight, BarChart3, TrendingUp, Users, MapPin, Target, ChevronRight,
  Search, Plus, ListChecks, History, DollarSign, PieChart, ShieldAlert
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Priority, AuditEvent, Site } from '../../types';
import EmptyState from '../Common/EmptyState';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([]);
  const [riskySites, setRiskySites] = useState<Site[]>([]);

  useEffect(() => {
    if (context?.activeProjectId) {
      ApiService.getAuditLogs().then(logs => setRecentAudits(logs.slice(0, 8)));
      ApiService.fetchSites(context.activeProjectId).then(sts => {
        setRiskySites(sts.filter(s => s.riskLevel === 'HIGH'));
      });
    }
  }, [context?.activeProjectId]);

  if (!context || !context.metrics) return (
      <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
  );

  const { t, metrics, activeProjectId, projects, formatMoney } = context;
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Activity size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
                {activeProject?.name || 'Komuta Merkezi'}
              </h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Proje Durumu: {t(activeProject?.status || '')} (Kod: {activeProject?.projectCode})
              </p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase">Proje İş Gücü</p>
              <p className="text-lg font-black dark:text-white leading-none">{metrics.activeWorkforce} / {metrics.totalWorkforce}</p>
           </div>
           <Users size={24} className="text-indigo-500" />
        </div>
      </div>

      {/* Project Specific KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SummaryCard title="Açık Onaylar" value={metrics.pendingApprovals} icon={Clock} color="amber" onClick={() => navigate('/inbox')} unit="İşlem" />
        <SummaryCard title="Saha Görevleri" value={metrics.activeTasks} icon={Zap} color="indigo" onClick={() => navigate('/requests')} unit="Aktif" />
        <SummaryCard title="Kritik Riskler" value={metrics.criticalIssues} icon={AlertTriangle} color="rose" onClick={() => navigate('/requests')} unit="Eskalasyon" />
        <SummaryCard title="Bütçe Kullanımı" value={`%${Math.round((metrics.financials.approvedExpenses / (activeProject?.totalBudget || 1)) * 100)}`} icon={CheckCircle2} color="emerald" onClick={() => navigate('/reports')} unit="Finansal" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/10">
                 <h2 className="text-xl font-black dark:text-white flex items-center gap-3 uppercase">
                    <History size={20} className="text-indigo-500" /> Proje Aktivite İzleme
                 </h2>
                 <button onClick={() => navigate('/requests')} className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">Audit Günlüğü</button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
                 {recentAudits.length > 0 ? (
                   <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {recentAudits.map((audit) => (
                        <div key={audit.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-all">
                                 <Activity size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold dark:text-slate-200 leading-tight">{audit.summary}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {audit.actorName} • {new Date(audit.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • <span className="text-indigo-500">{audit.entityId}</span>
                                 </p>
                              </div>
                           </div>
                           <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                        </div>
                      ))}
                   </div>
                 ) : (
                    <div className="p-20"><EmptyState title="Aktivite Yok" description="Sistem üzerinde henüz bir işlem kaydı oluşturulmadı." /></div>
                 )}
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
              <PieChart size={240} className="absolute -bottom-20 -right-20 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                 <DollarSign className="text-white/40" /> Finansal Durum
              </h3>
              <div className="space-y-8 relative z-10">
                 <div>
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] block mb-2">Harcama / Toplam Bütçe</span>
                    <p className="text-3xl font-black tracking-tighter leading-tight">
                        {formatMoney(metrics.financials.approvedExpenses)} / {formatMoney(activeProject?.totalBudget || 0)}
                    </p>
                 </div>
                 <div className="h-px bg-white/10 w-full" />
                 <div className="flex justify-between items-end">
                    <div>
                       <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] block mb-1">Kalan Bakiye</span>
                       <p className="text-xl font-black">{formatMoney(((activeProject?.totalBudget || 0) - metrics.financials.approvedExpenses))}</p>
                    </div>
                    <button onClick={() => navigate('/reports')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><ArrowUpRight size={20} /></button>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
              <h3 className="text-xs font-black dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <ShieldAlert size={16} className="text-rose-500" /> Kritik Proje Sahaları
              </h3>
              <div className="space-y-6">
                 {riskySites.length > 0 ? riskySites.map(site => (
                     <div key={site.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                           <MapPin size={16} className="text-rose-500" />
                           <span className="text-xs font-black dark:text-slate-300 uppercase">{site.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full uppercase">Kritik</span>
                     </div>
                 )) : <p className="text-[10px] text-slate-400 italic">Şu an riskli saha bulunmuyor.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color, onClick, unit }: any) => {
  const colors: any = {
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50',
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
  };

  return (
    <button onClick={onClick} className="text-left bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-6 border-2 transition-transform group-hover:scale-110 ${colors[color]}`}>
         <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
         <h3 className="text-4xl font-black dark:text-white tracking-tighter">{value}</h3>
         <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </button>
  );
};

export default Dashboard;
