'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Zap, Cpu,
  CheckCircle, XCircle, Activity, Radio, Clock,
  ChevronDown, ChevronUp, Users, FileText,
  Mail, Play, BarChart3, Camera, Map, Bell,
  Server, Box, ArrowDown, CircleDot
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  mockSensorReadings, mockRiskScoreNominal,
  mockIncidentsNominal, generateTelemetryHistory,
  mockSensorReadingsNominal as mockSensorReadingsNominalData
} from '@/lib/mockData';
import { useTelemetryStore, useAlertStore, useSimulationStore, useIncidentStore, useDemoStore, useNotificationStore, useReportStore, useActivityStore } from '@/store';
import { cn, getRiskColor, getRiskLabel, formatRelativeTime, getSeverityColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SensorHistoryPanel } from '@/components/dashboard/SensorHistoryPanel';
import { TinkercadSyncPanel } from '@/components/dashboard/TinkercadSyncPanel';

// ─── Sub-components ──────────────────────────────────────────────────────────

function RiskGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [{ value, fill: color }, { value: 100 - value, fill: 'rgba(255,255,255,0.03)' }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={data} barSize={6}>
            <RadialBar dataKey="value" cornerRadius={3} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[#7fa3c4] text-[10px] mt-1 text-center leading-tight">{label}</span>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, unit, status, sublabel, color
}: {
  icon: LucideIcon; label: string; value: string | number; unit?: string;
  status: 'normal' | 'warning' | 'critical'; sublabel?: string; color?: string;
}) {
  const statusColors = { normal: '#00ff88', warning: '#ffb800', critical: '#ff3355' };
  const cardColor = color ?? statusColors[status];

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${cardColor}40, transparent)` }} />
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cardColor}15`, border: `1px solid ${cardColor}30` }}>
          <Icon className="w-4 h-4" style={{ color: cardColor }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-0.5">
        <span className="text-xl font-bold text-white font-mono">{value}</span>
        {unit && <span className="text-sm text-[#7fa3c4]">{unit}</span>}
      </div>
      <div className="text-[#7fa3c4] text-xs">{label}</div>
      {sublabel && <div className="text-[#3a5a7a] text-[10px] mt-0.5 font-mono">{sublabel}</div>}
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full" style={{ background: cardColor, boxShadow: `0 0 6px ${cardColor}` }} />
    </div>
  );
}

function SensorCard({ sensor }: { sensor: typeof mockSensorReadings[0] }) {
  const history = generateTelemetryHistory(sensor.value, sensor.max * 0.1, 20);
  const statusColors = { normal: '#00ff88', warning: '#ffb800', critical: '#ff3355', offline: '#3a5a7a' };
  const color = statusColors[sensor.status as keyof typeof statusColors];
  const pct = Math.round((sensor.value / sensor.max) * 100);

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white text-xs font-medium">{sensor.sensorName}</div>
          <div className="text-[#3a5a7a] text-[10px] font-mono">{sensor.sensorId} · {sensor.zone}</div>
        </div>
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase', {
          'badge-success': sensor.status === 'normal',
          'badge-warning': sensor.status === 'warning',
          'badge-critical': sensor.status === 'critical',
        })}>{sensor.status}</span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl font-bold font-mono" style={{ color }}>{sensor.value}</div>
        <div className="text-[#7fa3c4] text-sm">{sensor.unit}</div>
      </div>
      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-1000" style={{ background: color, width: `${pct}%` }} />
      </div>
      <div className="h-10 opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <Area type="monotone" dataKey="value" stroke={color} fill={`${color}10`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[#3a5a7a] text-[10px] font-mono mt-1">
        <span>WARN: {sensor.threshold.warning}{sensor.unit}</span>
        <span>CRIT: {sensor.threshold.critical}{sensor.unit}</span>
      </div>
    </div>
  );
}

