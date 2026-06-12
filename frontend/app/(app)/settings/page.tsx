'use client';

import { RotateCcw, Settings, ShieldCheck, Trash2 } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';

export default function SettingsPage() {
  const resetSimulation = useSimulationDomainStore((state) => state.resetSimulation);
  const clearOperationalHistory = useSimulationDomainStore((state) => state.clearOperationalHistory);
  const isConnected = useSimulationDomainStore((state) => state.isConnected);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Settings</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Simulation environment configuration and local data controls</p>
      </div>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 text-white text-sm font-semibold mb-5"><Settings className="w-4 h-4 text-cyan-400" />Environment</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SettingValue label="Operating Mode" value="Simulation Environment" />
          <SettingValue label="Telemetry Interval" value="1 second" />
          <SettingValue label="Domain Status" value={isConnected ? 'Connected' : 'Offline'} />
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 text-white text-sm font-semibold mb-3"><ShieldCheck className="w-4 h-4 text-green-400" />Academic Demonstration Scope</div>
        <p className="text-[#7fa3c4] text-sm leading-relaxed">All telemetry, alerts, incidents, camera detections, and delivery records are generated locally for academic demonstration. No real plant equipment or external notification service is contacted.</p>
      </section>

      <section className="glass-card p-5">
        <h2 className="text-white text-sm font-semibold mb-4">Data Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={resetSimulation} className="action-button text-cyan-400 border-cyan-400/30 flex items-center gap-2"><RotateCcw className="w-4 h-4" />Reset Current Scenario</button>
          <button onClick={clearOperationalHistory} className="action-button text-red-400 border-red-400/30 flex items-center gap-2"><Trash2 className="w-4 h-4" />Clear Local History</button>
        </div>
      </section>
    </div>
  );
}

function SettingValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)] p-4">
      <div className="text-[#587996] text-[10px] uppercase">{label}</div>
      <div className="text-white text-sm font-mono mt-2">{value}</div>
    </div>
  );
}
