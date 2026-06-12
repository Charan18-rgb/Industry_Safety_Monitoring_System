'use client';

import { useMemo } from 'react';
import { useLiveSensorStore, useAlertStore, useIncidentStore, useNotificationStore } from '@/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { Activity, Thermometer, Wind, AlertTriangle, ShieldCheck, Wifi, WifiOff, Clock, Mail, Bell } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-cyan-500/30 text-xs">
        <p className="font-bold text-white mb-2">{label}</p>
        <p className="text-blue-400">Temp: {dataPoint.temperature?.toFixed(1) || '--'}°C</p>
        <p className="text-emerald-400">Gas: {dataPoint.gasLevel?.toFixed(1) || '--'} ppm</p>
        {dataPoint.machineFault && <p className="text-red-400 font-bold mt-1">Machine Fault: YES</p>}
        
        {dataPoint.events && dataPoint.events.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="font-bold text-purple-400 mb-1">Triggered Events:</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {dataPoint.events.map((e: any, i: number) => (
              <div key={i} className="flex flex-col mb-1">
                <span className={`font-bold ${e.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>[{e.type}]</span>
                <span className="text-white/70 text-[10px]">{e.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function SensorHistoryPanel() {
  const { data, history, events, isConnected } = useLiveSensorStore();
  const { alerts } = useAlertStore();
  const { incidents } = useIncidentStore();
  const { emailsSent, whatsappSent } = useNotificationStore();

  const chartData = useMemo(() => {
    return history.map(d => {
      // Find events matching this exact timestamp
      const matchedEvents = events.filter(e => e.timestamp === d.timestamp);
      return {
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        events: matchedEvents.length > 0 ? matchedEvents : null,
      };
    });
  }, [history, events]);

  const stats = useMemo(() => {
    if (history.length === 0) return { tempMin: 0, tempMax: 0, tempAvg: 0, gasMin: 0, gasMax: 0, gasAvg: 0 };
    const temps = history.map(h => h.temperature);
    const gases = history.map(h => h.gasLevel);
    return {
      tempMin: Math.min(...temps).toFixed(1),
      tempMax: Math.max(...temps).toFixed(1),
      tempAvg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      gasMin: Math.min(...gases).toFixed(1),
      gasMax: Math.max(...gases).toFixed(1),
      gasAvg: (gases.reduce((a, b) => a + b, 0) / gases.length).toFixed(1),
    };
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Sensor Health Summary Card */}
      <div className="glass-card p-4 border-l-4 border-l-cyan-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Sensor Health Summary</h3>
            <div className="text-[#7fa3c4] text-xs font-mono flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              Last Update: {data ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-[#7fa3c4] text-[10px] font-bold tracking-wider mb-1">TEMPERATURE</div>
            <div className="text-lg font-mono font-bold text-white">{data ? `${data.temperature.toFixed(1)}°C` : '--'}</div>
          </div>
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-[#7fa3c4] text-[10px] font-bold tracking-wider mb-1">GAS LEVEL</div>
            <div className="text-lg font-mono font-bold text-white">{data ? `${data.gasLevel.toFixed(1)} ppm` : '--'}</div>
          </div>
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-[#7fa3c4] text-[10px] font-bold tracking-wider mb-1">MACHINE STATUS</div>
            <div className={`text-sm font-bold mt-1 px-2 py-0.5 rounded ${data?.machineFault ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {data ? (data.machineFault ? 'FAULT' : 'OK') : '--'}
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-[#7fa3c4] text-[10px] font-bold tracking-wider mb-1">CONNECTION</div>
            <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'LIVE DATA CONNECTED' : 'SIMULATION MODE'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Analytics Statistics Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h4 className="text-white text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Thermometer className="w-4 h-4 text-blue-400" />
              Temp Stats (Last 100)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div className="bg-white/5 p-2 rounded"><span className="text-[#7fa3c4] text-[10px] block">MIN</span><span className="text-white">{stats.tempMin}°C</span></div>
              <div className="bg-white/5 p-2 rounded"><span className="text-[#7fa3c4] text-[10px] block">MAX</span><span className="text-white">{stats.tempMax}°C</span></div>
              <div className="bg-white/5 p-2 rounded col-span-2"><span className="text-[#7fa3c4] text-[10px] block">AVERAGE</span><span className="text-white">{stats.tempAvg}°C</span></div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-white text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Wind className="w-4 h-4 text-emerald-400" />
              Gas Stats (Last 100)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div className="bg-white/5 p-2 rounded"><span className="text-[#7fa3c4] text-[10px] block">MIN</span><span className="text-white">{stats.gasMin}</span></div>
              <div className="bg-white/5 p-2 rounded"><span className="text-[#7fa3c4] text-[10px] block">MAX</span><span className="text-white">{stats.gasMax}</span></div>
              <div className="bg-white/5 p-2 rounded col-span-2"><span className="text-[#7fa3c4] text-[10px] block">AVERAGE</span><span className="text-white">{stats.gasAvg}</span></div>
            </div>
          </div>

          <div className="glass-card p-4 border-t-2 border-t-purple-500">
            <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> System Totals
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7fa3c4] flex items-center gap-1"><Bell className="w-3 h-3"/> Alerts Triggered</span>
                <span className="font-mono text-white font-bold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7fa3c4] flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Incidents</span>
                <span className="font-mono text-white font-bold">{incidents.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7fa3c4] flex items-center gap-1"><Mail className="w-3 h-3"/> Emails Sent</span>
                <span className="font-mono text-white font-bold">{emailsSent}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7fa3c4] flex items-center gap-1"><Activity className="w-3 h-3"/> WhatsApps</span>
                <span className="font-mono text-white font-bold">{whatsappSent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Temperature Chart */}
          <div className="glass-card p-4 relative">
            <h4 className="text-white text-sm font-bold mb-4 font-mono">TEMPERATURE TREND</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#3a5a7a" fontSize={10} tickFormatter={(v) => v.substring(0,5)} />
                  <YAxis stroke="#3a5a7a" fontSize={10} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Threshold Zones */}
                  <ReferenceArea y1={0} y2={40} fill="#00ff88" fillOpacity={0.05} />
                  <ReferenceArea y1={41} y2={60} fill="#ffb800" fillOpacity={0.05} />
                  <ReferenceArea y1={61} y2={100} fill="#ff3355" fillOpacity={0.05} />
                  
                  {/* Event Markers */}
                  {chartData.filter(d => d.events && d.events.length > 0).map((d, i) => (
                    <ReferenceLine key={i} x={d.time} stroke="#a855f7" strokeDasharray="3 3" />
                  ))}

                  <Area type="monotone" dataKey="temperature" stroke="#3b82f6" fill="url(#colorTemp)" strokeWidth={2} isAnimationActive={false} />
                  
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gas Level Chart */}
          <div className="glass-card p-4 relative">
            <h4 className="text-white text-sm font-bold mb-4 font-mono">GAS LEVEL TREND</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#3a5a7a" fontSize={10} tickFormatter={(v) => v.substring(0,5)} />
                  <YAxis stroke="#3a5a7a" fontSize={10} domain={[0, 150]} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Threshold Zones */}
                  <ReferenceArea y1={0} y2={40} fill="#00ff88" fillOpacity={0.05} />
                  <ReferenceArea y1={41} y2={80} fill="#ffb800" fillOpacity={0.05} />
                  <ReferenceArea y1={81} y2={150} fill="#ff3355" fillOpacity={0.05} />
                  
                  {/* Event Markers */}
                  {chartData.filter(d => d.events && d.events.length > 0).map((d, i) => (
                    <ReferenceLine key={i} x={d.time} stroke="#a855f7" strokeDasharray="3 3" />
                  ))}

                  <Area type="monotone" dataKey="gasLevel" stroke="#10b981" fill="url(#colorGas)" strokeWidth={2} isAnimationActive={false} />
                  
                  <defs>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Machine Fault Timeline */}
          <div className="glass-card p-4 relative">
            <h4 className="text-white text-sm font-bold mb-4 font-mono">MACHINE FAULT TIMELINE</h4>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#3a5a7a" fontSize={10} tickFormatter={(v) => v.substring(0,5)} />
                  <YAxis stroke="#3a5a7a" fontSize={10} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => v === 1 ? 'FAULT' : 'OK'} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Event Markers */}
                  {chartData.filter(d => d.events && d.events.length > 0).map((d, i) => (
                    <ReferenceLine key={i} x={d.time} stroke="#a855f7" strokeDasharray="3 3" />
                  ))}

                  <Area type="step" dataKey={(d) => d.machineFault ? 1 : 0} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
