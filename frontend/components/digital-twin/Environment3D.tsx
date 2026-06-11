'use client';

import { useSimulationStore } from '@/store';

export function Environment3D() {
  const { activeScenario } = useSimulationStore();

  // Determine status colors based on active scenario
  const hazardStatus = activeScenario === 'gas_leak' ? 'critical' : 'safe';
  const machineAStatus = activeScenario === 'high_temperature' ? 'warning' : 'safe';
  const machineBStatus = activeScenario === 'machine_fault' ? 'critical' : 'safe';
  const sensorAreaStatus = 'safe'; // Remains safe in these scenarios

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'warning': return 'bg-amber-500/20 border-amber-500 text-amber-400';
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400 animate-pulse';
    }
  };

  return (
    <div className="w-full h-[600px] bg-[#010a14] rounded-2xl relative border border-[rgba(0,212,255,0.1)] p-8">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <div className="text-cyan-400 font-mono text-xs tracking-[0.3em] flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/20">
          AEGIS 2D DIGITAL TWIN v2.0
        </div>
      </div>
      
      <div className="w-full h-full border-2 border-dashed border-[#3a5a7a] rounded-xl p-8 grid grid-cols-2 grid-rows-2 gap-8 relative mt-8">
        {/* Machine A */}
        <div className={`rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-300 ${getStatusColor(machineAStatus)}`}>
          <div className="text-2xl font-bold font-display tracking-widest mb-2">Machine A</div>
          <div className="text-xs uppercase tracking-widest opacity-80 font-mono">{machineAStatus}</div>
        </div>

        {/* Hazard Zone */}
        <div className={`rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-300 ${getStatusColor(hazardStatus)}`}>
          <div className="text-2xl font-bold font-display tracking-widest mb-2">Hazard Zone</div>
          <div className="text-xs uppercase tracking-widest opacity-80 font-mono">{hazardStatus}</div>
        </div>

        {/* Machine B */}
        <div className={`rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-300 ${getStatusColor(machineBStatus)}`}>
          <div className="text-2xl font-bold font-display tracking-widest mb-2">Machine B</div>
          <div className="text-xs uppercase tracking-widest opacity-80 font-mono">{machineBStatus}</div>
        </div>

        {/* Sensor Area */}
        <div className={`rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-300 ${getStatusColor(sensorAreaStatus)}`}>
          <div className="text-2xl font-bold font-display tracking-widest mb-2">Sensor Area</div>
          <div className="text-xs uppercase tracking-widest opacity-80 font-mono">{sensorAreaStatus}</div>
        </div>
      </div>
    </div>
  );
}
