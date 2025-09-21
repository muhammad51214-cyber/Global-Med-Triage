import React, { useState, useRef } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { EmergencyFlowResult } from './types';

declare global {
  interface ImportMeta {
    env: {
      VITE_WS_URL?: string;
      [key: string]: any;
    };
  }
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/triage';

export default function AgentDemo() {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(false);
  const [responses, setResponses] = useState<EmergencyFlowResult | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Start recording audio from user's microphone
  const startRecording = async () => {
    setResponses(null);
    setStatus('Recording...');
    setError('');
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        setStatus('Sending audio...');
        stream.getTracks().forEach(track => track.stop()); // Clean up
        sendAudio();
      };
      mediaRecorder.start();
    } catch (err) {
      setStatus('');
      setError('Microphone access denied or unavailable.');
      setRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // // Send recorded audio to backend via WebSocket
  // const sendAudio = () => {
  //   const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const ws = new WebSocket(WS_URL);
  //     wsRef.current = ws;
  //     ws.onopen = () => {
  //       console.log("Sending audio:", reader.result?.slice(0, 100)); // just preview first 100 chars
  //       ws.send(JSON.stringify({ audio: reader.result }));
  //     };
  //     ws.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);
  //         // Expecting a structured EmergencyFlowResult from backend
  //         setResponses(data);
  //         setStatus('Response received.');
  //         setError('');
  //         ws.close();
  //       } catch (e) {
  //         setStatus('');
  //         setError('Error parsing response.');
  //         ws.close();
  //       }
  //     };
  //     ws.onerror = () => {
  //       setStatus('');
  //       setError('WebSocket error.');
  //       ws.close();
  //     };
  //   };
  //   reader.onerror = () => {
  //     setStatus('');
  //     setError('Error reading audio data.');
  //   };
  //   reader.readAsDataURL(audioBlob);
  // };


  const sendAudio = () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer"; // important!
  
    ws.onopen = () => {
      audioBlob.arrayBuffer().then(buffer => {
        ws.send(buffer);  // send raw bytes
      });
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setResponses(data);
        setStatus('Response received.');
        setError('');
        ws.close();
      } catch {
        setStatus('');
        setError('Error parsing response.');
        ws.close();
      }
    };
  
    ws.onerror = () => {
      setStatus('');
      setError('WebSocket error.');
      ws.close();
    };
  };
  

  // Render agent responses in a structured, user-friendly way
  // const renderResponses = (resp: EmergencyFlowResult) => (
  //   <div className="w-full bg-gray-50 rounded p-4 mt-4 shadow">
  //     <h2 className="font-bold text-lg mb-2">Agent Responses</h2>
  //     <div className="mb-2"><b>Transcription:</b> {resp.voice.text} <span className="ml-2 text-xs text-gray-500">({resp.voice.language})</span></div>
  //     <div className="mb-2"><b>Panic Detected:</b> {resp.voice.panic ? 'Yes' : 'No'}</div>
  //     <div className="mb-2"><b>ESI Level:</b> {resp.triage.esi_level} <span className="ml-2 text-xs text-gray-500">({resp.triage.analysis})</span></div>
  //     <div className="mb-2"><b>Translation:</b> {resp.translation}</div>
  //     <div className="mb-2"><b>Medical History:</b> {resp.history.history}</div>
  //     <div className="mb-2"><b>Vitals:</b> Stress: {resp.vitals.stress_level}, Heart Rate: {resp.vitals.heart_rate}</div>
  //     <div className="mb-2"><b>Dispatch:</b> {resp.dispatch.status} to {resp.dispatch.location}</div>
  //     <div className="mb-2"><b>Insurance:</b> {resp.insurance.verified ? 'Verified' : 'Not Verified'} ({resp.insurance.provider})</div>
  //   </div>
  // );

  // Render agent responses in a structured, user-friendly way