function StatusRow({ label, status, icon: Icon }: { label: string; status: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,212,255,0.06)] last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#7fa3c4]" />
        <span className="text-[#7fa3c4] text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-green-400 text-xs font-mono">{status}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,212,255,0.06)] last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[#7fa3c4] text-xs">{label}</span>
      </div>
      <span className="text-white text-sm font-bold font-mono">{value}</span>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { sensors } = useTelemetryStore();
  const { activeCount, criticalCount, alerts } = useAlertStore();
  const { activeScenario } = useSimulationStore();
  const { simulateGasLeak, resetSystem } = useSimulationStore();
  const demoStore = useDemoStore();
  const notificationStore = useNotificationStore();
  const reportStore = useReportStore();
  const activityStore = useActivityStore();
  const isSimulating = activeScenario !== null;
  const [now, setNow] = useState(() => new Date());
  const [aboutOpen, setAboutOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoComplete, setDemoComplete] = useState(false);

  const riskScore = useTelemetryStore().riskScore ?? mockRiskScoreNominal;
  const incidentStoreIncidents = useIncidentStore().incidents;
  const incidents = incidentStoreIncidents.length > 0 ? incidentStoreIncidents : mockIncidentsNominal;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical' || i.severity === 'emergency').length;
  const riskColor = getRiskColor(riskScore.overall);
  const riskLabel = getRiskLabel(riskScore.overall);
  const displaySensors = sensors.length > 0 ? sensors : (isSimulating ? mockSensorReadings : mockSensorReadingsNominalData);

  const demoSteps = [
    { label: 'Triggering Gas Leak Simulation...', icon: Zap },
    { label: 'Alert Generated', icon: Bell },
    { label: 'Incident Created', icon: AlertTriangle },
    { label: 'Digital Twin Updated', icon: Map },
    { label: 'Email Notification Sent', icon: Mail },
    { label: 'Demo Complete — Generate Report?', icon: FileText },
  ];

  const runCompleteDemo = useCallback(() => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoStep(0);
    setDemoComplete(false);

    // Step 1: Gas leak simulation
    resetSystem();
    setTimeout(() => {
      simulateGasLeak();
      demoStore.incrementStat('totalSimulations');
      demoStore.incrementStat('totalAlerts');
      demoStore.incrementStat('totalIncidents');
      setDemoStep(1);
    }, 800);

    // Step 2: Alert
    setTimeout(() => setDemoStep(2), 2000);

    // Step 3: Incident
    setTimeout(() => setDemoStep(3), 3200);

    // Step 4: Digital Twin
    setTimeout(() => setDemoStep(4), 4400);

    // Step 5: Email notification
    setTimeout(() => {
      demoStore.incrementStat('totalNotifications');
      setDemoStep(5);
    }, 5600);

    // Step 6: Complete
    setTimeout(() => {
      setDemoStep(6);
      setDemoComplete(true);
      setDemoRunning(false);
    }, 7000);
  }, [demoRunning, simulateGasLeak, resetSystem, demoStore]);

  const handleGenerateReport = () => {
    demoStore.incrementStat('totalReports');
    router.push('/reports');
  };

  return (
    <div className="p-6 space-y-5 min-h-full">

      {/* ─── PART 1: Project Banner ─────────────────────────────────────── */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display tracking-wide">AEGIS-AI</h1>
              <p className="text-[#7fa3c4] text-xs mt-0.5">Autonomous Enterprise Grade Industrial Safety Intelligence System</p>
              <p className="text-[#3a5a7a] text-[10px] font-mono mt-0.5">Industrial Safety Monitoring Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-mono">Demo Mode Active</span>
            </div>
            <div className="flex items-center gap-2 text-[#3a5a7a]">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-xs text-[#7fa3c4]" suppressHydrationWarning>
                {now.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Radio className="w-3 h-3 text-green-400" />
        <span className="text-green-400 text-xs font-mono tracking-widest">
          {isSimulating ? 'SIMULATION MODE ACTIVE' : 'LIVE MONITORING ACTIVE'}
        </span>
      </div>

      {/* ─── KPI Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard icon={Shield} label="Risk Score" value={riskScore.overall} unit="/100" status={riskScore.overall >= 80 ? 'critical' : riskScore.overall >= 50 ? 'warning' : 'normal'} sublabel={riskLabel} color={riskColor} />
        <MetricCard icon={Zap} label="Active Alerts" value={activeCount} status={criticalCount > 0 ? 'critical' : activeCount > 0 ? 'warning' : 'normal'} sublabel={`${criticalCount} critical`} color="#ffb800" />
        <MetricCard icon={Cpu} label="System Health" value={`${riskScore.equipment}%`} status={riskScore.equipment < 50 ? 'critical' : riskScore.equipment < 80 ? 'warning' : 'normal'} sublabel="Equipment Health" color="#ff6b35" />
        <MetricCard icon={AlertTriangle} label="Incidents" value={openIncidents} status={openIncidents > 0 ? 'warning' : 'normal'} sublabel={`${criticalIncidents} critical`} color="#ff3355" />
      </div>

      {/* ─── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* LEFT COLUMN — Core Monitoring */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* Sensor History Analytics (Tinkercad Integration) */}
          <div className="mb-4">
            <SensorHistoryPanel />
          </div>

          {/* Risk Overview */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Industrial Risk Score</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono" style={{ color: riskColor, background: `${riskColor}15`, border: `1px solid ${riskColor}30` }}>
                {riskLabel}
              </span>
            </div>
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="58" fill="none"
                  stroke={riskColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - riskScore.overall / 100)}
                  style={{ filter: `drop-shadow(0 0 6px ${riskColor})`, transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-mono" style={{ color: riskColor }}>{riskScore.overall}</span>
                <span className="text-[#7fa3c4] text-[10px] tracking-widest">RISK SCORE</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <RiskGauge value={riskScore.gas} label="Gas" color="#00d4ff" />
              <RiskGauge value={riskScore.temperature} label="Temperature" color="#ffb800" />
              <RiskGauge value={riskScore.vibration} label="Vibration" color="#ff3355" />
              <RiskGauge value={riskScore.equipment} label="System Health" color="#ff6b35" />
            </div>
          </div>

          {/* Live Sensor Status */}
          <div>
            <h2 className="text-white font-semibold mb-3">Live Sensor Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displaySensors.slice(0, 4).map((sensor) => (
                <SensorCard key={sensor.sensorId} sensor={sensor} />
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h2 className="text-white font-semibold mb-3">Recent Incidents</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(0,212,255,0.08)]">
                      {['ID', 'Incident', 'Zone', 'Severity', 'Status', 'Time'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[#7fa3c4] text-xs font-medium tracking-widest uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.slice(0, 5).map((inc) => {
                      const sevColor = getSeverityColor(inc.severity);
                      return (
                        <tr key={inc.id} className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                          <td className="px-4 py-3 font-mono text-[#7fa3c4] text-xs">{inc.id}</td>
                          <td className="px-4 py-3">
                            <div className="text-white text-xs font-medium">{inc.title}</div>
                          </td>
                          <td className="px-4 py-3 text-[#7fa3c4] text-xs font-mono">{inc.zone}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                              style={{ color: sevColor, background: `${sevColor}15`, border: `1px solid ${sevColor}30` }}>
                              {inc.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {inc.status === 'resolved' || inc.status === 'closed'
                                ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                : inc.status === 'investigating'
                                  ? <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                  : <XCircle className="w-3.5 h-3.5 text-amber-400" />}
                              <span className="text-[#7fa3c4] text-xs capitalize">{inc.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#3a5a7a] text-xs font-mono">{formatRelativeTime(inc.createdAt)}</td>
                        </tr>
                      );
                    })}
                    {incidents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#3a5a7a] text-sm">
                          No active incidents. System nominal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Presentation Panels */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          <TinkercadSyncPanel />

          {/* ─── PART 5: Run Complete Demo ─────────────────────────────── */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              Run Complete Demo
            </h3>
            <p className="text-[#7fa3c4] text-xs mb-3">
              Execute a guided demonstration showing the full AEGIS-AI workflow.
            </p>
            <button
              onClick={runCompleteDemo}
              disabled={demoRunning}
              className={cn(
                'w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                demoRunning
                  ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 cursor-wait'
                  : 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/30'
              )}
            >
              {demoRunning ? 'Running Demo...' : 'Start Demo Sequence'}
            </button>

            {/* Demo Steps */}
            {(demoRunning || demoComplete) && (
              <div className="mt-3 space-y-1.5">
                {demoSteps.map((step, i) => {
                  const StepIcon = step.icon;
                  const isComplete = demoStep > i;
                  const isCurrent = demoStep === i;
                  const isVisible = demoStep >= i;
                  if (!isVisible) return null;
                  return (
                    <div key={i} className="flex items-center gap-2 py-1">
                      {isComplete ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <StepIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      ) : (
                        <CircleDot className="w-3.5 h-3.5 text-[#3a5a7a] flex-shrink-0" />
                      )}
                      <span className={cn('text-xs', isComplete ? 'text-green-400' : isCurrent ? 'text-cyan-400' : 'text-[#3a5a7a]')}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                {demoComplete && (
                  <button
                    onClick={handleGenerateReport}
                    className="w-full mt-2 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors"
                  >
                    Generate Report →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── PART 6: System Health ─────────────────────────────────── */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              System Health
            </h3>
            <StatusRow label="Webcam Ready" status="Online" icon={Camera} />
            <StatusRow label="Email Online" status="Online" icon={Mail} />
            <StatusRow label="WhatsApp Online" status="Online" icon={Mail} />
            <StatusRow label="Reports Ready" status="Online" icon={FileText} />
            <StatusRow label="Simulation Engine Ready" status="Online" icon={Zap} />
            <StatusRow label="Digital Twin Ready" status="Online" icon={Map} />
          </div>

          {/* ─── PART 4: Live KPI Counters ────────────────────────────── */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Live KPI Counters
            </h3>
            <StatCard label="Total Alerts" value={alerts.length} icon={Bell} />
            <StatCard label="Total Incidents" value={incidentStoreIncidents.length} icon={AlertTriangle} />
            <StatCard label="Reports Generated" value={reportStore.reports.length} icon={FileText} />
            <StatCard label="Emails Sent" value={notificationStore.emailsSent} icon={Mail} />
            <StatCard label="WhatsApp Messages Sent" value={notificationStore.whatsappSent} icon={Mail} />
            <StatCard label="Failed Deliveries" value={notificationStore.logs.filter(l => l.emailStatus === 'failed' || l.whatsappStatus === 'failed').length} icon={XCircle} />
          </div>

          {/* ─── Activity Timeline ────────────────────────────────────── */}
          <div className="glass-card p-4 flex flex-col max-h-96">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Activity Timeline
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {activityStore.activities.length === 0 ? (
                <div className="text-[#3a5a7a] text-xs text-center py-4">No recent activity.</div>
              ) : (
                activityStore.activities.slice(0, 50).map((activity) => {
                  const d = new Date(activity.timestamp);
                  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return (
                    <div key={activity.id} className="flex gap-3 text-sm border-l-2 border-[rgba(0,212,255,0.2)] pl-3 relative">
                      <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -left-[5px] top-1.5 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                      <div className="text-[#7fa3c4] font-mono text-xs w-12 flex-shrink-0 mt-0.5">{timeStr}</div>
                      <div className="text-white text-xs leading-snug">{activity.message}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ─── PART 2: About Project (Collapsible) ──────────────────── */}
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                About Project
              </h3>
              {aboutOpen ? <ChevronUp className="w-4 h-4 text-[#7fa3c4]" /> : <ChevronDown className="w-4 h-4 text-[#7fa3c4]" />}
            </button>
            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <div className="text-[#7fa3c4] text-[10px] font-mono uppercase tracking-wider mb-1">Project Name</div>
                      <div className="text-white text-sm font-medium">AEGIS-AI</div>
                    </div>
                    <div>
                      <div className="text-[#7fa3c4] text-[10px] font-mono uppercase tracking-wider mb-1">Purpose</div>
                      <div className="text-white text-sm">Industrial Safety Monitoring and Alert System</div>
                    </div>
                    <div>
                      <div className="text-[#7fa3c4] text-[10px] font-mono uppercase tracking-wider mb-2">Hardware</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['Arduino', 'Gas Sensor', 'Temperature Sensor', 'Buzzer', 'LED Indicators'].map((hw) => (
                          <span key={hw} className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono">{hw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#7fa3c4] text-[10px] font-mono uppercase tracking-wider mb-2">Software</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['Command Center', 'Digital Twin', 'Alerts', 'Reports', 'Camera Monitoring', 'Safety Analytics'].map((sw) => (
                          <span key={sw} className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono">{sw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── PART 3: Project Team ─────────────────────────────────── */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Project Team
            </h3>
            <div className="space-y-2">
              {['Member 1', 'Member 2', 'Member 3', 'Member 4'].map((name, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-[10px] font-bold">{name.charAt(0)}</span>
                  </div>
                  <span className="text-white text-xs">{name}</span>
                  <span className="text-[#3a5a7a] text-[10px] font-mono ml-auto">Team Member</span>
                </div>
              ))}
              <div className="border-t border-[rgba(0,212,255,0.08)] pt-2 mt-2">
                <div className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-[10px] font-bold">F</span>
                  </div>
                  <span className="text-white text-xs">Faculty Guide</span>
                  <span className="text-amber-400 text-[10px] font-mono ml-auto">Guide</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── PART 8: Hardware Integration Roadmap ─────────────────── */}
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Hardware Integration Roadmap
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Current Version */}
              <div>
                <div className="text-green-400 text-[10px] font-mono uppercase tracking-wider mb-2">Current Version</div>
                <div className="space-y-1">
                  {['Arduino', 'Sensors', 'Simulation Layer', 'AEGIS-AI Dashboard'].map((item, i, arr) => (
                    <div key={i}>
                      <div className="text-white text-[11px] py-1 px-2 rounded bg-green-500/8 border border-green-500/15 text-center">{item}</div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-3 h-3 text-green-400/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Future Version */}
              <div>
                <div className="text-cyan-400 text-[10px] font-mono uppercase tracking-wider mb-2">Future Version</div>
                <div className="space-y-1">
                  {['Arduino', 'Python Backend', 'FastAPI', 'WebSocket', 'Live Dashboard'].map((item, i, arr) => (
                    <div key={i}>
                      <div className="text-white text-[11px] py-1 px-2 rounded bg-cyan-500/8 border border-cyan-500/15 text-center">{item}</div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-3 h-3 text-cyan-400/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
