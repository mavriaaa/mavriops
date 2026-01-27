
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { 
  FilePlus, 
  FileText, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar,
  AlertTriangle,
  ChevronRight,
  X,
  Target,
  Eye,
  Share2,
  PieChart,
  Activity,
  ArrowUpRight,
  FileSearch
} from 'lucide-react';
import { Priority } from '../../types';

interface ReportData {
  id: string;
  title: string;
  category: 'SAHA' | 'ISG' | 'PROJE' | 'HAFTALIK';
  author: string;
  site: string;
  status: 'ONAYLI' | 'TASLAK' | 'INCELEMEDE';
  date: string;
  summary: string;
  findings: string[];
  actions: string[];
}

const ReportCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [reports, setReports] = useState<ReportData[]>([
    { 
      id: 'R-901', 
      title: 'Haftalık Saha İlerleme Raporu', 
      category: 'SAHA', 
      author: 'Caner Şef', 
      site: 'SAHA-A', 
      status: 'ONAYLI', 
      date: '2024-05-18', 
      summary: 'C Blok kaba inşaatı %85 tamamlandı. Beton dökümü planlanan takvimde.',
      findings: ['Beton dökümü 4 saat erken bitti.', 'Demir bağlama ekibi 2 kişi eksik.'],
      actions: ['Eksik personel için İK ile görüşülecek.', 'Vibratör bakımı yapılacak.']
    },
    { 
      id: 'R-902', 
      title: 'Aylık İSG Denetim Raporu', 
      category: 'ISG', 
      author: 'Merve Uzman', 
      site: 'SAHA-B', 
      status: 'INCELEMEDE', 
      date: '2024-05-19', 
      summary: 'Kule vinç operatör belgeleri yenilendi. Yüksekte çalışma ekipmanları kontrol edildi.',
      findings: ['Baret kullanımı %100.', '3 adet emniyet kemeri kullanım dışı bırakıldı.'],
      actions: ['Yeni emniyet kemeri siparişi verildi.', 'Salı günü işbaşı eğitimi yapılacak.']
    },
    { 
      id: 'R-903', 
      title: 'Günlük Saha Günlüğü', 
      category: 'SAHA', 
      author: 'Barış Müh.', 
      site: 'SAHA-A', 
      status: 'ONAYLI', 
      date: '2024-05-20', 
      summary: 'Bugün 15 personel ile çalışma yapıldı. Hafriyat alımı devam ediyor.',
      findings: ['Yağmur nedeniyle 2 saat duruş yaşandı.', 'Yakıt ikmali tamamlandı.'],
      actions: ['Hava durumu takibi devam edecek.']
    },
    { 
      id: 'R-904', 
      title: 'Bütçe ve Maliyet Analizi', 
      category: 'PROJE', 
      author: 'Sinem CEO', 
      site: 'GENEL', 
      status: 'TASLAK', 
      date: '2024-05-20', 
      summary: 'Q2 maliyet kalemleri revize edilecek. Malzeme fiyat artışları bütçeye işlendi.',
      findings: ['Çimento fiyatları %15 arttı.', 'Enerji maliyetleri stabil.'],
      actions: ['Tedarikçi sözleşmeleri gözden geçirilecek.']
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('HEPSİ');
  const [statusFilter, setStatusFilter] = useState<string>('HEPSİ');

  const [newReport, setNewReport] = useState<Partial<ReportData>>({
    title: '',
    category: 'SAHA',
    site: 'SAHA-A',
    summary: ''
  });

  if (!context) return null;
  const { t, currentUser } = context;

  // Filtreleme Mantığı
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.site.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'HEPSİ' || r.category === categoryFilter;
      const matchesStatus = statusFilter === 'HEPSİ' || r.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reports, searchQuery, categoryFilter, statusFilter]);

  const handleCreateReport = () => {
    if (!newReport.title) return;
    const report: ReportData = {
      id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newReport.title as string,
      category: newReport.category as any,
      author: currentUser.name,
      site: newReport.site as string,
      status: 'TASLAK',
      date: new Date().toISOString().split('T')[0],
      summary: newReport.summary as string,
      findings: [],
      actions: []
    };
    setReports([report, ...reports]);
    setIsModalOpen(false);
    setNewReport({ title: '', category: 'SAHA', summary: '' });
  };

  const handleExport = (type: 'PDF' | 'EXCEL') => {
    alert(`${type} raporu oluşturuluyor ve indiriliyor...`);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SAHA': return 'bg-blue-500';
      case 'ISG': return 'bg-rose-500';
      case 'PROJE': return 'bg-indigo-500';
      case 'HAFTALIK': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const stats = {
    total: reports.length,
    approved: reports.filter(r => r.status === 'ONAYLI').length,
    criticalIssues: 2, // Mock
    velocity: 88 // Mock
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar">
      
      {/* Üst Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">
              {t('reports')}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Target size={12} className="text-indigo-500" /> Operasyonel Analiz ve Karar Destek Merkezi
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => handleExport('EXCEL')}
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <Download size={16} /> Veri Seti Dışa Aktar
           </button>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
           >
             <FilePlus size={18} /> Yeni Rapor Oluştur
           </button>
        </div>
      </div>

      {/* Analitik Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <FileSearch size={80} className="text-indigo-600" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Toplam Arşiv</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">{stats.total}</h3>
           <p className="text-xs font-bold text-indigo-500 mt-2 flex items-center gap-1">
             <TrendingUp size={14} /> +%12 <span className="text-slate-400 font-medium">bu hafta</span>
           </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <ShieldCheck size={80} className="text-emerald-500" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yönetim Onayı</p>
           <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">%{Math.round((stats.approved/stats.total)*100)}</h3>
           <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
             <CheckCircle size={14} /> Kusursuz <span className="text-slate-400 font-medium">standartlara uygun</span>
           </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <AlertTriangle size={80} className="text-rose-500" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kritik Bulgular</p>
           <h3 className="text-4xl font-black text-rose-500 tracking-tighter">{stats.criticalIssues}</h3>
           <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
             <ArrowUpRight size={14} /> Aksiyon Bekleyen
           </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <Activity size={80} className="text-indigo-600" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">İlerleme Hızı</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">%{stats.velocity}</h3>
           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div style={{ width: `${stats.velocity}%` }} className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" />
           </div>
        </div>
      </div>

      {/* Filtreleme ve Kontroller */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex flex-wrap gap-3">
            {['HEPSİ', 'SAHA', 'ISG', 'PROJE', 'HAFTALIK'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  categoryFilter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-72">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Rapor, yazar veya saha ara..." 
                 className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-[11px] font-bold dark:text-white outline-none transition-all"
               />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 outline-none border-2 border-transparent focus:border-indigo-500 cursor-pointer"
            >
               <option value="HEPSİ">TÜM DURUMLAR</option>
               <option value="ONAYLI">ONAYLI</option>
               <option value="INCELEMEDE">İNCELEMEDE</option>
               <option value="TASLAK">TASLAK</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Rapor Arşivi Listesi */}
        <div className={`${selectedReport ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                          <th className="px-8 py-5 w-20">Tur</th>
                          <th className="px-8 py-5">Rapor Başlığı ve Tarih</th>
                          <th className="px-8 py-5">Yazar / Saha</th>
                          <th className="px-8 py-5">Durum</th>
                          <th className="px-8 py-5 text-right">İşlem</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredReports.map((report) => (
                         <tr 
                          key={report.id} 
                          onClick={() => setSelectedReport(report)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group ${selectedReport?.id === report.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                         >
                            <td className="px-8 py-6">
                               <div className={`w-10 h-10 rounded-xl ${getCategoryColor(report.category)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                  <FileText size={18} />
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-black dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{report.title}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-400">{report.date}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-black dark:text-white uppercase">{report.author}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.site}</p>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                 report.status === 'ONAYLI' ? 'bg-emerald-100 text-emerald-600' :
                                 report.status === 'INCELEMEDE' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                  {report.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 inline-block transition-transform group-hover:translate-x-1" />
                            </td>
                         </tr>
                       ))}
                       {filteredReports.length === 0 && (
                         <tr>
                            <td colSpan={5} className="py-24 text-center opacity-30 italic">
                               <div className="flex flex-col items-center">
                                  <FileSearch size={64} className="mb-4 text-slate-300" />
                                  <p className="text-[11px] font-black uppercase tracking-widest">Kriterlere uygun rapor bulunamadı</p>
                               </div>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Detay Paneli (Doküman Görünümü) */}
        {selectedReport && (
          <div className="lg:col-span-5 animate-in slide-in-from-right duration-500">
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl sticky top-10 overflow-hidden group flex flex-col h-[750px]">
                
                {/* Panel Üstü */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${getCategoryColor(selectedReport.category)} flex items-center justify-center text-white shadow-lg`}>
                         <FileText size={24} />
                      </div>
                      <div>
                         <h3 className="text-[11px] font-black dark:text-white uppercase tracking-tighter leading-none">{selectedReport.id}</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Kategori: {selectedReport.category}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleExport('PDF')} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"><Download size={20} /></button>
                      <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"><Share2 size={20} /></button>
                      <button onClick={() => setSelectedReport(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={20} /></button>
                   </div>
                </div>

                {/* Doküman İçeriği */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                   <div>
                      <h2 className="text-3xl font-black dark:text-white uppercase leading-tight tracking-tighter mb-4">{selectedReport.title}</h2>
                      <div className="flex flex-wrap gap-4">
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Yazar</p>
                            <p className="text-[10px] font-black dark:text-white uppercase">{selectedReport.author}</p>
                         </div>
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Lokasyon</p>
                            <p className="text-[10px] font-black dark:text-white uppercase">{selectedReport.site}</p>
                         </div>
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Tarih</p>
                            <p className="text-[10px] font-black dark:text-white uppercase">{selectedReport.date}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <section>
                         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Eye size={16} className="text-indigo-500" /> Yönetici Özeti
                         </h4>
                         <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border-l-4 border-indigo-500 shadow-inner">
                           "{selectedReport.summary}"
                         </p>
                      </section>

                      {selectedReport.findings.length > 0 && (
                        <section>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Target size={16} className="text-rose-500" /> Kritik Bulgular
                           </h4>
                           <div className="space-y-3">
                              {selectedReport.findings.map((finding, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                   <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                   <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{finding}</p>
                                </div>
                              ))}
                           </div>
                        </section>
                      )}

                      {selectedReport.actions.length > 0 && (
                        <section>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Activity size={16} className="text-emerald-500" /> Aksiyon Maddeleri
                           </h4>
                           <div className="space-y-3">
                              {selectedReport.actions.map((action, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                   <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                      <CheckCircle size={14} />
                                   </div>
                                   <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{action}</p>
                                </div>
                              ))}
                           </div>
                        </section>
                      )}
                   </div>
                </div>

                {/* Alt Aksiyon Çubuğu */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex gap-4">
                   <button className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-200 transition-all active:scale-95">Revizyon İste</button>
                   {selectedReport.status !== 'ONAYLI' && (
                     <button className="flex-1 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">Raporu Onayla</button>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Yeni Rapor Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Yeni Analiz Raporu</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stratejik operasyon kaydı oluşturuluyor</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Rapor Başlığı</label>
                    <input 
                      type="text" 
                      value={newReport.title}
                      onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                      placeholder="Örn: Saha A Temel İlerleme Analizi"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori</label>
                      <select 
                        value={newReport.category}
                        onChange={(e) => setNewReport({...newReport, category: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                      >
                         <option value="SAHA">Saha Günlüğü</option>
                         <option value="ISG">İSG Raporu</option>
                         <option value="PROJE">Proje İlerleme</option>
                         <option value="HAFTALIK">Haftalık Özet</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">İlgili Saha</label>
                      <select 
                        value={newReport.site}
                        onChange={(e) => setNewReport({...newReport, site: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                      >
                         <option value="SAHA-A">İstanbul Kuzey</option>
                         <option value="SAHA-B">Ankara Batı Hub</option>
                         <option value="SAHA-C">İzmir Lojistik</option>
                         <option value="GENEL">Genel Merkez</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Yönetici Özeti</label>
                    <textarea 
                      value={newReport.summary}
                      onChange={(e) => setNewReport({...newReport, summary: e.target.value})}
                      placeholder="Analiz bulgularını ve kritik notları buraya ekleyin..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner resize-none"
                    />
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
                 >
                   Vazgeç
                 </button>
                 <button 
                  onClick={handleCreateReport}
                  className="flex-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                   <CheckCircle size={18} /> Raporu Yayınla
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportCenter;
