
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../../App';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Download,
  Building,
  Activity,
  X,
  Plus,
  Trash2,
  DollarSign,
  MapPin
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Project, Site } from '../../types';

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Aktif' | 'İzinli' | 'Saha';
  performance: number;
  startDate: string;
  avatar: string;
  projectId: string;
  siteId: string;
}

const HRDashboard: React.FC = () => {
  const context = useContext(AppContext);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([
    { id: 'u1', name: 'Sinem CEO', role: 'CEO / Kurucu', department: 'Yönetim', status: 'Aktif', performance: 98, startDate: '2020-01-01', avatar: 'https://i.pravatar.cc/150?u=sinem', projectId: 'prj-1', siteId: 'GENEL' },
    { id: 'u2', name: 'Deniz Müdür', role: 'Operasyon Müdürü', department: 'Saha Yönetimi', status: 'Aktif', performance: 92, startDate: '2021-03-15', avatar: 'https://i.pravatar.cc/150?u=deniz', projectId: 'prj-1', siteId: 'GENEL' },
    { id: 'u4', name: 'Barış Mühendis', role: 'Saha Mühendisi', department: 'İnşaat', status: 'Saha', performance: 88, startDate: '2022-06-10', avatar: 'https://i.pravatar.cc/150?u=baris', projectId: 'prj-1', siteId: 'site-a' },
    { id: 'u5', name: 'Merve Uzman', role: 'İSG Uzmanı', department: 'Güvenlik', status: 'Saha', performance: 95, startDate: '2023-01-20', avatar: 'https://i.pravatar.cc/150?u=merve', projectId: 'prj-2', siteId: 'site-c' },
  ]);

  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    department: 'İnşaat',
    siteId: '',
    status: 'Aktif' as any
  });

  useEffect(() => {
    if (context?.activeProjectId) {
      ApiService.fetchSites(context.activeProjectId).then(setSites);
    }
  }, [context?.activeProjectId]);

  if (!context) return null;
  const { activeProjectId, t, addToast, projects } = context;

  const activeProject = projects.find(p => p.id === activeProjectId);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.projectId === activeProjectId && (
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [employees, searchQuery, activeProjectId]);

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.siteId) {
        addToast('warning', 'Eksik Veri', 'Lütfen personel adı ve görev sahası bilgilerini doldurun.');
        return;
    }
    const emp: EmployeeRecord = {
      id: `u${Date.now()}`,
      name: newEmployee.name,
      role: newEmployee.role,
      department: newEmployee.department,
      status: newEmployee.status,
      performance: 75,
      projectId: activeProjectId,
      siteId: newEmployee.siteId,
      startDate: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${newEmployee.name.split(' ')[0]}`
    };
    setEmployees([emp, ...employees]);
    setIsNewEmployeeModalOpen(false);
    addToast('success', 'İşe Alım Tamamlandı', `${emp.name}, ${activeProject?.projectCode} projesine dahil edildi.`);
    setNewEmployee({ name: '', role: '', department: 'İnşaat', status: 'Aktif', siteId: '' });
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
              {activeProject?.name} HR
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-violet-500" /> Bu projede toplam {filteredEmployees.length} aktif yetenek bulunmaktadır.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsNewEmployeeModalOpen(true)}
          className="px-8 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-600/30 hover:bg-violet-700 transition-all flex items-center gap-2 active:scale-95"
        >
          <UserPlus size={18} /> Projeye Personel Ata
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
             <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
                <Users className="text-violet-500" /> Proje Kadrosu
             </h2>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kadroda ara..." 
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-violet-500 w-64 shadow-sm" 
                />
             </div>
          </div>
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
                   <th className="px-8 py-5">Personel</th>
                   <th className="px-8 py-5">Görev Sahası</th>
                   <th className="px-8 py-5">Departman / Rol</th>
                   <th className="px-8 py-5 text-right">Detay</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                           <div>
                              <p className="text-sm font-black dark:text-white uppercase tracking-tight">{emp.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.status}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-lg">
                              <MapPin size={14} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black dark:text-white uppercase">{emp.siteId}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{activeProject?.projectCode}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-[10px] font-black dark:text-white uppercase">{emp.department}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.role}</p>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-600 inline-block transition-transform group-hover:translate-x-1" />
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center opacity-30">
               <Users size={48} className="mx-auto mb-4" />
               <p className="text-[11px] font-black uppercase tracking-widest">Bu projeye henüz personel atanmamıştır.</p>
            </div>
          )}
      </div>

      {isNewEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Personel Ataması</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeProject?.projectCode} Sahasına Giriş</p>
                 </div>
                 <X size={24} className="text-slate-400 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setIsNewEmployeeModalOpen(false)} />
              </div>
              
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Görev Sahası</label>
                    <select 
                      value={newEmployee.siteId}
                      onChange={(e) => setNewEmployee({...newEmployee, siteId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner"
                    >
                      <option value="">Seçiniz...</option>
                      <option value="GENEL">Merkezi Yönetim (Bu Proje)</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Personel Ad Soyad</label>
                    <input 
                      type="text" 
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pozisyon</label>
                      <input 
                        type="text" 
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                        placeholder="Örn: Tekniker"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Departman</label>
                      <select 
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner"
                      >
                         <option value="İnşaat">İnşaat</option>
                         <option value="Yönetim">Yönetim</option>
                         <option value="Güvenlik">Güvenlik</option>
                         <option value="Finans">Finans</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsNewEmployeeModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">İptal</button>
                 <button 
                  onClick={handleAddEmployee}
                  className="flex-2 px-10 py-5 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl shadow-violet-600/30 hover:bg-violet-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <UserPlus size={18} /> 
                   {activeProject?.projectCode} Kadrosuna Ekle
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
