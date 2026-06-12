'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import type { SensorType } from '@/types';

const TOOLTIP_STYLE = {
  background: '#071421',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: 6,
  fontSize: 11,
};

function TrendChart({ type, title, color }: { type: SensorType; title: string; color: string }) {
  const sensor = useSimulationDomainStore((state) => state.telemetry.find((item) => item.type === type));
  const history = useSimulationDomainStore((state) => state.telemetryHistory.find((item) => item.sensorId === sensor?.sensorId)?.readings ?? []);
  const data = history.slice(-60).map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    value: reading.value,
  }));

  return (
    <section className="glass-card p-5 min-h-72">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-sm font-semibold">{title}</h2>
        <span className="font-mono text-sm" style={{ color }}>{sensor?.value ?? 0} {sensor?.unit ?? ''}</span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(127,163,196,0.08)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#587996', fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#587996', fontSize: 9 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line dataKey="value" type="monotone" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function SafetyAnalyticsPage() {
  const alerts = useSimulationDomainStore((state) => state.alerts);
  const incidents = useSimulationDomainStore((state) => state.incidents);

  const alertsBySeverity = ['info', 'warning', 'critical', 'emergency'].map((severity) => ({
    name: severity[0].toUpperCase() + severity.slice(1),
    count: alerts.filter((alert) => alert.severity === severity).length,
  }));
  const incidentsByStatus = ['open', 'investigating', 'resolved', 'closed'].map((status) => ({
    name: status[0].toUpperCase() + status.slice(1),
    count: incidents.filter((incident) => incident.status === status).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Safety Analytics</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Operational trends and lifecycle distribution</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <TrendChart type="temperature" title="Temperature Trend" color="#ff8a65" />
        <TrendChart type="gas" title="Gas Trend" color="#00d4ff" />
        <TrendChart type="vibration" title="Vibration Trend" color="#ffb800" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DistributionChart title="Alerts by Severity" data={alertsBySeverity} color="#ffb800" />
        <DistributionChart title="Incidents by Status" data={incidentsByStatus} color="#00d4ff" />
      </div>
    </div>
  );
}

function DistributionChart({ title, data, color }: { title: string; data: Array<{ name: string; count: number }>; color: string }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <section className="glass-card p-5 min-h-72">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-sm font-semibold">{title}</h2>
        <span className="text-[#7fa3c4] text-xs font-mono">Total {total}</span>
      </div>
      <div className="h-52 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(127,163,196,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#587996', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} domain={[0, Math.max(1, ...data.map((item) => item.count))]} tick={{ fill: '#587996', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Bar name="Records" dataKey="count" fill={color} radius={[4, 4, 0, 0]} minPointSize={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
