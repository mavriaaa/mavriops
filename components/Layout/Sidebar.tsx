
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutGrid, 
  Inbox, 
  ClipboardList, 
  ShoppingCart, 
  Wallet, 
  Truck, 
  BarChart3, 
  Settings, 
  Moon, 
  Sun,
  Languages,
  Activity
} from 'lucide-react';
import { AppContext } from '../../App';
import { Role } from '../../types';

const Sidebar: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) return null;
  const { isDarkMode, setDarkMode, currentUser, language, setLanguage, t } = context;

  const NavItem: React.FC<{ 
    label: string; 
    icon: React.ElementType; 
    path: string;
    badge?: number;
    color?: string;
  }> = ({ label, icon: Icon, path, badge, color = "indigo" }) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
          active 
            ? `bg-${color}-600 text-white shadow-lg shadow-${color}-600/20` 
            : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <Icon size={20} className={active ? 'text-white' : `text-slate-400 group-hover:text-${color}-500 transition-colors`} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const isProcurement = currentUser.role === Role.PROCUREMENT || currentUser.role === Role.ADMIN || currentUser.role === Role.OWNER;
  const isFinance = currentUser.role === Role.ACCOUNTANT || currentUser.role === Role.ADMIN || currentUser.role === Role.OWNER;

  return (
    <aside className="w-68 flex flex-col h-full bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter dark:text-white leading-none">MAVRIOPS</h1>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise Pro</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavItem label={t('dashboard')} icon={LayoutGrid} path="/" />
        <NavItem label={t('workItems')} icon={Inbox} path="/work-items" badge={3} />
        
        <div className="pt-6 pb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</div>
        <NavItem label={t('requestCenter')} icon={ClipboardList} path="/requests" />
        <NavItem label={t('fieldOps')} icon={Truck} path="/field" />
        <NavItem label={t('reports')} icon={BarChart3} path="/reports" />

        {(isProcurement || isFinance) && (
          <>
            <div className="pt-6 pb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Back Office</div>
            {isProcurement && <NavItem label={t('procurement')} icon={ShoppingCart} path="/procurement" color="emerald" />}
            {isFinance && <NavItem label={t('accounting')} icon={Wallet} path="/accounting" color="rose" />}
          </>
        )}
      </div>

      <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button onClick={() => setDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:text-indigo-500 transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Languages size={14} /> {language.toUpperCase()}
            </button>
          </div>
          <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm">
             <Settings size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700">
          <div className="relative">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover" alt="user" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-indigo-50 dark:border-slate-800 flex items-center justify-center">
              <Activity size={8} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate dark:text-white uppercase tracking-tight">{currentUser.name}</p>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
