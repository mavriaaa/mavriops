
import React, { useContext, useState, useMemo } from 'react';
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
  DollarSign
} from 'lucide-react';

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Aktif' | 'İzinli' | 'Saha';
  performance: number;
  startDate: string;
  avatar: string;
}

interface LeaveRequest {
  id: string;
  name: string;
  date: string;
  type: string;
  avatar: string;
}

const HRDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([
    { id: 'u1', name: 'Sinem CEO', role: 'CEO / Kurucu', department: 'Yönetim', status: 'Aktif', performance: 98, startDate: '2020-01-01', avatar: 'https://i.pravatar.cc/150?u=sinem' },
    { id: 'u2', name: 'Deniz Müdür', role: 'Operasyon Müdürü', department: 'Saha Yönetimi', status: 'Aktif', performance: 92, startDate: '2021-03-15', avatar: 'https://i.pravatar.cc/150?u=deniz' },
    { id: 'u4', name: 'Barış Mühendis', role: 'Saha Mühendisi', department: 'İnşaat', status: 'Saha', performance: 88, startDate: '2022-06-10', avatar: 'https://i.pravatar.cc/150?u=baris' },
    { id: 'u5', name: 'Merve Uzman', role: 'İSG Uzmanı', department: 'Güvenlik', status: 'Saha', performance: 95, startDate: '2023-01-20', avatar: 'https://i.pravatar.cc/150?u=merve' },
    { id: 'u6', name: 'Caner Şef', role: 'Şantiye Şefi', department: 'İnşaat', status: 'Aktif', performance: 85, startDate: '2021-11-05', avatar: 'https://i.pravatar.cc/150?u=caner' },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 'l1', name: 'Mehmet Kalfa', date: '22-25 Mayıs', type: 'Yıllık İzin', avatar: 'https://i.pravatar.cc/150?u=mehmet' },
    { id: 'l2', name: 'Selin Uzman', date: 'Bugün', type: 'Mazeret', avatar: 'https://i.pravatar.cc/150?u=selin' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    department: 'İnşaat',
    status: 'Aktif' as any
  });

  if (!context) return null;
  const { t } = context;

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const stats = {
    total: employees.length,
    activeField: employees.filter(e => e.status === 'Saha').length,
    onLeave: employees.filter(e => e.status === 'İzinli').length,
    avgPerformance: Math.round(employees.reduce((acc, curr) => acc + curr.performance, 0) / employees.length) || 0
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return;
    const emp: EmployeeRecord = {
      id: `u${Date.now()}`,
      name: newEmployee.name,
      role: newEmployee.role,
      department: newEmployee.department,
      status: newEmployee.status,
      performance: 75,
      startDate: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${newEmployee.name.split(' ')[0]}`
    };
    setEmployees([emp, ...employees]);
    setIsNewEmployeeModalOpen(false);
    setNewEmployee({ name: '', role: '', department: 'İnşaat', status: 'Aktif' });
  };

  const handleApproveLeave = (id: string) => {
    const request = leaveRequests.find(r => r.id === id);
    if (!request) return;
    
    // Simüle: İzinli durumuna çek
    setEmployees(prev => prev.map(e => e.name === request.name ? { ...e, status: 'İzinli' } : e));
    setLeaveRequests(prev => prev.filter(r => r.id !== id));
    alert(`${request.name} için izin onaylandı.`);
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.filter(r => r.id !== id));
    alert(`İzin talebi reddedildi.`);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar">
      {/* Üst Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
              {t('hr')}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-violet-500" /> Kurumsal Yetenek ve İş Gücü Yönetimi
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <Download size={16} /> Excel Aktar
           </button>
           <button 
            onClick={() => setIsNewEmployeeModalOpen(true)}
            className="px-8 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-600/30 hover:bg-violet-700 transition-all flex items-center gap-2 active:scale-95"
           >
             <UserPlus size={18} /> Yeni Personel Kaydı
           </button>
        </div>
      </div>

      {/* İK Analitik Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-violet-600">
              <Users size={80} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Toplam İş Gücü</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">{stats.total} <span className="text-sm text-slate-400">Çalışan</span></h3>
           <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500">
              <TrendingUp size={14} /> %4.2 Büyüme <span className="text-slate-400 font-medium">bu ay</span>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-indigo-500">
              <Activity size={80} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saha Operasyon</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">{stats.activeField} <span className="text-sm text-slate-400">Aktif</span></h3>
           <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-500">
              <Clock size={14} /> %98 Devam Oranı <span className="text-slate-400 font-medium">bugün</span>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-amber-500">
              <Calendar size={80} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">İzin ve Devamsızlık</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">{stats.onLeave} <span className="text-sm text-slate-400">Kişi</span></h3>
           <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500">
              <AlertCircle size={14} /> {leaveRequests.length} Onay Bekliyor
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-emerald-500">
              <ShieldCheck size={80} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Performans Skoru</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">%{stats.avgPerformance}</h3>
           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div 
                style={{ width: `${stats.avgPerformance}%` }} 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" 
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Personel Listesi */}
        <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                 <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
                    <Users className="text-violet-500" /> Personel Envanteri
                 </h2>
                 <div className="flex gap-3">
                    <div className="relative">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Personel ara..." 
                        className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-violet-500 w-48 shadow-sm transition-all" 
                       />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-violet-500 transition-colors"><Filter size={20} /></button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
                          <th className="px-8 py-5">Personel</th>
                          <th className="px-8 py-5">Departman / Rol</th>
                          <th className="px-8 py-5">Durum</th>
                          <th className="px-8 py-5">Performans</th>
                          <th className="px-8 py-5 text-right">Detay</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredEmployees.map((emp) => (
                         <tr 
                          key={emp.id} 
                          onClick={() => setSelectedEmployee(emp)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group ${selectedEmployee?.id === emp.id ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}
                         >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                                  <div>
                                     <p className="text-sm font-black dark:text-white uppercase tracking-tight">{emp.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Giriş: {emp.startDate}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-black dark:text-white uppercase">{emp.department}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.role}</p>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                 emp.status === 'Aktif' ? 'bg-emerald-100 text-emerald-600' :
                                 emp.status === 'Saha' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                               }`}>
                                  {emp.status}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                     <div style={{ width: `${emp.performance}%` }} className={`h-full ${emp.performance > 90 ? 'bg-emerald-500' : 'bg-violet-500'}`} />
                                  </div>
                                  <span className="text-[10px] font-black dark:text-white">%{emp.performance}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-600 inline-block transition-transform group-hover:translate-x-1" />
                            </td>
                         </tr>
                       ))}
                       {filteredEmployees.length === 0 && (
                         <tr>
                            <td colSpan={5} className="py-24 text-center opacity-30 italic">
                               <Search size={48} className="mx-auto mb-4" />
                               Sonuç bulunamadı.
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Sağ Panel: İzinler ve İşe Alım */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* İzin Talepleri */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-black dark:text-white mb-6 tracking-tighter uppercase flex items-center gap-3">
                 <Calendar className="text-amber-500" /> Bekleyen İzinler
              </h2>
              <div className="space-y-4">
                 {leaveRequests.map((req) => (
                   <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                         <img src={req.avatar} className="w-8 h-8 rounded-full object-cover" />
                         <div>
                            <p className="text-[10px] font-black dark:text-white uppercase">{req.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{req.date} • {req.type}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => handleApproveLeave(req.id)}
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                         >
                           <CheckCircle2 size={14} />
                         </button>
                         <button 
                          onClick={() => handleRejectLeave(req.id)}
                          className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                         >
                           <X size={14} />
                         </button>
                      </div>
                   </div>
                 ))}
                 {leaveRequests.length === 0 && (
                   <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Bekleyen izin talebi bulunmuyor.</p>
                 )}
              </div>
           </div>

           {/* Açık Pozisyonlar */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-black dark:text-white mb-6 tracking-tighter uppercase flex items-center gap-3">
                 <Building className="text-indigo-500" /> İşe Alım Kuyruğu
              </h2>
              <div className="space-y-3">
                 {[
                   { title: 'Saha Mühendisi', applicants: 12, priority: 'YÜKSEK' },
                   { title: 'Kıdemli Muhasebeci', applicants: 8, priority: 'ORTA' },
                   { title: 'Formen', applicants: 24, priority: 'YÜKSEK' },
                 ].map((job, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group cursor-pointer">
                      <div className="text-left">
                         <p className="text-[10px] font-black dark:text-white uppercase">{job.title}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{job.applicants} Başvuru</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${job.priority === 'YÜKSEK' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                         {job.priority}
                      </span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                 Tüm İlanları Yönet
              </button>
           </div>
        </div>
      </div>

      {/* Personel Detay Modalı */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Özlük Dosyası</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personel 360° Görünümü</p>
                 </div>
                 <button onClick={() => setSelectedEmployee(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="flex items-center gap-6">
                    <img src={selectedEmployee.avatar} className="w-24 h-24 rounded-[2rem] object-cover shadow-xl ring-4 ring-violet-500/10" />
                    <div className="flex-1">
                       <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">{selectedEmployee.name}</h3>
                       <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">{selectedEmployee.role}</p>
                       <div className="mt-3 flex gap-2">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase text-slate-500">{selectedEmployee.department}</span>
                          <span className="px-3 py-1 bg-emerald-100 rounded-full text-[9px] font-black uppercase text-emerald-600">{selectedEmployee.status}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                      className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Performans</p>
                       <p className="text-2xl font-black dark:text-white">%{selectedEmployee.performance}</p>
                       <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                          <div style={{ width: `${selectedEmployee.performance}%` }} className="h-full bg-emerald-500" />
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Giriş Tarihi</p>
                       <p className="text-lg font-black dark:text-white">{selectedEmployee.startDate}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sistem Kaydı Aktif</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Hızlı Aksiyonlar</h4>
                    <div className="grid grid-cols-3 gap-3">
                       <button 
                        onClick={() => { alert('İzin kaydı oluşturuldu.'); setSelectedEmployee(null); }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase text-slate-500 hover:bg-violet-600 hover:text-white transition-all flex flex-col items-center gap-2"
                       >
                         <Calendar size={18} /> İzin Yaz
                       </button>
                       <button 
                        onClick={() => { alert('Performans değerlendirme ekranına yönlendiriliyorsunuz.'); }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase text-slate-500 hover:bg-violet-600 hover:text-white transition-all flex flex-col items-center gap-2"
                       >
                         <Activity size={18} /> Değerlendir
                       </button>
                       <button 
                        onClick={() => { alert('Maaş artış talebi finans onayına gönderildi.'); }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase text-slate-500 hover:bg-emerald-600 hover:text-white transition-all flex flex-col items-center gap-2"
                       >
                         <DollarSign size={18} /> Zam Talebi
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">Özlük Dosyasını İndir</button>
                 <button className="flex-1 py-5 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 hover:bg-violet-700 transition-all">Profilini Düzenle</button>
              </div>
           </div>
        </div>
      )}

      {/* Yeni Personel Modalı */}
      {isNewEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Yeni Personel Kaydı</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sisteme yeni yetenek dahil ediliyor</p>
                 </div>
                 <button onClick={() => setIsNewEmployeeModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ad Soyad</label>
                    <input 
                      type="text" 
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Örn: Canan Demir"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pozisyon / Rol</label>
                    <input 
                      type="text" 
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      placeholder="Örn: Kıdemli Mimar"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Departman</label>
                      <select 
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="İnşaat">İnşaat</option>
                         <option value="Yönetim">Yönetim</option>
                         <option value="Güvenlik">Güvenlik</option>
                         <option value="Finans">Finans</option>
                         <option value="Saha Yönetimi">Saha Yönetimi</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Durum</label>
                      <select 
                        value={newEmployee.status}
                        onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="Aktif">Aktif</option>
                         <option value="Saha">Saha</option>
                         <option value="İzinli">İzinli</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  onClick={() => setIsNewEmployeeModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all"
                 >
                   Vazgeç
                 </button>
                 <button 
                  onClick={handleAddEmployee}
                  className="flex-2 px-10 py-5 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-600/30 hover:bg-violet-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <Plus size={18} /> Kaydı Tamamla
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