const renderResponses = (resp: EmergencyFlowResult | any) => {
  const { theme } = useTheme();
  
  if (resp.error) {
    return (
      <div className={`w-full rounded p-4 mt-4 shadow transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-red-100 text-red-800' 
          : 'bg-red-500/20 text-red-300'
      }`}>
        <b>Error:</b> {resp.error}
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl mt-4 p-5 sm:p-6 border backdrop-blur-xl shadow-xl transition-all duration-300 animate-[fadeIn_400ms_ease-out] hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] ${
      theme === 'light' 
        ? 'bg-white/80 border-slate-200 text-slate-800' 
        : 'bg-white/10 border-white/20 text-slate-100'
    }`}>
      <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 text-white">🧠</span>
        Agent Responses
      </h2>

      <div className="space-y-3 text-sm sm:text-base">
        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">🗣️</span>
          <div>
            <div className="font-medium">Transcription</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.voice?.text || "N/A"}
              <span className={`ml-2 align-middle text-xs transition-colors duration-300 ${
                theme === 'light' ? 'text-blue-600/80' : 'text-blue-100/80'
              }`}>({resp.voice?.language || "unknown"})</span>
            </div>
          </div>
        </div>

        <div className={`h-px w-full transition-colors duration-300 ${
          theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
        }`} />

        <div className="flex items-center gap-2">
          <span className="opacity-80">🚨</span>
          <div className="font-medium">Panic Detected:</div>
          <div className={`transition-colors duration-300 ${
            resp.voice?.panic 
              ? theme === 'light' ? 'text-rose-600' : 'text-rose-300'
              : theme === 'light' ? 'text-emerald-600' : 'text-emerald-300'
          }`}>{resp.voice?.panic ? 'Yes' : 'No'}</div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">📊</span>
          <div>
            <div className="font-medium">ESI Level</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.triage?.esi_level || 'N/A'}
              <span className={`ml-2 text-xs transition-colors duration-300 ${
                theme === 'light' ? 'text-blue-600/80' : 'text-blue-100/80'
              }`}>({resp.triage?.analysis || 'N/A'})</span>
            </div>
          </div>
        </div>

        <div className={`h-px w-full transition-colors duration-300 ${
          theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
        }`} />

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">🌐</span>
          <div>
            <div className="font-medium">Translation</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.translation || 'N/A'}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">📒</span>
          <div>
            <div className="font-medium">Medical History</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.history?.history || 'N/A'}</div>
          </div>
        </div>

        <div className={`h-px w-full transition-colors duration-300 ${
          theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
        }`} />

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">❤️‍🔥</span>
          <div>
            <div className="font-medium">Vitals</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>Stress: {resp.vitals?.stress_level ?? 'N/A'}, Heart Rate: {resp.vitals?.heart_rate ?? 'N/A'}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">🚑</span>
          <div>
            <div className="font-medium">Dispatch</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.dispatch?.status || 'N/A'} to {resp.dispatch?.location || 'N/A'}</div>
          </div>
        </div>

        <div className={`h-px w-full transition-colors duration-300 ${
          theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
        }`} />

        <div className="flex flex-wrap items-start gap-2">
          <span className="opacity-80">🛡️</span>
          <div>
            <div className="font-medium">Insurance</div>
            <div className={`transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'opacity-90'
            }`}>{resp.insurance?.verified ? 'Verified' : 'Not Verified'} ({resp.insurance?.provider || 'N/A'})</div>
          </div>
        </div>
      </div>
    </div>
  );
};


  return (
    <div className="flex flex-col items-center gap-5 mt-6">
      <div className="flex items-center gap-3">
      <button
          className={`group relative inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ${
            recording
              ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:to-red-400'
              : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:to-indigo-400'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        onClick={recording ? stopRecording : startRecording}
        disabled={status === 'Sending audio...'}
      >
          {/* 3D mic icon */}
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md shadow-inner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
            >
              <defs>
                <linearGradient id="micBtnGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
              <path d="M8 7a4 4 0 1 1 8 0v4a4 4 0 1 1-8 0V7Z" stroke="url(#micBtnGrad)" strokeWidth="1.8" fill="rgba(255,255,255,0.15)" />
              <path d="M5 11a7 7 0 0 0 14 0" stroke="url(#micBtnGrad)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 18v3" stroke="url(#micBtnGrad)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {recording && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-400 animate-ping" />
            )}
          </span>
          <span>{recording ? 'Stop Recording' : 'Record Emergency'}</span>
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_1px_6px_rgba(255,255,255,0.35)]" />
      </button>
        {recording && (
          <span className="inline-flex items-center gap-2 text-rose-200 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
            Recording...
          </span>
        )}
      </div>

      {status && (
        <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur border transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-slate-100 text-slate-700 border-slate-200' 
            : 'bg-white/10 text-slate-100 border-white/20'
        }`}>
          {status}
        </div>
      )}
    {error && (
      <div className={`px-3 py-2 rounded-lg text-sm font-medium border shadow transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-rose-50/90 text-rose-700 border-rose-200' 
          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      }`}>
        {error}
      </div>
    )}
      {responses && (
        <div className="w-full animate-[fadeIn_400ms_ease-out]">
          {renderResponses(responses)}
        </div>
      )}

      {/* Keyframes for fadeIn */}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
