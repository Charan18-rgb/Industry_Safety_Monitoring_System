'use client';

import { Activity, CheckCircle2, Clock3, Radio } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import { formatRelativeTime } from '@/lib/utils';

const SENSOR_COLORS: Record<string, string> = {
  temperature: '#ff8a65',
  gas: '#00d4ff',
  humidity: '#7c8cff',
  pressure: '#39ffb6',
  vibration: '#ffb800',
};

export default function SensorMonitoringPage() {
  const sensors = useSimulationDomainStore((state) => state.telemetry);
  const history = useSimulationDomainStore((state) => state.telemetryHistory);
  const connected = useSimulationDomainStore((state) => state.isConnected);
  const lastUpdated = useSimulationDomainStore((state) => state.lastUpdated);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Sensor Monitoring</h1>
          <p className="text-[#7fa3c4] text-sm mt-1">Deterministic live telemetry from the simulation environment</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill icon={Radio} label="Connection" value={connected ? 'Connected' : 'Offline'} color={connected ? '#00ff88' : '#ff3355'} />
          <StatusPill icon={Clock3} label="Last Updated" value={formatRelativeTime(lastUpdated)} color="#00d4ff" />
          <StatusPill icon={CheckCircle2} label="Sensor Health" value={`${sensors.filter((sensor) => sensor.status === 'normal').length}/${sensors.length} Normal`} color="#39ffb6" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sensors.map((sensor) => {
          const color = SENSOR_COLORS[sensor.type] ?? '#00d4ff';
          const series = history.find((item) => item.sensorId === sensor.sensorId)?.readings ?? [];
          const chartData = series.map((reading) => ({
            time: new Date(reading.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
            value: reading.value,
          }));
          const statusColor = sensor.status === 'critical' ? '#ff3355' : sensor.status === 'warning' ? '#ffb800' : '#00ff88';
          return (
            <section key={sensor.sensorId} className="glass-card p-5 min-h-72">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color }} />
                    <h2 className="text-white text-sm font-semibold">{sensor.sensorName}</h2>
                  </div>
                  <p className="text-[#587996] text-[11px] mt-1">{sensor.sensorId} · {sensor.zone}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold" style={{ color }}>{sensor.value} <span className="text-sm">{sensor.unit}</span></div>
                  <div className="text-[10px] font-mono uppercase mt-1" style={{ color: statusColor }}>{sensor.status}</div>
                </div>
              </div>
              <div className="h-40 mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`fill-${sensor.sensorId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(127,163,196,0.08)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} width={34} tick={{ fill: '#587996', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#071421', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, fontSize: 11 }} />
                    <Area type="monotone" dataKey="value" stroke={color} fill={`url(#fill-${sensor.sensorId})`} strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] text-[#587996] font-mono mt-2">
                <span>Warning {sensor.threshold.warning} {sensor.unit}</span>
                <span>Critical {sensor.threshold.critical} {sensor.unit}</span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Radio;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.04)]">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <div>
        <div className="text-[#587996] text-[9px] uppercase">{label}</div>
        <div className="text-xs font-mono" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}
