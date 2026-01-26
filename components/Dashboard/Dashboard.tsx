
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  ArrowDownRight,
  Activity,
  Inbox
} from 'lucide-react';
import { MOCK_WORK_ITEMS } from '../../constants';
import { Priority, WorkItemStatus } from '../../types';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  const StatCard = ({ title, val, sub, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500 ${color}`} />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}-500 shadow-inner`}>
          <Icon size={28} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trend</span>
          <div className="flex items-center text-xs font-bold text-green-500">
            <ArrowUpRight size={14} /> 8%
          </div>
        </div>
      </div>
      <h3 className="text-3xl font-black dark:text-white tracking-tighter mb-1">{val}</h3>
      <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">{title}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-2 font-medium">{sub}</p>}
    </div>
  );

  const criticalItems = MOCK_WORK_ITEMS.filter(i => i.priority === Priority.CRITICAL);

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white flex items-center gap-3">
             <Zap className="text-indigo-500 fill-indigo-500" /> {t('dashboard')}
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Global Ops Visibility Control</p>
        </div>
        <div className="flex gap-3">
           <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-700">
             System SLA: <span className="text-green-500">99.8%</span>
           </div>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 active:translate-y-0">
             {t('newWorkItem')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title={t('pendingApprovals')} val="08" sub="Awaiting manager decision" icon={Clock} color="bg-amber-500" />
        <StatCard title={t('activeTasks')} val="24" sub="Across 3 global sites" icon={TrendingUp} color="bg-indigo-500" />
        <StatCard title={t('criticalIssues')} val={criticalItems.length.toString()} sub="Action required immediately" icon={ShieldAlert} color="bg-rose-500" />
        <StatCard title="Procurement" val="₺14.2M" sub="Total PO volume this month" icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black dark:text-white tracking-tight flex items-center gap-3">
                <Activity className="text-indigo-500" /> Performance Analytics
              </h2>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-lg">Weekly</button>
                 <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase rounded-lg">Monthly</button>
              </div>
            </div>
            <div className="h-72 flex items-end gap-6 px-4">
              {[60, 40, 85, 30, 95, 55, 75, 45, 90, 65].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-50 dark:bg-slate-800/50 rounded-2xl relative group">
                  <div style={{ height: `${h}%` }} className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 rounded-2xl transition-all group-hover:bg-indigo-600 shadow-lg" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 p-8">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20">
                   <AlertTriangle size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-rose-900 dark:text-rose-100 uppercase tracking-tight">Active Escalations</h3>
                   <p className="text-xs font-bold text-rose-400 uppercase">Response time exceeded for 3 critical items</p>
                </div>
             </div>
             <div className="space-y-3">
                {criticalItems.map(item => (
                   <div key={item.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-rose-100 dark:border-rose-900/20">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                         <span className="text-xs font-black dark:text-white">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-black text-rose-500 uppercase">{item.id}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-xl font-black dark:text-white mb-8 flex items-center gap-3">
             <Inbox className="text-indigo-500" /> {t('auditLog')}
          </h2>
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
            {[
              { time: "09:42", user: "Deniz M.", action: "Approved PR #1001", sub: "Budget verification passed" },
              { time: "10:15", user: "Canan P.", action: "Issued PO #982", sub: "Sent to Vendor A" },
              { time: "11:30", user: "Barış E.", action: "Field Report", sub: "North Bridge foundation ready" },
              { time: "13:20", user: "Serdar C.", action: "Delegated Authority", sub: "Assigned to Deniz M. for 3 days" },
            ].map((log, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 z-10">
                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400">{log.time}</span>
                    <span className="text-xs font-bold dark:text-white">{log.user}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.action}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{log.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
