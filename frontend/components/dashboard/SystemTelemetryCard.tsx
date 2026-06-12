'use client';

import { useLiveSensorStore } from '@/store';
import { Cpu, Wifi, Clock, Activity } from 'lucide-react';

export function SystemTelemetryCard() {
  const { data, isConnected } = useLiveSensorStore();

  const formattedTime = data?.timestamp 
    ? new Date(data.timestamp).toLocaleTimeString() 
    : 'Waiting for first tick';

  return (
    <div className="glass-card p-6 border-l-4 border-l-cyan-500 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            System Telemetry Status
          </h3>
          <p className="text-[#7fa3c4] text-xs tracking-widest uppercase mt-1">
            Status: <span className="text-green-400 font-bold">Automated Telemetry Active</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />}
          <div className="text-[10px] text-green-400 font-mono border border-green-500/30 px-2 py-1 rounded bg-green-500/10 flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            LIVE DATA CONNECTED
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
          <span className="text-[#7fa3c4] text-xs font-bold uppercase tracking-wider">Telemetry Source</span>
          <span className="text-white text-sm font-mono font-bold bg-cyan-500/15 px-2.5 py-1 rounded border border-cyan-500/30 text-cyan-400">
            Automated Simulation
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
          <span className="text-[#7fa3c4] text-xs font-bold uppercase tracking-wider">Connection Status</span>
          <span className="text-green-400 text-sm font-mono font-bold">
            Live Data Connected
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
          <span className="text-[#7fa3c4] text-xs font-bold uppercase tracking-wider">Update Frequency</span>
          <span className="text-white text-sm font-mono font-bold text-cyan-400">
            1 Hz
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
          <span className="text-[#7fa3c4] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#7fa3c4]" />
            Last Telemetry Update
          </span>
          <span className="text-white text-sm font-mono font-bold">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
