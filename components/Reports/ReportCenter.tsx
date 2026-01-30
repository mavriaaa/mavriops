
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
  FileSearch,
  Bot,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowDownRight,
  Users,
  CheckCircle2 as CheckCircleIcon,
  FileSpreadsheet
} from 'lucide-react';
import { Priority } from '../../types';
import { GoogleGenAI, Type } from "@google/genai";
import EmptyState from '../Common/EmptyState';

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
  metrics?: {
    progress?: number;
    safetyScore?: number;
    budgetStatus?: string;
    manpower?: number;
  };
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
      actions: ['Eksik personel için İK ile görüşülecek.', 'Vibratör bakımı yapılacak.'],
      metrics: { progress: 85, manpower: 42 }
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
      actions: ['Yeni emniyet kemeri siparişi verildi.', 'Salı günü işbaşı eğitimi yapılacak.'],
      metrics: { safetyScore: 94 }
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
      actions: ['Hava durumu takibi devam edecek.'],
      metrics: { progress: 12, manpower: 15 }
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
      actions: ['Tedarikçi sözleşmeleri gözden geçirilecek.'],
      metrics: { budgetStatus: 'KRİTİK' }
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('HEPSİ');
  const [statusFilter, setStatusFilter] = useState<string>('HEPSİ');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const [newReport, setNewReport] = useState<Partial<ReportData>>({
    title: '',
    category: 'SAHA',
    site: 'SAHA-A',
    summary: ''
  });

  if (!context) return null;
  const { t, currentUser, addToast } = context;

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

  const handleAiAnalysis = async () => {
    if (!selectedReport) return;
    setIsAnalyzing(true);
    setAiInsight(null);
    addToast('info', 'AI Analiz Başlatıldı', 'MavriBot kurumsal rapor verilerini stratejik olarak yorumluyor...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this corporate operational report and provide:
        1. Executive strategic summary (1 paragraph)
        2. Top 3 risk mitigation priorities
        3. Compliance rating based on status.
        
        REPORT DATA:
        Title: ${selectedReport.title}
        Category: ${selectedReport.category}
        Summary: ${selectedReport.summary}
        Findings: ${selectedReport.findings.join(', ')}
        Actions: ${selectedReport.actions.join(', ')}
        Status: ${selectedReport.status}`,
      });
      setAiInsight(response.text);
      addToast('success', 'Analiz Tamamlandı', 'MavriBot raporu 360 derece perspektifiyle yorumladı.');
    } catch (error) {
      addToast('error', 'Analiz Servisi Hatası', 'MavriBot şu an yanıt veremiyor, lütfen daha sonra tekrar deneyiniz.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    addToast('info', 'Dışa Aktarma Hazırlanıyor', 'Rapor arşivi kurumsal formatta PDF/XLS olarak hazırlanıyor...');
    setTimeout(() => {
        addToast('success', 'Dışa Aktarma Başarılı', 'Seçilen raporlar güvenli bağlantı üzerinden indirildi.');
    }, 1500);
  };

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
    addToast('success', 'Taslak Arşivlendi', 'Yeni rapor taslağı başarıyla denetim listesine eklendi.');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SAHA': return 'bg-blue-600';
      case 'ISG': return 'bg-rose-600';
      case 'PROJE': return 'bg-indigo-600';
      case 'HAFTALIK': return 'bg-emerald-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar">
      
      {/* Header Section */}
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
              <Target size={12} className="text-indigo-500" /> Kurumsal Analitik ve Karar Destek Merkezi
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleExport}
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <FileSpreadsheet size={16} /> Veri Kümesini Aktar
           </button>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
           >
             <FilePlus size={18} /> Yeni Rapor Girişi
           </button>
        </div>
      </div>

      {/* Analytics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <SummaryWidget label="Toplam Kayıt" value={reports.length} icon={FileSearch} color="text-indigo-600" trend="+%12" />
        <SummaryWidget label="Onaylı Kayıt Oranı" value={`%${Math.round((reports.filter(r=>r.status==='ONAYLI').length/reports.length)*100)}`} icon={ShieldCheck} color="text-emerald-500" trend="Standardize" />
        <SummaryWidget label="Aksiyon Bekleyen" value={reports.filter(r=>r.status!=='ONAYLI').length} icon={AlertTriangle} color="text-rose-500" trend="Kritik" />
        <SummaryWidget label="Veri Bütünlüğü" value="%100" icon={Activity} color="text-amber-500" trend="Uyumlu" />
      </div>

      {/* Enhanced Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
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
                 placeholder="ID, yazar veya bağlam ara..." 
                 className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-[11px] font-bold dark:text-white outline-none transition-all shadow-inner"
               />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 outline-none border-2 border-transparent focus:border-indigo-500 cursor-pointer shadow-inner"
            >
               <option value="HEPSİ">TÜM DURUMLAR</option>
               <option value="ONAYLI">ONAYLI</option>
               <option value="INCELEMEDE">İNCELEMEDE</option>
               <option value="TASLAK">TASLAK</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Archive List Section */}
        <div className={`${selectedReport ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
              {filteredReports.length > 0 ? (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                            <th className="px-8 py-5 w-20">Sınıf</th>
                            <th className="px-8 py-5">Rapor Başlığı & Referans</th>
                            <th className="px-8 py-5">Sorumlu Paydaş</th>
                            <th className="px-8 py-5">Yaşam Döngüsü</th>
                            <th className="px-8 py-5 text-right">İşlem</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filteredReports.map((report) => (
                           <tr 
                            key={report.id} 
                            onClick={() => { setSelectedReport(report); setAiInsight(null); }}
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
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                   report.status === 'ONAYLI' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                   report.status === 'INCELEMEDE' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                 }`}>
                                    {report.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 inline-block transition-transform group-hover:translate-x-1" />
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <EmptyState 
                    title="Kayıt Bulunamadı" 
                    description="Belirtilen kriterlere uygun analitik rapor bulunamadı. Lütfen sorgu parametrelerini genişletiniz."
                    secondaryLabel="Parametreleri Sıfırla"
                    onSecondary={() => { setCategoryFilter('HEPSİ'); setStatusFilter('HEPSİ'); setSearchQuery(''); }}
                  />
                </div>
              )}
           </div>
        </div>

        {/* Dynamic Analysis Drawer */}
        {selectedReport && (
          <div className="lg:col-span-5 animate-in slide-in-from-right duration-500">
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl sticky top-10 overflow-hidden group flex flex-col h-[800px]">
                
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${getCategoryColor(selectedReport.category)} flex items-center justify-center text-white shadow-lg`}>
                         <FileText size={24} />
                      </div>
                      <div>
                         <h3 className="text-[11px] font-black dark:text-white uppercase tracking-tighter leading-none">{selectedReport.id}</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Stratejik Analiz</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        disabled={isAnalyzing}
                        onClick={handleAiAnalysis} 
                        className={`p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all ${isAnalyzing ? 'animate-pulse' : ''}`} 
                        title="MavriBot AI Analiz"
                      >
                        {isAnalyzing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Bot size={20} />}
                      </button>
                      <button onClick={() => setSelectedReport(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={20} /></button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                   <div className="grid grid-cols-2 gap-6">
                      {selectedReport.metrics?.progress !== undefined && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-inner">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><ArrowUpRight size={12} className="text-indigo-500" /> İlerleme</p>
                          <p className="text-2xl font-black dark:text-white tracking-tighter">%{selectedReport.metrics.progress}</p>
                          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                             <div style={{width: `${selectedReport.metrics.progress}%`}} className="h-full bg-indigo-600 rounded-full" />
                          </div>
                        </div>
                      )}
                      {selectedReport.metrics?.safetyScore !== undefined && (
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 shadow-inner">
                          <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2"><ShieldCheck size={12} /> Uyum Skoru</p>
                          <p className="text-2xl font-black text-emerald-600 tracking-tighter">%{selectedReport.metrics.safetyScore}</p>
                          <p className="text-[8px] font-bold text-emerald-500 mt-2">GÜVENLİ SAHA</p>
                        </div>
                      )}
                   </div>

                   {aiInsight && (
                     <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30 animate-in slide-in-from-top-4 relative overflow-hidden">
                        <Sparkles size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           <Bot size={16} /> MavriBot Stratejik Çıkarım
                        </h4>
                        <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap italic">
                           {aiInsight}
                        </p>
                     </div>
                   )}

                   <section>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Eye size={16} className="text-indigo-500" /> Yönetici Özeti
                      </h4>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border-l-4 border-indigo-500 shadow-inner">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{selectedReport.summary}"
                        </p>
                      </div>
                   </section>

                   <div className="grid grid-cols-1 gap-8">
                      {selectedReport.findings.length > 0 && (
                        <section>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Zap size={16} className="text-amber-500" /> Kritik Bulgular
                           </h4>
                           <div className="space-y-3">
                              {selectedReport.findings.map((finding, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                   <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                   <p className="text-xs font-bold dark:text-slate-300">{finding}</p>
                                </div>
                              ))}
                           </div>
                        </section>
                      )}
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex gap-4">
                   <button className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-200 transition-all active:scale-95">Revizyon İstasyonu</button>
                   {selectedReport.status !== 'ONAYLI' ? (
                     <button onClick={() => { setReports(prev => prev.map(r => r.id === selectedReport.id ? {...r, status: 'ONAYLI'} : r)); setSelectedReport({...selectedReport, status: 'ONAYLI'}); addToast('success', 'Rapor Kesinleşti', 'Yönetim kurulu onayı dijital imza ile arşivlendi.'); }} className="flex-1 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">Onayla ve Yayınla</button>
                   ) : (
                     <button className="flex-1 py-5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] flex items-center justify-center gap-2 shadow-inner">
                       <CheckCircleIcon size={16} /> Arşivlendi
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{t('newWorkItem')}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Analitik Kayıt Formu</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Rapor Başlığı ve Konu</label>
                    <input 
                      type="text" 
                      value={newReport.title}
                      onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                      placeholder="Örn: Saha-A Zemin Etüdü ve İlerleme Analizi"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sınıflandırma</label>
                      <select 
                        value={newReport.category}
                        onChange={(e) => setNewReport({...newReport, category: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                      >
                         <option value="SAHA">Saha Operasyon Raporu</option>
                         <option value="ISG">Güvenlik ve Uyum Raporu</option>
                         <option value="PROJE">Proje İlerleme Analizi</option>
                         <option value="HAFTALIK">Periyodik Yönetim Özeti</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Lokasyon</label>
                      <select 
                        value={newReport.site}
                        onChange={(e) => setNewReport({...newReport, site: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer shadow-inner"
                      >
                         <option value="SAHA-A">Saha Kuzey</option>
                         <option value="SAHA-B">Ankara Hub</option>
                         <option value="SAHA-C">İzmir Liman</option>
                         <option value="GENEL">Merkezi Yönetim</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Analiz ve Bulgular</label>
                    <textarea 
                      value={newReport.summary}
                      onChange={(e) => setNewReport({...newReport, summary: e.target.value})}
                      placeholder="Analiz bulgularını ve stratejik notları buraya ekleyin..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[1.5rem] p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner resize-none"
                    />
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all"
                 >
                   İşlemi İptal Et
                 </button>
                 <button 
                  onClick={handleCreateReport}
                  className="flex-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <CheckCircle size={18} /> Kaydı Kesinleştir
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryWidget = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
     <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={80} />
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <h3 className={`text-4xl font-black tracking-tighter dark:text-white ${color}`}>{value}</h3>
     <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 uppercase ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
       {trend.includes('+') && <TrendingUp size={12} />} {trend}
     </p>
  </div>
);

export default ReportCenter;
