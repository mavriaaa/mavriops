
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Inbox, ClipboardList, 
  BarChart3, ShieldCheck, ChevronRight, 
  Users, Map, GitBranch, Database, Settings,
  Receipt, Bot
} from 'lucide-react';
import { AppContext } from '../../App';
import { Role, WorkItemStatus } from '../../types';
import { ApiService } from '../../services/api';
import { getTranslation } from '../../i18n';
import UserAvatar from '../Common/UserAvatar';

const Sidebar: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [inboxCount, setInboxCount] = useState(0);

  const activeProjectId = context?.activeProjectId;

  useEffect(() => {
    const checkInbox = async () => {
      const items = await ApiService.fetchWorkItems();
      const pending = items.filter(i => 
        (activeProjectId ? i.projectId === activeProjectId : true) &&
        (i.status === WorkItemStatus.SUBMITTED || i.status === WorkItemStatus.NEED_INFO)
      ).length;
      setInboxCount(pending);
    };
    checkInbox();
    const interval = setInterval(checkInbox, 10000);
    return () => clearInterval(interval);
  }, [activeProjectId]);

  if (!context) return null;
  const { currentUser, setProfileOpen, t } = context;

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.OWNER;
  const isAccountant = currentUser.role === Role.ACCOUNTANT || isAdmin;

  const NavItem: React.FC<{ label: string; icon: React.ElementType; path: string; badge?: number; special?: boolean }> = ({ label, icon: Icon, path, badge, special }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <button
        onClick={() => navigate(path + (activeProjectId ? `?projectId=${activeProjectId}` : ''))}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all group relative ${
          active 
            ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        } ${special ? 'border border-indigo-500/20 bg-indigo-50/5 dark:bg-indigo-900/5' : ''}`}
      >
        {active && <div className="absolute left-0 w-1.5 h-5 bg-indigo-600 rounded-r-full" />}
        <Icon size={18} className={active ? 'text-indigo-600' : (special ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')} />
        <span className={`flex-1 text-left truncate tracking-tight ${special ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black min-w-[18px] text-center">{badge}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800/60 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase">MavriOps</h1>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Phase-1 Core</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar pt-2">
        <NavItem label={t('dashboard')} icon={LayoutGrid} path="/dashboard" />
        <NavItem label="Ops Asistan" icon={Bot} path="/assistant" special />
        <NavItem label={t('requests')} icon={ClipboardList} path="/requests" />
        <NavItem label={t('inbox')} icon={Inbox} path="/inbox" badge={inboxCount} />
        {isAccountant && <NavItem label={t('accounting')} icon={Receipt} path="/accounting" />}
        <NavItem label={t('reports')} icon={BarChart3} path="/reports" />

        {isAdmin && (
          <div className="pt-8 pb-2">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 mb-2 flex items-center gap-2">
              <Settings size={12} /> {t('admin')}
            </p>
            <div className="space-y-1">
              <NavItem label={t('projects')} icon={Map} path="/admin/projects" />
              <NavItem label={t('users')} icon={Users} path="/admin/users" />
              <NavItem label={t('workflows')} icon={GitBranch} path="/admin/workflows" />
              <NavItem label={t('masterdata')} icon={Database} path="/admin/masterdata" />
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all text-left group shadow-sm"
        >
          <UserAvatar name={currentUser.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate text-slate-900 dark:text-white uppercase tracking-tight">{currentUser.name}</p>
            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest leading-none">
              {t(currentUser.role)}
            </p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-transform" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
