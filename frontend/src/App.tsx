import React, { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PaymentProvider, usePayment } from './contexts/PaymentContext';
import DispatchDashboard from './components/DispatchDashboard';
import ActiveCallInterface from './components/ActiveCallInterface';
import CallQueue from './components/CallQueue';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PaymentSystem from './components/PaymentSystem';
import PaymentIntegration from './components/PaymentIntegration';
import DevelopmentNotice from './components/DevelopmentNotice';

type TabType = 'dashboard' | 'active-call' | 'queue' | 'analytics' | 'payment';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeCall, setActiveCall] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const { isPaymentRequired, requiredServiceType, setPaymentRequired } = usePayment();

  useEffect(() => {
    const finish = () => setIsLoading(false);
    const fallback = setTimeout(() => setIsLoading(false), 6000);
    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
    }
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(fallback);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' 
          : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
      }`}>
        {/* Animated logo */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-blue-500 blur-lg opacity-70 animate-pulse`} />
            <div className={`relative h-full w-full rounded-3xl ${
              theme === 'light' 
                ? 'bg-white/80 backdrop-blur-md border border-slate-200 shadow-2xl' 
                : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl'
            } flex items-center justify-center`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[float_2.5s_ease-in-out_infinite]">
                <defs>
                  <linearGradient id="phoneSplash" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="url(#phoneSplash)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
              </svg>
            </div>
          </div>
          <div className={`h-1.5 w-48 rounded-full ${
            theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
          } overflow-hidden`}>
            <div className="h-full w-2/5 bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-400 animate-[shimmer_2s_linear_infinite]" />
          </div>
          <div className={`font-semibold tracking-wide text-lg transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-700' : 'text-white/90'
          }`}>Loading Emergency Dispatch System…</div>
        </div>
        <style>{`@keyframes shimmer{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}@keyframes float{0%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(2deg)}100%{transform:translateY(0) rotate(0deg)}}`}</style>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'active-call', label: 'Active Call', icon: '📞' },
    { id: 'queue', label: 'Call Queue', icon: '⏳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ] as const;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DispatchDashboard onCallStart={setActiveCall} />;
      case 'active-call':
        return <ActiveCallInterface call={activeCall} onCallEnd={() => setActiveCall(null)} />;
      case 'queue':
        return <CallQueue onCallSelect={setActiveCall} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'payment':
        return <PaymentSystem serviceType="premium" />;
      default:
        return <DispatchDashboard onCallStart={setActiveCall} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' 
        : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white/80 border-slate-200 shadow-sm' 
          : 'bg-black/20 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 blur-sm opacity-60" />
                <div className={`relative h-full w-full rounded-xl backdrop-blur-md border flex items-center justify-center transition-colors duration-300 ${
                  theme === 'light' 
                    ? 'bg-white/80 border-slate-200' 
                    : 'bg-white/10 border-white/20'
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="headerPhone" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="url(#headerPhone)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>
              </div>
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>GlobalMed Triage</h1>
            </div>
            
            {/* Tab Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? theme === 'light' 
                        ? 'bg-blue-100 text-blue-700 shadow-lg' 
                        : 'bg-white/20 text-white shadow-lg'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'light' 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                }`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabType)}
                  className={`border rounded-lg px-3 py-2 text-sm transition-colors duration-300 ${
                    theme === 'light' 
                      ? 'bg-white border-slate-200 text-slate-700' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id} className={theme === 'light' ? 'bg-white' : 'bg-slate-800'}>
                      {tab.icon} {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Payment Required Overlay */}
      {isPaymentRequired && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <PaymentIntegration
              onPaymentComplete={(success, data) => {
                if (success) {
                  setPaymentRequired(false);
                }
              }}
              serviceType={requiredServiceType || 'emergency'}
              amount={requiredServiceType === 'premium' ? 79.99 : requiredServiceType === 'enterprise' ? 199.99 : 29.99}
              description="Payment required to access premium emergency services"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-[fadeIn_300ms_ease-out]">
          {renderActiveTab()}
        </div>
      </main>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      
      {/* Development Notice */}
      <DevelopmentNotice />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PaymentProvider>
        <AppContent />
      </PaymentProvider>
    </ThemeProvider>
  );
}

export default App;
