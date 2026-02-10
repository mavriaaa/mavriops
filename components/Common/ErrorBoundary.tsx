import React, { ErrorInfo, ReactNode, Component } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  // Made children optional to resolve the "missing children" error when using ErrorBoundary as a JSX wrapper in App.tsx
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary catches uncaught errors in the component tree.
 * Updated to fix property existence errors by explicitly declaring state and props and making children optional.
 */
class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare state property to fix "Property 'state' does not exist on type 'ErrorBoundary'" error
  public state: State = {
    hasError: false
  };

  // Explicitly declare props property to fix "Property 'props' does not exist on type 'ErrorBoundary'" error
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MavriOps Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-10">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-600/10 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-rose-600/5">
              <ShieldAlert size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Bir Hata Oluştu</h1>
              <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium">
                Uygulama beklenmedik bir durumla karşılaştı. Teknik ekip bilgilendirildi.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <RefreshCcw size={18} /> Sayfayı Yenile ve Devam Et
            </button>
          </div>
        </div>
      );
    }

    // Accessing children from this.props which is now explicitly declared and mapped from constructor
    return this.props.children;
  }
}

export default ErrorBoundary;