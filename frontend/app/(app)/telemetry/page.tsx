'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Thermometer, Droplets, Wind, Zap, Radio,
  Filter
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { mockSensorReadings, generateTelemetryHistory } from '@/lib/mockData';
import { useTelemetryStore } from '@/store';
import { cn } from '@/lib/utils';
import type { SensorReading, SensorType } from '@/types';

const TYPE_ICONS: Record<SensorType, LucideIcon> = {
  gas: Wind,
  temperature: Thermometer,
  humidity: Droplets,
  vibration: Activity,
  pressure: Zap,
  current: Radio,
};

const TYPE_COLORS: Record<SensorType, string> = {
  gas: '#00d4ff',
  temperature: '#ffb800',
  humidity: '#7c3aed',
  vibration: '#ff3355',
  pressure: '#00ff88',
  current: '#ff6b35',
};

function SensorDetailCard({ sensor }: { sensor: SensorReading }) {
  const Icon = TYPE_ICONS[sensor.type] ?? Activity;
  const color = TYPE_COLORS[sensor.type] ?? '#00d4ff';
  const history = generateTelemetryHistory(sensor.value, sensor.max * 0.12, 48);
  const pct = Math.round((sensor.value / sensor.max) * 100);

  const statusColors = { normal: '#00ff88', warning: '#ffb800', critical: '#ff3355', offline: '#3a5a7a' };
  const statusColor = statusColors[sensor.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[rgba(0,212,255,0.08)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-white text-sm font-medium">{sensor.sensorName}</div>
              <div className="text-[#3a5a7a] text-[10px] font-mono">{sensor.sensorId} · {sensor.zone}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
              <span className="text-xs capitalize font-mono" style={{ color: statusColor }}>{sensor.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="p-4">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black font-mono" style={{ color }}>{sensor.value}</span>
          <span className="text-[#7fa3c4] text-sm">{sensor.unit}</span>
          <span className="ml-auto text-[#3a5a7a] text-xs font-mono">{pct}% of max</span>
        </div>

        {/* Threshold bar */}
        <div className="relative h-2 bg-[rgba(255,255,255,0.05)] rounded-full mb-1">
          <div className="absolute h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400/70" style={{ left: `${(sensor.threshold.warning / sensor.max) * 100}%` }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-400/70" style={{ left: `${(sensor.threshold.critical / sensor.max) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[#3a5a7a] text-[10px] font-mono mb-3">
          <span>0 {sensor.unit}</span>
          <span className="text-amber-400/60">W: {sensor.threshold.warning}</span>
          <span className="text-red-400/60">C: {sensor.threshold.critical}</span>
          <span>{sensor.max} {sensor.unit}</span>
        </div>

        {/* Trend chart */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${sensor.sensorId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <YAxis hide domain={['auto', 'auto']} />
              <XAxis dataKey="timestamp" hide />
              <Tooltip
                contentStyle={{ background: '#040c14', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e8f4ff', fontSize: 11 }}
                formatter={(value) => [`${value ?? 'N/A'} ${sensor.unit}`, sensor.sensorName]}
              />
              <ReferenceLine y={sensor.threshold.warning} stroke="#ffb800" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1} />
              <ReferenceLine y={sensor.threshold.critical} stroke="#ff3355" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1} />
              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${sensor.sensorId})`} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export default function TelemetryPage() {
  const { sensors, isConnected } = useTelemetryStore();
  const [typeFilter, setTypeFilter] = useState<SensorType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const displaySensors = sensors.length > 0 ? sensors : mockSensorReadings;

  const filtered = displaySensors.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: displaySensors.length,
    normal: displaySensors.filter((s) => s.status === 'normal').length,
    warning: displaySensors.filter((s) => s.status === 'warning').length,
    critical: displaySensors.filter((s) => s.status === 'critical').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Telemetry Monitoring</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Real-time sensor data across all industrial zones</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono', isConnected ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
            <div className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-400 pulse-dot' : 'bg-red-400')} />
            {isConnected ? 'LIVE' : 'DEMO MODE'}
          </div>
        </div>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Sensors', value: counts.total, color: '#00d4ff' },
          { label: 'Normal', value: counts.normal, color: '#00ff88' },
          { label: 'Warning', value: counts.warning, color: '#ffb800' },
          { label: 'Critical', value: counts.critical, color: '#ff3355' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-2 h-10 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
              <div className="text-[#7fa3c4] text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-[#7fa3c4]" />

          {/* Type filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'gas', 'temperature', 'humidity', 'vibration', 'pressure'] as const).map((t) => {
              const color = t === 'all' ? '#7fa3c4' : TYPE_COLORS[t as SensorType];
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all', typeFilter === t ? 'text-white' : 'text-[#7fa3c4] hover:text-white')}
                  style={typeFilter === t ? { background: `${color}20`, border: `1px solid ${color}50`, color } : { border: '1px solid rgba(0,212,255,0.1)' }}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-[rgba(0,212,255,0.1)]" />

          {/* Status filter */}
          <div className="flex gap-2">
            {['all', 'normal', 'warning', 'critical'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn('px-2.5 py-1.5 rounded text-[10px] font-mono capitalize transition-all', statusFilter === s ? 'text-white bg-cyan-400/15 border-cyan-400/40' : 'text-[#7fa3c4] border-transparent hover:text-white')}
                style={{ border: '1px solid' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((sensor) => (
          <SensorDetailCard key={sensor.sensorId} sensor={sensor} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Activity className="w-8 h-8 text-[#3a5a7a] mx-auto mb-3" />
          <p className="text-[#7fa3c4]">No sensors match the selected filters</p>
        </div>
      )}
    </div>
  );
}
