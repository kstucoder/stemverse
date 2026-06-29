import { useState } from 'react';
import { Plug, PlugZap, Loader2 } from 'lucide-react';
import useSerial from '../hooks/useSerial';

export default function SerialConnector({ onData, compact = false }) {
  const { connected, connect, disconnect, setOnDataCallback } = useSerial();
  const [connecting, setConnecting] = useState(false);
  if (onData) setOnDataCallback(onData);

  const handleConnect = async () => { setConnecting(true); await connect(); setConnecting(false); };
  const handleDisconnect = async () => { await disconnect(); };

  if (compact) {
    return (
      <button
        onClick={connected ? handleDisconnect : handleConnect}
        disabled={connecting}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          connected
            ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
            : 'bg-dark-700 text-dark-300 border border-dark-600 hover:bg-dark-600 hover:text-white'
        }`}
      >
        {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : connected ? <PlugZap className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
        {connecting ? 'Ulanish...' : connected ? 'Uzish' : 'Ulanish'}
      </button>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${connected ? 'bg-neon-green/10 border-neon-green/30' : 'bg-dark-800/50 border-dark-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connected ? 'bg-neon-green/20' : 'bg-dark-700'}`}>
            {connected ? <PlugZap className="w-5 h-5 text-neon-green" /> : <Plug className="w-5 h-5 text-dark-400" />}
          </div>
          <div>
            <h3 className="font-semibold text-white">{connected ? 'Qurilma ulandi' : 'Arduino\'ni ulash'}</h3>
            <p className="text-xs text-dark-400">{connected ? 'Real-time ma\'lumotlar olinmoqda' : 'Web Serial orqali ulaning'}</p>
          </div>
        </div>
        <button
          onClick={connected ? handleDisconnect : handleConnect}
          disabled={connecting}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            connected
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'btn-primary text-sm py-2'
          }`}
        >
          {connecting ? 'Ulanish...' : connected ? 'Uzish' : 'Ulanish'}
        </button>
      </div>
    </div>
  );
}
