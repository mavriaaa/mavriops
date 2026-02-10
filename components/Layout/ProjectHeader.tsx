
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Briefcase, ChevronDown, Bell, Search, Settings } from 'lucide-react';

const ProjectHeader: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { projects, activeProjectId, setActiveProjectId, setProfileOpen, addToast, t, metrics, currentUser } = context;
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Sadece yetkili olduğu projeleri görebilir
  const allowedProjects = projects.filter(p => currentUser.allowedProjectIds.includes(p.id));

  const handleNotificationClick = () => {
    addToast('info', 'Sistem Senkronizasyonu', (activeProject?.name || 'Merkezi') + ' üzerinden güncel veriler alınıyor...');
  };

  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-10 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="relative group">
            <button className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all shadow-sm group">
              <Briefcase size={14} className="text-indigo-600" />
              <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{activeProject?.name || 'Proje Seçin'}</span>
              <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
              {allowedProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col ${activeProjectId === p.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-500' : ''}`}
                >
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{p.projectCode}</span>
                </button>
              ))}
              {allowedProjects.length === 0 && (
                <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Erişilebilir proje yok</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block group">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
           <input 
            type="text" 
            placeholder={t('search')} 
            className="pl-11 pr-6 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-800 w-64 transition-all shadow-inner"
           />
        </div>
        
        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
        
        <button 
          onClick={handleNotificationClick}
          className="relative p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all group active:scale-95"
        >
          <Bell size={20} />
          {metrics && metrics.criticalIssues > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm" />
          )}
        </button>

        <button 
          onClick={() => setProfileOpen(true)}
          className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all active:scale-95"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default ProjectHeader;
