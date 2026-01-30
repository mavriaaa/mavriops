
import React, { useContext, useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Check, 
  LogOut,
  Bell,
  Lock,
  Smartphone,
  Languages,
  Settings
} from 'lucide-react';
import { AppContext } from '../../App';
import UserAvatar from '../Common/UserAvatar';

const ProfileModal: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { 
    currentUser, 
    updateCurrentUser, 
    isProfileOpen, 
    setProfileOpen, 
    isDarkMode, 
    setDarkMode, 
    language, 
    setLanguage, 
    t 
  } = context;

  const [formData, setFormData] = useState({
    name: currentUser.name,
    status: currentUser.status
  });

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'preferences'>('general');
  const [isSaving, setIsSaving] = useState(false);

  if (!isProfileOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateCurrentUser(formData);
    setIsSaving(false);
    context.addToast('success', t('profileSettings'), t('allCaughtUp'));
    setProfileOpen(false);
  };

  const TabButton: React.FC<{ id: typeof activeTab; label: string; icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px] animate-in zoom-in-95 duration-300">
        
        {/* Sol Sidebar */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col shrink-0">
          <div className="mb-10 text-center">
            <div className="relative inline-block group mb-4">
              <UserAvatar name={formData.name} size="xl" />
            </div>
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight truncate">{currentUser.name}</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{currentUser.role}</p>
          </div>

          <nav className="flex-1 space-y-2">
            <TabButton id="general" label={t('generalInfo')} icon={User} />
            <TabButton id="security" label={t('securityAccess')} icon={Shield} />
            <TabButton id="preferences" label={t('userPrefs')} icon={Settings} />
          </nav>

          <button className="mt-auto flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95">
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>

        {/* Sağ İçerik */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">
                {activeTab === 'general' ? t('generalInfo') : activeTab === 'security' ? t('securityAccess') : t('userPrefs')}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t('filingProcurement')}</p>
            </div>
            <button onClick={() => setProfileOpen(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm active:scale-90">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('displayName')}</label>
                    <div className="relative">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 pl-14 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('currentStatus')}</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="online">{t('online')}</option>
                      <option value="away">{t('away')}</option>
                      <option value="offline">{t('offline')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('corporateEmail')}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      defaultValue="admin@mavriops.pro"
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl p-5 pl-14 text-sm font-bold text-slate-400 outline-none cursor-not-allowed italic" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('appearance')}</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setDarkMode(false)}
                        className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${!isDarkMode ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <Sun size={24} className={!isDarkMode ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-[10px] font-black uppercase dark:text-white">{t('lightMode')}</span>
                      </button>
                      <button 
                        onClick={() => setDarkMode(true)}
                        className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <Moon size={24} className={isDarkMode ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-[10px] font-black uppercase dark:text-white">{t('darkMode')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('systemLanguage')}</label>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setLanguage('tr')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'tr' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Languages size={18} className="text-slate-400" />
                          <span className="text-xs font-black dark:text-white uppercase">Türkçe</span>
                        </div>
                        {language === 'tr' && <Check size={18} className="text-indigo-600" />}
                      </button>
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Languages size={18} className="text-slate-400" />
                          <span className="text-xs font-black dark:text-white uppercase">English</span>
                        </div>
                        {language === 'en' && <Check size={18} className="text-indigo-600" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4 shrink-0">
            <button onClick={() => setProfileOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">{t('cancel')}</button>
            <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
              {isSaving ? 'Dispatching...' : t('saveChanges')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
