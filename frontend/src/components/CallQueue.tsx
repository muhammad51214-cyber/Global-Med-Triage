import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Call {
  id: string;
  callerName: string;
  phoneNumber: string;
  language: string;
  location: string;
  urgency: 'low' | 'medium' | 'critical';
  timestamp: Date;
  status: 'incoming' | 'active' | 'completed' | 'queued';
  transcription: string;
  translation: string;
  panicDetected: boolean;
  esiLevel: number;
  vitals: {
    stressLevel: number;
    heartRate: number;
  };
  waitTime: number;
}

interface CallQueueProps {
  onCallSelect: (call: Call) => void;
}

export default function CallQueue({ onCallSelect }: CallQueueProps) {
  const { theme } = useTheme();
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'medium' | 'low'>('all');

  useEffect(() => {
    // Simulate queued calls
    const mockCalls: Call[] = [
      {
        id: '3',
        callerName: 'Yuki Tanaka',
        phoneNumber: '+1-555-0789',
        language: 'Japanese',
        location: 'Central Park District',
        urgency: 'critical',
        timestamp: new Date(Date.now() - 120000),
        status: 'queued',
        transcription: '助けて！交通事故です！',
        translation: 'Help! There\'s a traffic accident!',
        panicDetected: true,
        esiLevel: 1,
        vitals: { stressLevel: 98, heartRate: 140 },
        waitTime: 2
      },
      {
        id: '4',
        callerName: 'Elena Petrov',
        phoneNumber: '+1-555-0321',
        language: 'Russian',
        location: 'Northside Hospital',
        urgency: 'medium',
        timestamp: new Date(Date.now() - 180000),
        status: 'queued',
        transcription: 'Мне нужна скорая помощь, у меня сильная боль в животе',
        translation: 'I need an ambulance, I have severe abdominal pain',
        panicDetected: false,
        esiLevel: 3,
        vitals: { stressLevel: 75, heartRate: 100 },
        waitTime: 3
      },
      {
        id: '5',
        callerName: 'Chen Wei',
        phoneNumber: '+1-555-0654',
        language: 'Mandarin',
        location: 'Eastside Mall',
        urgency: 'low',
        timestamp: new Date(Date.now() - 240000),
        status: 'queued',
        transcription: '我的脚扭伤了，需要医疗帮助',
        translation: 'I sprained my ankle and need medical help',
        panicDetected: false,
        esiLevel: 5,
        vitals: { stressLevel: 45, heartRate: 80 },
        waitTime: 4
      }
    ];
    setCalls(mockCalls);
  }, []);

  const filteredCalls = calls.filter(call => 
    filter === 'all' || call.urgency === filter
  );

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

  const formatWaitTime = (minutes: number) => {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-white text-lg">⏳</span>
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>Call Queue</h2>
            <p className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>Manage waiting emergency calls</p>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className={`flex items-center gap-2 backdrop-blur-md rounded-xl p-1 border transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-slate-100 border-slate-200' 
            : 'bg-white/10 border-white/20'
        }`}>
          {(['all', 'critical', 'medium', 'low'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterType
                  ? theme === 'light' 
                    ? 'bg-blue-100 text-blue-700 shadow-lg' 
                    : 'bg-white/20 text-white shadow-lg'
                  : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`backdrop-blur-md border rounded-xl p-4 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-sm">🚨</span>
            </div>
            <div>
              <div className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{calls.filter(c => c.urgency === 'critical').length}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Critical Priority</div>
            </div>
          </div>
        </div>
        
        <div className={`backdrop-blur-md border rounded-xl p-4 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div>
              <div className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{calls.filter(c => c.urgency === 'medium').length}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Medium Priority</div>
            </div>
          </div>
        </div>
        
        <div className={`backdrop-blur-md border rounded-xl p-4 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white text-sm">✅</span>
            </div>
            <div>
              <div className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{calls.filter(c => c.urgency === 'low').length}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Low Priority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white/80 border-slate-200 shadow-lg' 
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm">📋</span>
          </div>
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>Waiting Calls</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>{filteredCalls.length} calls</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <div className={`h-16 w-16 rounded-full backdrop-blur-md border flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                theme === 'light' 
                  ? 'bg-white/80 border-slate-200 shadow-lg' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <span className="text-3xl">📞</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>No calls in queue</h3>
              <p className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>All emergency calls have been handled</p>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div key={call.id} className={`border rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 animate-[slideIn_300ms_ease-out] shadow-lg ${
                theme === 'light' 
                  ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {call.callerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`font-semibold transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-800' : 'text-white'
                        }`}>{call.callerName}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-slate-600' : 'text-white/70'
                        }`}>{call.phoneNumber}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(call.urgency)}`}>
                        {call.urgency.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <span className="text-sm">⏱️</span>
                        <span className="text-sm font-medium">{formatWaitTime(call.waitTime)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onCallSelect(call)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:from-emerald-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Take Call
                    </button>
                          <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            theme === 'light' 
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800' 
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}>
                            Transfer
                          </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}
