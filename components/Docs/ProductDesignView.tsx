
import React, { useContext } from 'react';
import { 
  Box, 
  Database, 
  Layers, 
  CheckCircle, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AppContext } from '../../App';

const ProductDesignView: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-slate-900 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{t('systemArchitecture')}</h1>
        <p className="text-xl text-slate-500">{t('hybridSynergy')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <section className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-indigo-600">
            <Layers size={24} />
            <h2 className="text-xl font-bold">{t('phase1')}</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Workspace & RBAC Auth (Owner/Admin/Member)",
              "Real-time Channels & DM (Websocket)",
              "Threaded Conversations (Sub-replies)",
              "Kanban Board Engine (List/Card logic)",
              "Basic Card Detail (Checklist, Comments)",
              "File Uploads (S3/MinIO compatible)"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle size={16} className="text-green-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-indigo-600">
            <Zap size={24} />
            <h2 className="text-xl font-bold">{t('hybridSecret')}</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            MavriCollab, mesajları potansiyel görevler olarak ele alır. Herhangi bir mesaj Kanban kartına dönüştürülebilir.
          </p>
        </section>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Database className="text-indigo-600" /> {t('databaseSchema')}
          </h3>
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-slate-700">
<pre>{`-- Core Entities
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);`}</pre>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" /> {t('apiDesign')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
              <h4 className="font-bold text-sm mb-2 uppercase">Auth</h4>
              <code className="text-[10px] block bg-slate-100 dark:bg-slate-800 p-2 rounded">POST /auth/login</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDesignView;
