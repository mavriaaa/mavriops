
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { Project, Site, ProjectStatus, SiteStatus, Role, User, WorkItemType } from '../../types';
import { 
  Map, 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Building, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  Target,
  MoreVertical,
  X,
  MapPin,
  Clock,
  HardHat,
  Construction,
  Info,
  DollarSign,
  Wallet,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import EmptyState from '../Common/EmptyState';

const ProjectSiteCenter: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'SITES'>('PROJECTS');
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);

  const [newProject, setNewProject] = useState({ 
    name: '', 
    clientName: '', 
    locationCity: '', 
    totalBudget: 0,
    primaryManagerId: '',
    startDate: '',
    plannedEndDate: '',
    currency: 'TRY',
    tags: [] as string[] 
  });
  
  const [newSite, setNewSite] = useState({ 
    name: '', 
    projectId: '', 
    type: 'INSAAT' as any, 
    budgetMonthlyLimit: 0, 
    leadUserId: '',
    riskLevel: 'LOW' as any
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prjs = await ApiService.fetchProjects();
    const sts = await ApiService.fetchSites();
    const usrList = ApiService.fetchUsers();
    setProjects(prjs);
    setSites(sts);
    setUsers(usrList);
  };

  if (!context) return null;
  const { t, currentUser, addToast, refreshMetrics } = context;

  // Added MANAGER and DIRECTOR to canCreate roles check
  const canCreate = currentUser.role === Role.OWNER || currentUser.role === Role.MANAGER || currentUser.role === Role.DIRECTOR;
  const canRequestSite = currentUser.role === Role.SUPERVISOR;

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.primaryManagerId || newProject.totalBudget <= 0) {
        addToast('warning', 'Eksik Parametre', 'Proje adı, müdür ve bütçe zorunludur.');
        return;
    }
    await ApiService.createProject(newProject as any, currentUser);
    addToast('success', 'Proje Portföye Eklendi', `${newProject.name} başarıyla tanımlandı.`);
    setIsNewProjectModalOpen(false);
    loadData();
    refreshMetrics();
  };

  const handleCreateSite = async () => {
    if (!newSite.name || !newSite.projectId || !newSite.leadUserId) {
        addToast('warning', 'Eksik Parametre', 'Lütfen tüm zorunlu saha bilgilerini doldurun.');
        return;
    }
    const result = await ApiService.createSite(newSite as any, currentUser);
    
    // Fixed unintentional string comparison by using the enum member
    if ('type' in result && result.type === WorkItemType.SITE_APPROVAL) {
        addToast('info', 'Onay Talebi Gönderildi', 'Şantiye açılış talebi üst yönetime iletildi.');
    } else {
        addToast('success', 'Saha Aktif Edildi', `${newSite.name} operasyonel duruma geçti.`);
    }
    
    setIsNewSiteModalOpen(false);
    loadData();
    refreshMetrics();
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSites = sites.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.siteCode.toLowerCase().includes(searchQuery.toLowerCase()));

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
      ACTIVE: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      DRAFT: 'bg-slate-100 text-slate-500 border-slate-200',
      COMPLETED: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      PLANNING: 'bg-amber-100 text-amber-600 border-amber-200',
      CLOSED: 'bg-rose-100 text-rose-600 border-rose-200',
      ON_HOLD: 'bg-amber-50 text-amber-500 border-amber-100'
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${colors[status] || 'bg-slate-50'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <Map size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('projectsSites')}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-indigo-500" /> Kurumsal Lokasyon ve PPM Portföy Yönetimi
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           {(canCreate || canRequestSite) && (
             <button 
              onClick={() => activeTab === 'PROJECTS' ? setIsNewProjectModalOpen(true) : setIsNewSiteModalOpen(true)}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
             >
               <Plus size={18} /> {activeTab === 'PROJECTS' ? t('newProject') : (canCreate ? t('newSite') : 'Şantiye Talep Et')}
             </button>
           )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
         <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit rounded-2xl shadow-sm">
            <button 
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PROJECTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t('projects')} ({projects.length})
            </button>
            <button 
              onClick={() => setActiveTab('SITES')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SITES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t('sites')} ({sites.length})
            </button>
         </div>
         <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-72">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="İsim veya kod ile sorgula..." 
                 className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {activeTab === 'PROJECTS' ? (
           filteredProjects.length > 0 ? (
             filteredProjects.map(prj => {
               const manager = users.find(u => u.id === prj.primaryManagerId);
               return (
                 <div key={prj.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Briefcase size={80} /></div>
                    <div className="flex justify-between items-start mb-6">
                       <StatusBadge status={prj.status} />
                       <span className="text-[10px] font-bold text-slate-400 tracking-widest">{prj.projectCode}</span>
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase leading-tight tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors">
                      {prj.name}
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                         <Users size={14} className="text-indigo-600" /> {prj.clientName || 'İsimsiz Müşteri'}
                      </div>
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <span>Proje Bütçesi</span>
                            <span className="text-indigo-600">{prj.currency || 'TRY'} {prj.totalBudget?.toLocaleString()}</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 w-1/3 rounded-full" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={manager?.avatar} className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/10" />
                           <div>
                              <p className="text-[10px] font-black dark:text-white leading-none uppercase">{manager?.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">PROJE MÜDÜRÜ</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-slate-400 uppercase">BAŞLANGIÇ</p>
                           <p className="text-[10px] font-bold dark:text-slate-300">{prj.startDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-rose-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{prj.locationCity}</span>
                       </div>
                       <button onClick={() => navigate(`/projects/${prj.id}`)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                          <ChevronRight size={18} />
                       </button>
                    </div>
                 </div>
               );
             })
           ) : (
             <div className="col-span-full"><EmptyState title="Proje Kaydı Yok" description="Aranan kriterlere uygun proje bulunamadı." /></div>
           )
        ) : (
           filteredSites.length > 0 ? (
             filteredSites.map(site => {
               const lead = users.find(u => u.id === site.leadUserId);
               return (
                 <div key={site.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Building size={80} /></div>
                    <div className="flex justify-between items-start mb-6">
                       <StatusBadge status={site.status} />
                       <span className="text-[10px] font-bold text-slate-400 tracking-widest">{site.siteCode}</span>
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase leading-tight tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors">
                      {site.name}
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase">
                         <Construction size={14} className="text-amber-500" /> {projects.find(p=>p.id===site.projectId)?.name || 'Bağımsız Saha'}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">AYLIK LİMİT</p>
                            <p className="text-xs font-black dark:text-white">₺{site.budgetMonthlyLimit?.toLocaleString()}</p>
                         </div>
                         <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">RİSK SEVİYESİ</p>
                            <p className={`text-xs font-black ${site.riskLevel === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'}`}>{site.riskLevel}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <img src={lead?.avatar} className="w-8 h-8 rounded-xl object-cover ring-2 ring-amber-500/10" />
                         <div>
                            <p className="text-[10px] font-black dark:text-white leading-none uppercase">{lead?.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">SAHA ŞEFİ</p>
                         </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase">
                          <Users size={14} /> {site.fieldTeam?.length || 0} Personel
                       </div>
                       <button onClick={() => navigate(`/sites/${site.id}`)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                          <ChevronRight size={18} />
                       </button>
                    </div>
                 </div>
               );
             })
           ) : (
             <div className="col-span-full"><EmptyState title="Şantiye Kaydı Yok" description="Henüz tanımlanmış bir operasyon sahası bulunmuyor." /></div>
           )
        )}
      </div>

      {/* New Project Modal - RICH VERSION */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{t('newProject')}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stratejik Portföy ve Bütçe Girişi</p>
                 </div>
                 <button onClick={() => setIsNewProjectModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-10 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Resmi Proje Adı</label>
                    <input 
                      type="text" 
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Örn: Kuzey Marmara Entegre Tesisi"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">İş Sahibi / Müşteri</label>
                    <div className="relative">
                       <Target size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         value={newProject.clientName}
                         onChange={(e) => setNewProject({...newProject, clientName: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none shadow-inner" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Proje Müdürü Ataması</label>
                    <div className="relative">
                       <UserCheck size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select 
                         value={newProject.primaryManagerId}
                         onChange={(e) => setNewProject({...newProject, primaryManagerId: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                       >
                          <option value="">Seçiniz...</option>
                          {users.filter(u => u.role === Role.MANAGER || u.role === Role.OWNER || u.role === Role.PROJECT_MANAGER).map(u => (
                             <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Toplam Yatırım Bütçesi</label>
                    <div className="relative">
                       <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="number" 
                         value={newProject.totalBudget}
                         onChange={(e) => setNewProject({...newProject, totalBudget: Number(e.target.value)})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none shadow-inner" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Para Birimi</label>
                    <select 
                      value={newProject.currency}
                      onChange={(e) => setNewProject({...newProject, currency: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                    >
                       <option value="TRY">₺ TRY</option>
                       <option value="USD">$ USD</option>
                       <option value="EUR">€ EUR</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Lokasyon (Şehir)</label>
                    <input 
                      type="text" 
                      value={newProject.locationCity}
                      onChange={(e) => setNewProject({...newProject, locationCity: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Başlangıç Tarihi</label>
                    <input 
                      type="date" 
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none" 
                    />
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsNewProjectModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">İptal</button>
                 <button onClick={handleCreateProject} className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">Proje Tanımla</button>
              </div>
           </div>
        </div>
      )}

      {/* New Site Modal - RICH VERSION */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{canCreate ? t('newSite') : 'Şantiye Talep Et'}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Saha Provizyon ve Yetki Ataması</p>
                 </div>
                 <button onClick={() => setIsNewSiteModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Bağlı Proje Şemsiyesi</label>
                       <select 
                         value={newSite.projectId}
                         onChange={(e) => setNewSite({...newSite, projectId: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                       >
                          <option value="">Seçiniz...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.projectCode})</option>)}
                       </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Şantiye/Saha Tanımı</label>
                       <input 
                         type="text" 
                         value={newSite.name}
                         onChange={(e) => setNewSite({...newSite, name: e.target.value})}
                         placeholder="Örn: Blok A Temel Sahası"
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Saha Şefi (Lead)</label>
                       <select 
                         value={newSite.leadUserId}
                         onChange={(e) => setNewSite({...newSite, leadUserId: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                       >
                          <option value="">Seçiniz...</option>
                          {users.filter(u => u.role === Role.SUPERVISOR || u.role === Role.EMPLOYEE || u.role === Role.SITE_CHIEF).map(u => (
                             <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Operasyon Tipi</label>
                       <select 
                         value={newSite.type}
                         onChange={(e) => setNewSite({...newSite, type: e.target.value as any})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                       >
                          <option value="INSAAT">İnşaat</option>
                          <option value="GES">Enerji / GES</option>
                          <option value="LOJISTIK">Lojistik</option>
                          <option value="OFIS">İdari Ofis</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Aylık Harcama Limiti</label>
                       <div className="relative">
                          <Wallet size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="number" 
                            value={newSite.budgetMonthlyLimit}
                            onChange={(e) => setNewSite({...newSite, budgetMonthlyLimit: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 pl-14 text-sm font-bold dark:text-white outline-none shadow-inner" 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Risk Profili</label>
                       <select 
                         value={newSite.riskLevel}
                         onChange={(e) => setNewSite({...newSite, riskLevel: e.target.value as any})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                       >
                          <option value="LOW">Düşük Risk</option>
                          <option value="MED">Orta Risk</option>
                          <option value="HIGH">Yüksek Risk</option>
                       </select>
                    </div>
                 </div>

                 {!canCreate && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3 text-amber-600">
                       <Info size={16} className="shrink-0 mt-0.5" />
                       <p className="text-[9px] font-bold uppercase leading-tight">Yetersiz yetki: Bu işlem yönetici onayına gönderilecek ve bir üst bütçe kaleminden tahsisat talep edilecektir.</p>
                    </div>
                 )}
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsNewSiteModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">Vazgeç</button>
                 <button onClick={handleCreateSite} className="flex-2 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {canCreate ? 'Şantiyeyi Aktif Et' : 'Talebi Onaya Gönder'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSiteCenter;
