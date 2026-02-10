
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MOCK_USERS } from './constants';
import { User, ToastMessage, MetricSummary, Role } from './types';
import { translations, Language, getTranslation } from './i18n';
import { ApiService } from './services/api';
import { formatCurrencyTR } from './utils/formatters';

// Components & Features
import Sidebar from './components/Layout/Sidebar';
import ProjectHeader from './components/Layout/ProjectHeader';
import Dashboard from './components/Dashboard/Dashboard';
import InboxView from './features/inbox/InboxView';
import RequestsView from './features/requests/RequestsView';
import RequestDetailView from './features/requests/RequestDetailView';
import ReportCenter from './components/Reports/ReportCenter';
import AccountingCenter from './features/accounting/AccountingCenter';
import ChatView from './components/Chat/ChatView'; // Ops Asistan as ChatView
import ProfileModal from './components/Profile/ProfileModal';
import ToastContainer from './components/Common/ToastContainer';
import RequireProject from './components/Common/RequireProject';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Admin Components
import ProjectSiteCenter from './components/Projects/ProjectSiteCenter';
import WorkflowStudio from './components/Admin/WorkflowStudio';

export interface AppContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  updateCurrentUser: (u: Partial<User>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatMoney: (val: number) => string;
  isProfileOpen: boolean;
  setProfileOpen: (val: boolean) => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  projects: any[];
  metrics: MetricSummary | null;
  refreshMetrics: () => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [language, setLanguage] = useState<Language>('tr');
  const [isDarkMode, setDarkMode] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const storageKey = "mavriops.selectedProjectId";
  
  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => {
      if (prev.some(t => t.title === title && t.message === message)) return prev;
      return [...prev, { id, type, title, message }];
    });
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
     const urlId = searchParams.get('projectId');
     const storedId = localStorage.getItem(storageKey);
     const targetId = urlId || storedId || '';
     if (targetId && !currentUser.allowedProjectIds.includes(targetId)) return '';
     return targetId;
  });

  useEffect(() => {
    const urlId = searchParams.get('projectId');
    if (urlId !== null && urlId !== activeProjectId) {
      if (currentUser.allowedProjectIds.includes(urlId)) {
        setActiveProjectIdState(urlId);
      } else if (urlId !== '') {
        setActiveProjectIdState(urlId); 
      }
    }
  }, [searchParams, activeProjectId, currentUser.allowedProjectIds]);

  const setActiveProjectId = useCallback((id: string) => {
      if (id === activeProjectId) return;
      if (id !== '' && !currentUser.allowedProjectIds.includes(id)) {
        addToast('error', 'Erişim Hatası', 'Bu projeyi seçmek için yetkiniz bulunmuyor.');
        return;
      }
      setActiveProjectIdState(id);
      if (id) {
        localStorage.setItem(storageKey, id);
        setSearchParams({ projectId: id }, { replace: true });
      } else {
        localStorage.removeItem(storageKey);
        setSearchParams({}, { replace: true });
      }
  }, [activeProjectId, setSearchParams, currentUser.allowedProjectIds, addToast]);

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const refreshMetrics = useCallback(async () => {
    if (!activeProjectId || !currentUser.allowedProjectIds.includes(activeProjectId)) return;
    const data = await ApiService.getMetricSummary(activeProjectId);
    setMetrics(data);
  }, [activeProjectId, currentUser.allowedProjectIds]);

  useEffect(() => {
    ApiService.fetchProjects().then(prjs => {
      setProjects(prjs);
      if (activeProjectId) refreshMetrics();
    });
  }, [activeProjectId, refreshMetrics]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const t = (key: string): string => getTranslation(key);

  const formatMoney = (val: number): string => formatCurrencyTR(val);

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.OWNER;

  const contextValue = useMemo(() => ({
    currentUser, setCurrentUser, updateCurrentUser,
    language, setLanguage, t, formatMoney,
    isProfileOpen, setProfileOpen,
    addToast, isDarkMode, setDarkMode,
    activeProjectId, setActiveProjectId,
    projects, metrics, refreshMetrics
  }), [currentUser, language, isProfileOpen, isDarkMode, activeProjectId, projects, metrics, refreshMetrics, setActiveProjectId, addToast]);

  return (
    <AppContext.Provider value={contextValue}>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-hidden relative">
            <ProjectHeader />
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Routes>
                <Route path="/dashboard" element={<RequireProject><Dashboard /></RequireProject>} />
                <Route path="/requests" element={<RequireProject><RequestsView /></RequireProject>} />
                <Route path="/requests/:id" element={<RequireProject><RequestDetailView /></RequireProject>} />
                <Route path="/accounting" element={<RequireProject><AccountingCenter /></RequireProject>} />
                <Route path="/inbox" element={<RequireProject><InboxView /></RequireProject>} />
                <Route path="/assistant" element={<RequireProject><ChatView /></RequireProject>} />
                <Route path="/reports" element={<RequireProject><ReportCenter /></RequireProject>} />
                
                {isAdmin && (
                  <>
                    <Route path="/admin/projects" element={<ProjectSiteCenter />} />
                    <Route path="/admin/workflows" element={<WorkflowStudio />} />
                    <Route path="/admin/users" element={<div className="p-20 text-center uppercase font-black text-slate-300">Kullanıcı Yönetimi</div>} />
                    <Route path="/admin/masterdata" element={<div className="p-20 text-center uppercase font-black text-slate-300">Ana Veri Hub</div>} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </main>
          <ProfileModal />
          <ToastContainer toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />
        </div>
      </ErrorBoundary>
    </AppContext.Provider>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
