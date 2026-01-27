
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Inbox, ClipboardList, ShoppingCart, 
  Wallet, Truck, BarChart3, Settings, Moon, Sun,
  Languages, Activity, MessageSquare, ShieldCheck,
  Briefcase, Maximize, Minimize, User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { AppContext } from '../../App';
import { Role } from '../../types';

const Sidebar: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!context) return null;
  const { isDarkMode, setDarkMode, currentUser, language, setLanguage, t, setProfileOpen } = context;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const NavItem: React.FC<{ label: string; icon: React.ElementType; path: string; badge?: number; color?: string }> = ({ label, icon: Icon, path, badge, color = "indigo" }) => {
    const active = location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');
    
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
          active 
            ? 'bg-indigo-600/10 text-indigo-500 dark:text-indigo-400' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
        }`}
      >
        {active && <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />}
        <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800/60 flex-shrink-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight dark:text-white leading-none">MavriOps</h1>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1 block">Enterprise v2.5</span>
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <NavItem label={t('dashboard')} icon={LayoutGrid} path="/" />
        <NavItem label={t('workItems')} icon={Inbox} path="/work-items" badge={3} />
        <NavItem label={t('pendingApprovals')} icon={ShieldCheck} path="/approvals" badge={2} />
        <NavItem label={t('chat')} icon={MessageSquare} path="/chat" />
        
        <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60">Operasyonel</div>
        <NavItem label={t('requestCenter')} icon={ClipboardList} path="/requests" />
        <NavItem label={t('fieldOps')} icon={Truck} path="/field" />
        <NavItem label={t('reports')} icon={BarChart3} path="/reports" />

        <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60">Yönetim</div>
        <NavItem label={t('hr')} icon={Briefcase} path="/hr" />
        <NavItem label={t('procurement')} icon={ShoppingCart} path="/procurement" />
        <NavItem label={t('accounting')} icon={Wallet} path="/accounting" />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={toggleFullScreen} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <Maximize size={16} />
          </button>
          <button onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')} className="ml-auto text-[11px] font-bold text-slate-500 hover:text-indigo-500 uppercase px-2 py-1">
            {language}
          </button>
        </div>
        
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
        >
          <img src={currentUser.avatar} className="w-9 h-9 rounded-lg object-cover" alt="user" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate dark:text-white">{currentUser.name}</p>
            <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-tight">{currentUser.role}</p>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
