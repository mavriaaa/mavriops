
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { 
  FileText, Search, Filter, Download, 
  ChevronRight, Calendar, BarChart3, Target,
  FileSpreadsheet, Activity, TrendingUp, ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import EmptyState from '../Common/EmptyState';

const ReportCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!context) return null;
  const { t, addToast, activeProjectId, metrics, formatMoney, projects } = context;

  // Proje bazlı dummy rapor verisi filtreleme (Hardening)
  const allReports = [
    { id: 'PRJ-101', projectId: 'p1', title: 'Beton Alım Raporu', site: 'A Blok', status: 'ONAYLI', amount: 450000, date: '2024-05-15' },
    { id: 'PRJ-102', projectId: 'p1', title: 'Demir Sevkiyatı', site: 'B Blok', status: 'ONAYLI', amount: 890000, date: '2024-05-18' },
    { id: 'PRJ-103', projectId: 'p2', title: 'Hafriyat İşçilik', site: 'Genel', status: 'REVİZYON', amount: 25000, date: '2024-05-20' },
  ];

  const filteredReports = useMemo(() => {
    return allReports.filter(r => 
      r.projectId === activeProjectId && 
      (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeProjectId, searchQuery]);

  const handleExport = () => {
    addToast('info', 'Hazırlanıyor', 'Rapor verileri Excel formatında dışa aktarılıyor...');
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('reports')}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Target size={12} className="text-indigo-500" /> Proje Bağlamı: {activeProject?.name}
            </p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FileSpreadsheet size={16} /> Excel Aktarımı
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <SummaryWidget label="Toplam Talep" value={metrics?.activeRequests || 0} icon={FileText} color="text-indigo-600" />
        <SummaryWidget label="Onaylı Gider" value={formatMoney(metrics?.financials.approvedExpenses || 0)} icon={ShieldCheck} color="text-emerald-500" />
        <SummaryWidget label="Kritik Riskler" value={metrics?.criticalIssues || 0} icon={AlertTriangle} color="text-rose-500" />
        <SummaryWidget label="Saha Görevleri" value={metrics?.activeTasks || 0} icon={Activity} color="text-amber-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
             <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">İşlem Arşivi</h2>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ara..." 
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-indigo-500 w-64 shadow-sm" 
                />
             </div>
          </div>
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
                   <th className="px-8 py-5">Referans</th>
                   <th className="px-8 py-5">Talep Konusu</th>
                   <th className="px-8 py-5">Saha</th>
                   <th className="px-8 py-5">Tutar</th>
                   <th className="px-8 py-5">Durum</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                     <td className="px-8 py-6 text-[10px] font-black text-indigo-600">{r.id}</td>
                     <td className="px-8 py-6 text-sm font-black dark:text-white uppercase">{r.title}</td>
                     <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{r.site}</td>
                     <td className="px-8 py-6 text-sm font-black dark:text-white">₺{r.amount.toLocaleString('tr-TR')}</td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'ONAYLI' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                           {r.status}
                        </span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="p-20"><EmptyState title="Veri Bulunamadı" description="Bu proje için henüz raporlanacak işlem kaydı bulunmamaktadır." /></div>
          )}
      </div>
    </div>
  );
};

const SummaryWidget = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
     <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={80} />
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <h3 className={`text-4xl font-black tracking-tighter dark:text-white ${color}`}>{value}</h3>
  </div>
);

export default ReportCenter;
