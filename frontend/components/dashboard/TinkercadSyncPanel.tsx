'use client';

import { useState } from 'react';
import { Thermometer, Wind, AlertTriangle, CheckCircle, Activity, Settings, Zap } from 'lucide-react';
import { useActivityStore } from '@/store';

export function TinkercadSyncPanel() {
  const [temperature, setTemperature] = useState(25);
  const [gasLevel, setGasLevel] = useState(10);
  const [machineFault, setMachineFault] = useState(false);
  const [scenario, setScenario] = useState('Manual Control');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { addActivity } = useActivityStore();

  const syncTelemetry = async (temp: number, gas: number, fault: boolean, scen: string) => {
    setIsSyncing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/sensors/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: temp, gasLevel: gas, machineFault: fault, scenario: scen })
      });
      if (scen !== 'Manual Control' && scen !== scenario) {
        addActivity({
          category: 'simulation',
          message: `Demonstration Scenario Started: ${scen}`,
        });
      }
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePreset = (preset: string) => {
    let t = 25;
    let g = 10;
    let f = false;

    if (preset === 'Normal Operation') {
      t = 25; g = 10; f = false;
    } else if (preset === 'High Temperature') {
      t = 50; g = 20; f = false;
    } else if (preset === 'Critical Temperature') {
      t = 75; g = 30; f = false;
    } else if (preset === 'Machine Fault') {
      t = 30; g = 15; f = true;
    }

    setTemperature(t);
    setGasLevel(g);
    setMachineFault(f);
    setScenario(preset);
    syncTelemetry(t, g, f, preset);
  };

  const applyManual = (temp: number, gas: number, fault: boolean) => {
    setTemperature(temp);
    setGasLevel(gas);
    setMachineFault(fault);
    setScenario('Manual Control');
    syncTelemetry(temp, gas, fault, 'Manual Control');
  };

  return (
    <div className="glass-card p-6 border-l-4 border-l-purple-500 mb-6">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Demonstration Sync Panel
          </h3>
          <p className="text-[#7fa3c4] text-xs tracking-widest uppercase mt-1">
            Current Scenario: <span className="text-purple-400 font-bold">{scenario}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && <Activity className="w-4 h-4 text-cyan-400 animate-spin" />}
          <div className="text-[10px] text-cyan-400 font-mono border border-cyan-500/30 px-2 py-1 rounded bg-cyan-500/10">
            SYNC ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Thermometer className="w-4 h-4 text-blue-400" />
                Temperature (TMP36)
              </label>
              <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-1 rounded text-xs">{temperature}°C</span>
            </div>
            <input 
              type="range" min="0" max="100" value={temperature}
              onChange={(e) => applyManual(Number(e.target.value), gasLevel, machineFault)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Wind className="w-4 h-4 text-emerald-400" />
                Gas Level
              </label>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded text-xs">{gasLevel} ppm</span>
            </div>
            <input 
              type="range" min="0" max="200" value={gasLevel}
              onChange={(e) => applyManual(temperature, Number(e.target.value), machineFault)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10">
            <label className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
              <Settings className="w-4 h-4 text-[#7fa3c4]" />
              Machine Fault Button
            </label>
            <button 
              onClick={() => applyManual(temperature, gasLevel, !machineFault)}
              className={`px-4 py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                machineFault ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {machineFault ? 'FAULT ACTIVE' : 'SYSTEM OK'}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <h4 className="text-[#7fa3c4] text-xs font-bold tracking-widest uppercase mb-4">Demonstration Presets</h4>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handlePreset('Normal Operation')}
              className={`flex items-center gap-3 p-3 rounded border transition-all ${scenario === 'Normal Operation' ? 'bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <CheckCircle className={`w-5 h-5 ${scenario === 'Normal Operation' ? 'text-green-400' : 'text-[#7fa3c4]'}`} />
              <div className="text-left">
                <div className="text-white text-sm font-bold">Normal Operation</div>
                <div className="text-[#7fa3c4] text-[10px]">25°C • 10 ppm • System OK</div>
              </div>
            </button>
            
            <button 
              onClick={() => handlePreset('High Temperature')}
              className={`flex items-center gap-3 p-3 rounded border transition-all ${scenario === 'High Temperature' ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <Thermometer className={`w-5 h-5 ${scenario === 'High Temperature' ? 'text-yellow-400' : 'text-[#7fa3c4]'}`} />
              <div className="text-left">
                <div className="text-white text-sm font-bold">High Temperature Warning</div>
                <div className="text-[#7fa3c4] text-[10px]">50°C • 20 ppm • System OK</div>
              </div>
            </button>

            <button 
              onClick={() => handlePreset('Critical Temperature')}
              className={`flex items-center gap-3 p-3 rounded border transition-all ${scenario === 'Critical Temperature' ? 'bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <Activity className={`w-5 h-5 ${scenario === 'Critical Temperature' ? 'text-red-400' : 'text-[#7fa3c4]'}`} />
              <div className="text-left">
                <div className="text-white text-sm font-bold">Critical Temperature Incident</div>
                <div className="text-[#7fa3c4] text-[10px]">75°C • 30 ppm • System OK</div>
              </div>
            </button>

            <button 
              onClick={() => handlePreset('Machine Fault')}
              className={`flex items-center gap-3 p-3 rounded border transition-all ${scenario === 'Machine Fault' ? 'bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <AlertTriangle className={`w-5 h-5 ${scenario === 'Machine Fault' ? 'text-red-400' : 'text-[#7fa3c4]'}`} />
              <div className="text-left">
                <div className="text-white text-sm font-bold">Machine Fault Simulation</div>
                <div className="text-[#7fa3c4] text-[10px]">30°C • 15 ppm • Fault Active</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
