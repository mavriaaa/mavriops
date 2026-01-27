
import React, { useContext, useState } from 'react';
import { 
  X, 
  Camera, 
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
  // Added missing Settings icon
  Settings
} from 'lucide-react';
import { AppContext } from '../../App';

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
    avatar: currentUser.avatar,
    status: currentUser.status
  });

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'preferences'>('general');
  const [isSaving, setIsSaving] = useState(false);

  if (!isProfileOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    updateCurrentUser(formData);
    setIsSaving(false);
    setProfileOpen(false);
  };

  const TabButton: React.FC<{ id: typeof activeTab; label: string; icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px] animate-in zoom-in-95 duration-300">
        
        {/* Sol Sidebar (Tabs) */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col">
          <div className="mb-10 text-center">
            <div className="relative inline-block group">
              <img 
                src={formData.avatar} 
                className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl ring-4 ring-indigo-500/10 mb-4 transition-transform group-hover:scale-105" 
                alt="profile" 
              />
              <button className="absolute bottom-6 right-0 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">{currentUser.name}</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{currentUser.role}</p>
          </div>

          <nav className="flex-1 space-y-2">
            <TabButton id="general" label="Genel Bilgiler" icon={User} />
            <TabButton id="security" label="Güvenlik" icon={Shield} />
            <TabButton id="preferences" label="Tercihler" icon={Settings} />
          </nav>

          <button className="mt-auto flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
            <LogOut size={16} />
            Oturumu Kapat
          </button>
        </div>

        {/* Sağ İçerik */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">
                {activeTab === 'general' ? 'Profil Ayarları' : activeTab === 'security' ? 'Güvenlik ve Erişim' : 'Kullanıcı Tercihleri'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sistem kimliğinizi ve deneyiminizi yönetin</p>
            </div>
            <button 
              onClick={() => setProfileOpen(false)}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tam Ad Soyad</label>
                    <div className="relative">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 pl-14 text-sm font-bold dark:text-white outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Durum</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none appearance-none"
                    >
                      <option value="online">Müsait (Online)</option>
                      <option value="away">Meşgul (Away)</option>
                      <option value="offline">Görünmez (Offline)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-Posta Adresi</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      defaultValue="ceo@mavriops.com"
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl p-5 pl-14 text-sm font-bold text-slate-400 outline-none cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase ml-1 italic">* Kurumsal hesaplarda e-posta değişikliği için IT birimi ile görüşün.</p>
                </div>

                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Organizasyon Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Departman</p>
                      <p className="text-xs font-bold dark:text-white uppercase mt-1">Yönetim Kurulu</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Şirket</p>
                      <p className="text-xs font-bold dark:text-white uppercase mt-1">Mavri Global A.Ş.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black dark:text-white uppercase">Şifre Değiştir</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Son değişiklik: 2 ay önce</p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-all">Güncelle</button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-500">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black dark:text-white uppercase">İki Faktörlü Doğrulama (2FA)</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Hesabınızı ekstra korumaya alın</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={14} className="text-indigo-500" /> Aktif Oturumlar
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-slate-300" />
                      <div className="text-left">
                        <p className="text-[10px] font-black dark:text-white uppercase">Chrome / macOS (Bu Cihaz)</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase">Aktif Şimdi</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">İstanbul, TR</span>
                    </div>
                  </div>
                </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Görünüm Modu</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setDarkMode(false)}
                        className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${!isDarkMode ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-amber-500">
                          <Sun size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase dark:text-white">Aydınlık</span>
                      </button>
                      <button 
                        onClick={() => setDarkMode(true)}
                        className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 shadow-md flex items-center justify-center text-indigo-400">
                          <Moon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase dark:text-white">Karanlık</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sistem Dili</label>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setLanguage('tr')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'tr' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Languages size={18} className="text-slate-400" />
                          <span className="text-xs font-black dark:text-white uppercase tracking-tight">Türkçe</span>
                        </div>
                        {language === 'tr' && <Check size={18} className="text-indigo-600" />}
                      </button>
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Languages size={18} className="text-slate-400" />
                          <span className="text-xs font-black dark:text-white uppercase tracking-tight">English</span>
                        </div>
                        {language === 'en' && <Check size={18} className="text-indigo-600" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Bell size={14} className="text-indigo-500" /> Bildirim Tercihleri
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black dark:text-white uppercase">E-Posta Bildirimleri</p>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-black dark:text-white uppercase">Masaüstü Anlık Bildirimler</p>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alt Aksiyon Çubuğu */}
          <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4 shrink-0">
            <button 
              onClick={() => setProfileOpen(false)}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              Vazgeç
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Uygula'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
