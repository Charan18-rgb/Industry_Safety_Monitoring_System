'use client';

import { Activity, Box, Gauge, MapPin } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';

const ZONES = [
  { name: 'Processing Zone', equipment: 'Reactor A', sensorType: 'temperature', x: '8%', y: '12%', width: '39%', height: '35%' },
  { name: 'Hazard Zone', equipment: 'Gas Manifold', sensorType: 'gas', x: '53%', y: '12%', width: '39%', height: '35%' },
  { name: 'Storage Zone', equipment: 'Material Storage', sensorType: 'humidity', x: '8%', y: '54%', width: '25%', height: '34%' },
  { name: 'Compressor Zone', equipment: 'Compressor P1', sensorType: 'pressure', x: '38%', y: '54%', width: '25%', height: '34%' },
  { name: 'Machine Zone', equipment: 'Motor V1', sensorType: 'vibration', x: '68%', y: '54%', width: '24%', height: '34%' },
] as const;

export default function SimulatedPlantLayoutPage() {
  const telemetry = useSimulationDomainStore((state) => state.telemetry);
  const alerts = useSimulationDomainStore((state) => state.alerts);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Simulated Plant Layout</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Academic visualization of zones, equipment, sensors, and simulated risk</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <section className="glass-card p-4">
          <div className="relative min-h-[560px] rounded-lg border border-[rgba(0,212,255,0.12)] bg-[#050d16] overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            {ZONES.map((zone) => {
              const sensor = telemetry.find((item) => item.type === zone.sensorType);
              const activeAlert = alerts.some((alert) => alert.zone === zone.name && alert.status !== 'resolved');
              const color = activeAlert || sensor?.status === 'critical' ? '#ff3355' : sensor?.status === 'warning' ? '#ffb800' : '#00d4ff';
              return (
                <div
                  key={zone.name}
                  className="absolute rounded-lg border p-4 flex flex-col justify-between"
                  style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height, borderColor: `${color}55`, background: `${color}0d` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-white text-sm font-semibold"><MapPin className="w-4 h-4" style={{ color }} />{zone.name}</div>
                      <div className="text-[#587996] text-xs mt-1 flex items-center gap-1.5"><Box className="w-3 h-3" />{zone.equipment}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-[10px] uppercase font-mono" style={{ color }}>{activeAlert ? 'Risk Alert' : sensor?.status ?? 'normal'}</div>
                    <div className="text-right">
                      <div className="font-mono text-lg" style={{ color }}>{sensor?.value ?? 0} {sensor?.unit ?? ''}</div>
                      <div className="text-[#587996] text-[10px]">{sensor?.sensorName ?? 'Sensor'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="glass-card p-4">
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-4"><Gauge className="w-4 h-4 text-cyan-400" />Zone Risk Indicators</div>
            <div className="space-y-3">
              {ZONES.map((zone) => {
                const sensor = telemetry.find((item) => item.type === zone.sensorType);
                const risk = sensor ? Math.min(100, Math.round(sensor.value / sensor.threshold.critical * 100)) : 0;
                return (
                  <div key={zone.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#7fa3c4]">{zone.name}</span>
                      <span className="text-cyan-400 font-mono">{risk}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${risk}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="glass-card p-4">
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-3"><Activity className="w-4 h-4 text-green-400" />Layout Scope</div>
            <p className="text-[#7fa3c4] text-xs leading-relaxed">This view represents a simulated academic plant layout. It visualizes application state only and does not connect to CAD, GIS, or a physical plant.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
