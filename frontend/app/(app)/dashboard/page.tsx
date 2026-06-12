'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bell,
  Gauge,
  HeartPulse,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import { formatRelativeTime } from '@/lib/utils';

const METRIC_COLORS = ['#00d4ff', '#ffb800', '#ff3355', '#00ff88', '#7c8cff', '#39ffb6'];

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Activity;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 min-h-32"
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center border" style={{ color, borderColor: `${color}35`, background: `${color}12` }}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <div className="mt-4 text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-white text-sm font-medium">{label}</div>
      <div className="text-[#587996] text-[11px] mt-1">{detail}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const telemetry = useSimulationDomainStore((state) => state.telemetry);
  const alerts = useSimulationDomainStore((state) => state.alerts);
  const incidents = useSimulationDomainStore((state) => state.incidents);
  const notifications = useSimulationDomainStore((state) => state.notifications);
  const risk = useSimulationDomainStore((state) => state.riskMetrics);
  const systemHealth = useSimulationDomainStore((state) => state.systemHealth);
  const lastUpdated = useSimulationDomainStore((state) => state.lastUpdated);
  const activityHistory = useSimulationDomainStore((state) => state.activityHistory);

  const activeAlerts = alerts.filter((alert) => alert.status !== 'resolved');
  const openIncidents = incidents.filter((incident) => incident.status !== 'resolved' && incident.status !== 'closed');
  const connectedSensors = telemetry.filter((sensor) => sensor.status !== 'offline').length;

  const metrics = [
    { label: 'Connected Sensors', value: connectedSensors, detail: `${telemetry.length} sensors registered`, icon: Radio, color: METRIC_COLORS[0] },
    { label: 'Active Alerts', value: activeAlerts.length, detail: activeAlerts.length ? 'Action required' : 'No active safety alerts', icon: AlertTriangle, color: METRIC_COLORS[1] },
    { label: 'Open Incidents', value: openIncidents.length, detail: openIncidents.length ? 'Investigation queue' : 'No open incidents', icon: ShieldCheck, color: METRIC_COLORS[2] },
    { label: 'System Health', value: `${systemHealth}%`, detail: systemHealth >= 90 ? 'All core services healthy' : 'Scenario impact detected', icon: HeartPulse, color: METRIC_COLORS[3] },
    { label: 'Risk Score', value: risk.overall, detail: risk.overall < 40 ? 'Low operational risk' : risk.overall < 70 ? 'Elevated operational risk' : 'High operational risk', icon: Gauge, color: METRIC_COLORS[4] },
    { label: 'Notifications', value: notifications.length, detail: 'Local simulation records', icon: Bell, color: METRIC_COLORS[5] },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Dashboard</h1>
          <p className="text-[#7fa3c4] text-sm mt-1">Industrial safety monitoring overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-green-400">
          <Activity className="w-4 h-4" />
          <span>Simulation Environment</span>
          <span className="text-[#3a5a7a]">Updated {formatRelativeTime(lastUpdated)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <section className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(0,212,255,0.08)]">
            <h2 className="text-white text-sm font-semibold">Live Sensor Snapshot</h2>
          </div>
          <div className="divide-y divide-[rgba(0,212,255,0.05)]">
            {telemetry.map((sensor) => {
              const color = sensor.status === 'critical' ? '#ff3355' : sensor.status === 'warning' ? '#ffb800' : '#00ff88';
              return (
                <div key={sensor.sensorId} className="px-5 py-3 flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm">{sensor.sensorName}</div>
                    <div className="text-[#587996] text-[11px]">{sensor.zone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm" style={{ color }}>{sensor.value} {sensor.unit}</div>
                    <div className="text-[#587996] text-[10px] uppercase">{sensor.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(0,212,255,0.08)]">
            <h2 className="text-white text-sm font-semibold">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {activityHistory.length === 0 ? (
              <div className="py-14 text-center">
                <ShieldCheck className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-[#7fa3c4] text-sm">Normal operation</p>
                <p className="text-[#3a5a7a] text-xs mt-1">Scenario activity will appear here.</p>
              </div>
            ) : activityHistory.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className="w-1 rounded-full bg-cyan-400/50" />
                <div>
                  <div className="text-[#d8eaff] text-xs">{entry.message}</div>
                  <div className="text-[#3a5a7a] text-[10px] font-mono mt-1">{formatRelativeTime(entry.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
