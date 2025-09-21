import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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

interface ActiveCallInterfaceProps {
  call: Call | null;
  onCallEnd: () => void;
}

export default function ActiveCallInterface({ call, onCallEnd }: ActiveCallInterfaceProps) {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranslation, setLiveTranslation] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [dispatcherActions, setDispatcherActions] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (call) {
      setCallDuration(0);
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [call]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyResponse = (type: 'ambulance' | 'police' | 'fire') => {
    const action = `Dispatched ${type} to ${call?.location}`;
    setDispatcherActions(prev => [...prev, action]);
  };

  const handleSendMessage = (message: string) => {
    const action = `Sent message: "${message}"`;
    setDispatcherActions(prev => [...prev, action]);
  };

  if (!call) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className={`h-20 w-20 rounded-full backdrop-blur-md border flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-200 shadow-lg' 
              : 'bg-white/10 border-white/20'
          }`}>
            <span className="text-4xl">📞</span>
          </div>
          <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>No Active Call</h3>
          <p className={`transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>Accept a call from the dashboard to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Call Header */}
      <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white/80 border-slate-200 shadow-lg' 
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {call.callerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 flex items-center justify-center ${
                theme === 'light' ? 'border-white' : 'border-slate-900'
              }`}>
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{call.callerName}</h2>
              <p className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>{call.phoneNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/70'
                }`}>Duration:</span>
                <span className="text-sm font-mono text-emerald-400">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onCallEnd}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-400 hover:to-pink-400 transition-all duration-200 shadow-lg"
          >
            End Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Translation Feed */}
        <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm">🌐</span>
            </div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>Live Translation</h3>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Active</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`border rounded-lg p-4 transition-colors duration-300 ${
              theme === 'light' 
                ? 'bg-slate-50 border-slate-200' 
                : 'bg-white/5 border-white/10'
            }`}>
              <div className={`text-sm mb-2 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Original ({call.language})</div>
              <div className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white/90'
              }`}>{call.transcription}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="text-sm text-emerald-400 mb-2">English Translation</div>
              <div className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{call.translation}</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-sm text-blue-400 mb-2">Live Feed</div>
              <div className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{liveTranslation || 'Waiting for caller response...'}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-400'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button
              onClick={() => handleSendMessage('Please stay calm, help is on the way')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-all duration-200"
            >
              Send Message
            </button>
          </div>
        </div>

        {/* Call Details & Actions */}
        <div className="space-y-6">
          {/* Call Information */}
          <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-200 shadow-lg' 
              : 'bg-white/5 border-white/10'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>
              <span>📋</span>
              Call Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/70'
                }`}>Location:</span>
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>{call.location}</span>
              </div>
              <div className="flex justify-between">
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/70'
                }`}>Urgency:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  call.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                  call.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {call.urgency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/70'
                }`}>ESI Level:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  call.esiLevel <= 2 ? 'bg-red-500/20 text-red-400' :
                  call.esiLevel <= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  Level {call.esiLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/70'
                }`}>Panic Detected:</span>
                <span className={call.panicDetected ? 'text-red-400' : 'text-green-400'}>
                  {call.panicDetected ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Response Actions */}
          <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-200 shadow-lg' 
              : 'bg-white/5 border-white/10'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>
              <span>🚑</span>
              Emergency Response
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleEmergencyResponse('ambulance')}
                className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200"
              >
                <span className="text-2xl">🚑</span>
                <div className="text-left">
                  <div className={`font-medium transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>Dispatch Ambulance</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>Medical emergency response</div>
                </div>
              </button>
              <button
                onClick={() => handleEmergencyResponse('police')}
                className="flex items-center gap-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
              >
                <span className="text-2xl">👮</span>
                <div className="text-left">
                  <div className={`font-medium transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>Dispatch Police</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>Law enforcement response</div>
                </div>
              </button>
              <button
                onClick={() => handleEmergencyResponse('fire')}
                className="flex items-center gap-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all duration-200"
              >
                <span className="text-2xl">🚒</span>
                <div className="text-left">
                  <div className={`font-medium transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>Dispatch Fire Department</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>Fire and rescue response</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatcher Actions Log */}
      {dispatcherActions.length > 0 && (
        <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            <span>📝</span>
            Actions Taken
          </h3>
          <div className="space-y-2">
            {dispatcherActions.map((action, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-300 ${
                theme === 'light' 
                  ? 'bg-slate-50 border border-slate-200' 
                  : 'bg-white/5'
              }`}>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className={`transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-700' : 'text-white/90'
                }`}>{action}</span>
                <span className={`ml-auto text-sm transition-colors duration-300 ${
                  theme === 'light' ? 'text-slate-500' : 'text-white/50'
                }`}>
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
