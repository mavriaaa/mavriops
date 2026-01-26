
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { MOCK_USERS } from '../../constants';
import { WorkItemStatus, Priority, WorkItem } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

const WorkItemCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  useEffect(() => {
    ApiService.fetchWorkItems().then(setItems);
  }, []);

  if (!context) return null;
  const { t } = context;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority ? item.priority === filterPriority : true;
      return matchesSearch && matchesPriority;
    });
  }, [items, searchTerm, filterPriority]);

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      case Priority.HIGH: return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case Priority.MEDIUM: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (s: WorkItemStatus) => {
    switch(s) {
      case WorkItemStatus.DONE: return <CheckCircle2 size={14} className="text-green-500" />;
      case WorkItemStatus.IN_REVIEW: return <Clock size={14} className="text-amber-500" />;
      case WorkItemStatus.BLOCKED: return <AlertCircle size={14} className="text-rose-500" />;
      default: return <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />;
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white">{t('workItems')}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Unified Operational Queue</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search')} 
              className="pl-12 pr-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 outline-none text-sm w-80 font-medium transition-all"
            />
          </div>
          <button 
            onClick={() => setFilterPriority(filterPriority ? null : Priority.CRITICAL)}
            className={`p-3 border rounded-2xl shadow-sm transition-all flex items-center gap-2 text-sm font-bold ${
              filterPriority === Priority.CRITICAL 
                ? 'bg-rose-500 border-rose-500 text-white' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Filter size={20} />
            {filterPriority === Priority.CRITICAL && "Critical Only"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">ID & Title</th>
                <th className="px-8 py-5">{t('type')}</th>
                <th className="px-8 py-5">{t('priority')}</th>
                <th className="px-8 py-5">{t('status')}</th>
                <th className="px-8 py-5">Assignee</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length > 0 ? filteredItems.map(item => {
                const assignee = MOCK_USERS.find(u => u.id === item.assigneeId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">#{item.id}</span>
                        <span className="text-sm font-black dark:text-white group-hover:text-indigo-600 transition-colors">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                         <FileText size={14} className="text-slate-400" /> {item.type}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="text-xs font-bold dark:text-white">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <img src={assignee.avatar} className="w-6 h-6 rounded-lg object-cover" alt="avatar" />
                          <span className="text-xs font-bold dark:text-white">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold dark:text-white">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <ChevronRight size={18} />
                       </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    No matching work items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkItemCenter;
