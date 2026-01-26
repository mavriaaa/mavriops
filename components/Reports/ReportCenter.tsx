
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { FilePlus, FileText, CheckCircle, Clock } from 'lucide-react';

const ReportCenter: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black dark:text-white">{t('reports')}</h1>
          <p className="text-sm text-slate-500 font-medium">Saha ve merkez operasyon raporları.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20">
          <FilePlus size={18} /> Yeni Rapor Yaz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 group-hover:text-indigo-500 transition-colors">
                <FileText size={24} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                <CheckCircle size={10} /> Onaylandı
              </span>
            </div>
            <h3 className="font-bold dark:text-white mb-2">Günlük Saha Raporu - Site A</h3>
            <p className="text-xs text-slate-500 mb-6 line-clamp-2">Bugün temelde 20 kişi çalıştı, 5 mikser beton döküldü. Herhangi bir iş kazası yaşanmadı...</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img src="https://picsum.photos/seed/p/100" className="w-6 h-6 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400">Caner S.</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                <Clock size={12} /> 2 saat önce
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportCenter;
