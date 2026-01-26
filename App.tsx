
import React, { useState, useMemo, useEffect } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { MOCK_USERS } from './constants';
import { User } from './types';
import { translations, Language } from './i18n';

// MavriOps Pro Components
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import WorkItemCenter from './components/WorkItems/WorkItemCenter';
import RequestCenter from './components/Requests/RequestCenter';
import ProcurementCenter from './components/Procurement/ProcurementCenter';
import AccountingDashboard from './components/Accounting/AccountingDashboard';
import FieldOpsBoard from './components/Field/FieldOpsBoard';
import ReportCenter from './components/Reports/ReportCenter';

export interface AppContextType {
  currentUser: User;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser] = useState<User>(MOCK_USERS[0]); // Demo for CEO u1
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key];
  };

  const contextValue = useMemo(() => ({
    currentUser,
    isDarkMode,
    setDarkMode: setIsDarkMode,
    language,
    setLanguage,
    t
  }), [currentUser, isDarkMode, language]);

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/work-items" element={<WorkItemCenter />} />
              <Route path="/requests" element={<RequestCenter />} />
              <Route path="/procurement" element={<ProcurementCenter />} />
              <Route path="/accounting" element={<AccountingDashboard />} />
              <Route path="/field" element={<FieldOpsBoard />} />
              <Route path="/reports" element={<ReportCenter />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
