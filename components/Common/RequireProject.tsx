
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../App';
import { Briefcase, ShieldAlert, ChevronRight } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const RequireProject: React.FC<Props> = ({ children }) => {
  const context = useContext(AppContext);
  const location = useLocation();

  if (!context) return null;
  const { activeProjectId, currentUser, projects, setActiveProjectId } = context;

  // 1. Proje Seçilmemişse
  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 animate-in fade-in zoom-in-95 duration-500 bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 border-4 border-indigo-600/5">
           <Briefcase size={48} />
        </div>
        <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4 text-center">Devam Etmek İçin Proje Seçin</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center mb-10 leading-relaxed font-medium">
          Operasyonel verilere ve taleplere erişebilmek için lütfen aktif olarak üzerinde çalıştığınız bir proje seçiniz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {projects.filter(p => currentUser.allowedProjectIds.includes(p.id)).map(prj => (
            <button 
              key={prj.id}
              onClick={() => setActiveProjectId(prj.id)}
              className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-2 border-transparent hover:border-indigo-600 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group text-left"
            >
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prj.projectCode}</p>
                <h4 className="text-base font-black dark:text-white uppercase tracking-tight group-hover:text-indigo-600">{prj.name}</h4>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Proje Seçili Ama Yetki Yoksa (URL ile sızma girişimi)
  if (!currentUser.allowedProjectIds.includes(activeProjectId)) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-rose-50 dark:bg-rose-950/20">
        <div className="w-24 h-24 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-600/30 mb-8">
           <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-rose-600 uppercase tracking-tighter mb-4">403 - Erişim Reddedildi</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center mb-8 leading-relaxed font-bold">
           Üzgünüz, {activeProjectId} referanslı projeyi görüntülemek için gerekli yetkiye sahip değilsiniz.
        </p>
        <button 
          onClick={() => setActiveProjectId('')}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
        >
          Yetkili Projelerime Dön
        </button>
      </div>
     );
  }

  return <>{children}</>;
};

export default RequireProject;
