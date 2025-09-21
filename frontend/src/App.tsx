import React from 'react';
import AgentDemo from './AgentDemo';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">GlobalMedTriage</h1>
      <p className="mb-8 text-lg text-blue-800">Multilingual Emergency Response – Voice-First Demo</p>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <p className="text-gray-700">🎤 <b>Record your emergency scenario</b> to see real-time agent responses.</p>
        <AgentDemo />
      </div>
    </div>
  );
}

export default App;
