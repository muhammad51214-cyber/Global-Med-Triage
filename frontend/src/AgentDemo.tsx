import React, { useState, useRef } from 'react';
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

  // Send recorded audio to backend via WebSocket
  const sendAudio = () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.onload = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ audio: reader.result }));
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Expecting a structured EmergencyFlowResult from backend
          setResponses(data);
          setStatus('Response received.');
          setError('');
          ws.close();
        } catch (e) {
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
    reader.onerror = () => {
      setStatus('');
      setError('Error reading audio data.');
    };
    reader.readAsDataURL(audioBlob);
  };

  // Render agent responses in a structured, user-friendly way
  const renderResponses = (resp: EmergencyFlowResult) => (
    <div className="w-full bg-gray-50 rounded p-4 mt-4 shadow">
      <h2 className="font-bold text-lg mb-2">Agent Responses</h2>
      <div className="mb-2"><b>Transcription:</b> {resp.voice.text} <span className="ml-2 text-xs text-gray-500">({resp.voice.language})</span></div>
      <div className="mb-2"><b>Panic Detected:</b> {resp.voice.panic ? 'Yes' : 'No'}</div>
      <div className="mb-2"><b>ESI Level:</b> {resp.triage.esi_level} <span className="ml-2 text-xs text-gray-500">({resp.triage.analysis})</span></div>
      <div className="mb-2"><b>Translation:</b> {resp.translation}</div>
      <div className="mb-2"><b>Medical History:</b> {resp.history.history}</div>
      <div className="mb-2"><b>Vitals:</b> Stress: {resp.vitals.stress_level}, Heart Rate: {resp.vitals.heart_rate}</div>
      <div className="mb-2"><b>Dispatch:</b> {resp.dispatch.status} to {resp.dispatch.location}</div>
      <div className="mb-2"><b>Insurance:</b> {resp.insurance.verified ? 'Verified' : 'Not Verified'} ({resp.insurance.provider})</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <button
        className={`px-6 py-2 rounded text-white font-bold ${recording ? 'bg-red-500' : 'bg-blue-600'} transition`}
        onClick={recording ? stopRecording : startRecording}
        disabled={status === 'Sending audio...'}
      >
        {recording ? 'Stop Recording' : 'Record Emergency'}
      </button>
      {status && <div className="text-gray-700">{status}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {responses && renderResponses(responses)}
    </div>
  );
}
