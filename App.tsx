
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MOCK_USERS } from './constants';
import { User, ToastMessage, UserPreferences, MetricSummary, Project } from './types';
import { translations, Language } from './i18n';
import { ApiService } from './services/api';

// Components
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import WorkItemCenter from './components/WorkItems/WorkItemCenter';
import RequestCenter from './components/Requests/RequestCenter';
import ProcurementCenter from './components/Procurement/ProcurementCenter';
import AccountingDashboard from './components/Accounting/AccountingDashboard';
import FieldOpsBoard from './components/Field/FieldOpsBoard';
import ReportCenter from './components/Reports/ReportCenter';
import ChatView from './components/Chat/ChatView';
import ApprovalsInbox from './components/Approvals/ApprovalsInbox';
import HRDashboard from './components/HR/HRDashboard';
import ProfileModal from './components/Profile/ProfileModal';
import ToastContainer from './components/Common/ToastContainer';
import WorkflowStudio from './components/Admin/WorkflowStudio';
import BudgetManager from './components/Finance/BudgetManager';
import ProjectSiteCenter from './components/Projects/ProjectSiteCenter';
import ProjectHeader from './components/Layout/ProjectHeader';

export interface AppContextType {
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  isProfileOpen: boolean;
  setProfileOpen: (val: boolean) => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  preferences: UserPreferences;
  updatePreferences: (p: Partial<UserPreferences>) => void;
  metrics: MetricSummary | null;
  refreshMetrics: () => void;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  projects: Project[];
}

export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(ApiService.getPreferences());
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('prj-1'); // Default to first project
  const [projects, setProjects] = useState<Project[]>([]);

  const refreshMetrics = useCallback(async () => {
    const summary = await ApiService.getMetricSummary(activeProjectId);
    setMetrics(summary);
  }, [activeProjectId]);

  useEffect(() => {
    ApiService.fetchProjects().then(setProjects);
  }, []);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  useEffect(() => {
    if (prefs.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [prefs]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    ApiService.savePreferences(updated);
    addToast('success', 'Ayarlar Kaydedildi', 'Kullanıcı tercihleriniz başarıyla güncellendi.');
  };

  const t = (key: keyof typeof translations['en']): string => {
    return (translations[prefs.language as Language] as any)[key] || (translations['en'] as any)[key] || key;
  };

  const contextValue = useMemo(() => ({
    currentUser,
    updateCurrentUser: (u: any) => setCurrentUser(prev => ({ ...prev, ...u })),
    isDarkMode: prefs.theme === 'dark',
    setDarkMode: (val: boolean) => updatePreferences({ theme: val ? 'dark' : 'light' }),
    language: prefs.language as Language,
    setLanguage: (lang: Language) => updatePreferences({ language: lang }),
    t,
    isProfileOpen,
    setProfileOpen,
    addToast,
    preferences: prefs,
    updatePreferences,
    metrics,
    refreshMetrics,
    activeProjectId,
    setActiveProjectId,
    projects
  }), [currentUser, prefs, isProfileOpen, metrics, refreshMetrics, activeProjectId, projects]);

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all duration-300">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <ProjectHeader />
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectSiteCenter />} />
                <Route path="/work-items" element={<WorkItemCenter />} />
                <Route path="/approvals" element={<ApprovalsInbox />} />
                <Route path="/requests" element={<RequestCenter />} />
                <Route path="/procurement" element={<ProcurementCenter />} />
                <Route path="/accounting" element={<AccountingDashboard />} />
                <Route path="/field" element={<FieldOpsBoard />} />
                <Route path="/reports" element={<ReportCenter />} />
                <Route path="/hr" element={<HRDashboard />} />
                <Route path="/chat" element={<ChatView />} />
                <Route path="/chat/:channelId" element={<ChatView />} />
                <Route path="/admin/workflow" element={<WorkflowStudio />} />
                <Route path="/finance/budgets" element={<BudgetManager />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
          <ProfileModal />
          <ToastContainer toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
