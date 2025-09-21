import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePayment } from '../contexts/PaymentContext';

interface Call {
  id: string;
  callerName: string;
  phoneNumber: string;
  language: string;
  location: string;
  urgency: 'low' | 'medium' | 'critical';
  timestamp: Date;
  status: 'incoming' | 'active' | 'completed';
  transcription: string;
  translation: string;
  panicDetected: boolean;
  esiLevel: number;
  vitals: {
    stressLevel: number;
    heartRate: number;
  };
}

interface DispatchDashboardProps {
  onCallStart: (call: Call) => void;
}

export default function DispatchDashboard({ onCallStart }: DispatchDashboardProps) {
  const { theme } = useTheme();
  const { setPaymentRequired, hasActiveSubscription } = usePayment();
  const [calls, setCalls] = useState<Call[]>([]);
  const [stats, setStats] = useState({
    activeCalls: 0,
    queueLength: 0,
    avgResponseTime: '2.3s',
    todayHandled: 47
  });

  // Simulate incoming calls
  useEffect(() => {
    const mockCalls: Call[] = [
      {
        id: '1',
        callerName: 'Maria Rodriguez',
        phoneNumber: '+1-555-0123',
        language: 'Spanish',
        location: 'Downtown Medical Center',
        urgency: 'critical',
        timestamp: new Date(),
        status: 'incoming',
        transcription: '¡Ayuda! Mi esposo se desmayó y no respira bien!',
        translation: 'Help! My husband fainted and is not breathing well!',
        panicDetected: true,
        esiLevel: 1,
        vitals: { stressLevel: 95, heartRate: 120 }
      },
      {
        id: '2',
        callerName: 'Ahmed Hassan',
        phoneNumber: '+1-555-0456',
        language: 'Arabic',
        location: 'Westside Plaza',
        urgency: 'medium',
        timestamp: new Date(Date.now() - 300000),
        status: 'incoming',
        transcription: 'أحتاج إلى سيارة إسعاف، لدي ألم في الصدر',
        translation: 'I need an ambulance, I have chest pain',
        panicDetected: false,
        esiLevel: 3,
        vitals: { stressLevel: 70, heartRate: 95 }
      }
    ];
    setCalls(mockCalls);
  }, []);

  const handleAcceptCall = (call: Call) => {
    // Check if premium subscription is required for this call
    if (call.urgency === 'critical' && !hasActiveSubscription('premium')) {
      setPaymentRequired(true, 'premium');
      return;
    }
    
    const updatedCall = { ...call, status: 'active' as const };
    setCalls(prev => prev.map(c => c.id === call.id ? updatedCall : c));
    onCallStart(updatedCall);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getESIColor = (level: number) => {
    if (level <= 2) return 'text-red-400 bg-red-500/20';
    if (level <= 4) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dashboardIcon" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
              </defs>
              <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" stroke="url(#dashboardIcon)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
            </svg>
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>Emergency Dispatch Dashboard</h2>
            <p className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>Monitor and manage incoming emergency calls</p>
          </div>
        </div>
        
        {/* Premium Upgrade Button */}
        {!hasActiveSubscription('premium') && (
          <button
            onClick={() => setPaymentRequired(true, 'premium')}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              Upgrade to Premium
            </span>
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_1px_6px_rgba(255,255,255,0.35)]" />
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`group backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="phoneIcon" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#E5E7EB" />
                    </linearGradient>
                  </defs>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="url(#phoneIcon)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
                </svg>
              </div>
              {stats.activeCalls > 0 && (
                <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse border-2 ${
                  theme === 'light' ? 'border-white' : 'border-slate-900'
                }`} />
              )}
            </div>
            <div>
              <div className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{stats.activeCalls}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Active Calls</div>
            </div>
          </div>
        </div>

        <div className={`group backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="queueIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" stroke="url(#queueIcon)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
                <polyline points="12,6 12,12 16,14" stroke="url(#queueIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{stats.queueLength}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>In Queue</div>
            </div>
          </div>
        </div>

        <div className={`group backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="speedIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#speedIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
              </svg>
            </div>
            <div>
              <div className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{stats.avgResponseTime}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Avg Response</div>
            </div>
          </div>
        </div>

        <div className={`group backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="checkIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <path d="M20 6L9 17l-5-5" stroke="url(#checkIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
              </svg>
            </div>
            <div>
              <div className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{stats.todayHandled}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Today Handled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Calls */}
      <div className={`backdrop-blur-md border rounded-xl p-6 shadow-xl transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white/80 border-slate-200' 
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="alertIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="url(#alertIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="url(#alertIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="url(#alertIcon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse border-2 ${
              theme === 'light' ? 'border-white' : 'border-slate-900'
            }`} />
          </div>
          <div>
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>Incoming Emergency Calls</h2>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>Real-time emergency call monitoring</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>Live</span>
          </div>
        </div>

        <div className="space-y-4">
          {calls.filter(call => call.status === 'incoming').map((call) => (
            <div key={call.id} className={`group border rounded-xl p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 animate-[slideIn_300ms_ease-out] shadow-lg ${
              theme === 'light' 
                ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                        {call.callerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {call.panicDetected && (
                        <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse border-2 ${
                          theme === 'light' ? 'border-white' : 'border-slate-900'
                        }`} />
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-800' : 'text-white'
                      }`}>{call.callerName}</div>
                      <div className={`text-sm transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-600' : 'text-white/70'
                      }`}>{call.phoneNumber}</div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border shadow-lg ${getUrgencyColor(call.urgency)}`}>
                      {call.urgency.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-500' : 'text-white/70'
                        }`}>🌍</span>
                        <span className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-700' : 'text-white/90'
                        }`}>Language: {call.language}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-500' : 'text-white/70'
                        }`}>📍</span>
                        <span className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-700' : 'text-white/90'
                        }`}>{call.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-500' : 'text-white/70'
                        }`}>📊</span>
                        <span className={`text-sm px-2 py-1 rounded ${getESIColor(call.esiLevel)}`}>
                          ESI Level {call.esiLevel}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`text-sm transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-700' : 'text-white/90'
                      }`}>
                        <span className={`transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-500' : 'text-white/70'
                        }`}>Original:</span> {call.transcription}
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-700' : 'text-white/90'
                      }`}>
                        <span className={`transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-500' : 'text-white/70'
                        }`}>Translation:</span> {call.translation}
                      </div>
                      {call.panicDetected && (
                        <div className="flex items-center gap-2 text-red-400">
                          <span>🚨</span>
                          <span className="text-sm font-medium">Panic Detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 ml-6">
                  <button
                    onClick={() => handleAcceptCall(call)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
                      </svg>
                      Accept Call
                    </span>
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_1px_6px_rgba(255,255,255,0.35)]" />
                  </button>
                  <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                    theme === 'light' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-slate-200 hover:border-slate-300' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20 hover:border-white/30'
                  }`}>
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
                      </svg>
                      Transfer
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}
