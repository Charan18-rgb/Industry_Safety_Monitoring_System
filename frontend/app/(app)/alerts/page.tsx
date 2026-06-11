'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, AlertTriangle, Info, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';
import { useAlertStore } from '@/store';
import { getSeverityColor, formatRelativeTime, cn } from '@/lib/utils';
import type { Alert, AlertSeverity } from '@/types';

const SEV_ICONS: Record<AlertSeverity, LucideIcon> = {
  emergency: Zap,
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

function AlertCard({ alert, onAck, onResolve }: { alert: Alert; onAck: () => void; onResolve: () => void }) {
  const color = getSeverityColor(alert.severity);
  const Icon = SEV_ICONS[alert.severity];
  const isEmergency = alert.severity === 'emergency';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card overflow-hidden"
      style={{ borderColor: alert.status === 'active' ? `${color}30` : 'rgba(0,212,255,0.1)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}${alert.status === 'active' ? '60' : '20'}, transparent)` }} />

      <div className="p-4 flex items-start gap-4">
        <motion.div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          animate={isEmergency && alert.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                  {alert.severity}
                </span>
                {alert.status === 'acknowledged' && (
                  <span className="text-[9px] font-mono text-blue-400 border border-blue-400/30 px-1.5 py-0.5 rounded">ACK</span>
                )}
                {alert.status === 'resolved' && (
                  <span className="text-[9px] font-mono text-green-400 border border-green-400/30 px-1.5 py-0.5 rounded">RESOLVED</span>
                )}
              </div>
              <div className="text-white text-sm font-medium">{alert.title}</div>
              <div className="text-[#7fa3c4] text-xs mt-0.5">{alert.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-[#3a5a7a] text-[10px] font-mono">{alert.zone}</span>
            <span className="text-[#3a5a7a] text-[10px] font-mono">{alert.source}</span>
            <span className="text-[#3a5a7a] text-[10px] font-mono ml-auto">{formatRelativeTime(alert.timestamp)}</span>
          </div>

          {alert.acknowledgedBy && (
            <div className="mt-1.5 text-[10px] text-blue-400 font-mono">
              Acknowledged by {alert.acknowledgedBy}
            </div>
          )}
        </div>

        {alert.status === 'active' && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={onAck}
              className="px-2.5 py-1.5 rounded text-[10px] font-semibold text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 transition-all whitespace-nowrap"
            >
              Acknowledge
            </button>
            <button
              onClick={onResolve}
              className="px-2.5 py-1.5 rounded text-[10px] font-semibold text-green-400 border border-green-400/30 hover:bg-green-400/10 transition-all"
            >
              Resolve
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Emergency overlay
function EmergencyOverlay({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(255,0,0,0.1)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="relative max-w-md w-full mx-4 rounded-2xl overflow-hidden"
        style={{ background: '#0a0005', border: '2px solid #ff3355', boxShadow: '0 0 60px rgba(255,51,85,0.4)' }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ background: 'rgba(255,51,85,0.1)' }}
        />
        <div className="relative p-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="w-8 h-8 text-red-400" />
          </motion.div>
          <div className="text-red-400 font-mono text-xs tracking-widest mb-2">EMERGENCY ALERT</div>
          <h2 className="text-white text-xl font-bold mb-2">{alert.title}</h2>
          <p className="text-[#7fa3c4] text-sm mb-4">{alert.message}</p>
          <div className="text-[#7fa3c4] text-xs font-mono mb-6">Zone: {alert.zone} · {formatRelativeTime(alert.timestamp)}</div>
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-3 rounded-lg text-sm font-semibold text-red-400 border border-red-400/50 hover:bg-red-400/10 transition-all"
            >
              Dismiss
            </button>
            <button className="flex-1 py-3 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-400 transition-all">
              Initiate Protocol
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, resolveAlert, hasEmergency, emergencyAlert, dismissEmergency } = useAlertStore();
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
  const [showEmergency, setShowEmergency] = useState(true);

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const filtered = displayAlerts.filter((a) => {
    if (filter !== 'all' && a.severity !== filter) return false;
    return true;
  });

  const counts = {
    all: displayAlerts.length,
    emergency: displayAlerts.filter((a) => a.severity === 'emergency').length,
    critical: displayAlerts.filter((a) => a.severity === 'critical').length,
    warning: displayAlerts.filter((a) => a.severity === 'warning').length,
    info: displayAlerts.filter((a) => a.severity === 'info').length,
  };

  const user = { name: 'Current User' };

  return (
    <div className="p-6 space-y-6">
      {/* Emergency overlay */}
      <AnimatePresence>
        {hasEmergency && emergencyAlert && showEmergency && (
          <EmergencyOverlay alert={emergencyAlert} onDismiss={() => { dismissEmergency(); setShowEmergency(false); }} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Alert Orchestration</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Monitor, acknowledge, and escalate safety alerts across all systems</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(0,212,255,0.15)] text-[#7fa3c4] hover:text-cyan-400 text-xs transition-all">
            <Volume2 className="w-4 h-4" />
            Siren Test
          </button>
        </div>
      </div>

      {/* Severity tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'emergency', 'critical', 'warning', 'info'] as const).map((sev) => {
          const color = sev === 'all' ? '#7fa3c4' : getSeverityColor(sev);
          const count = counts[sev];
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize', filter === sev ? 'text-white' : 'text-[#7fa3c4] hover:text-white')}
              style={filter === sev ? { background: `${color}20`, border: `1px solid ${color}50`, color } : { border: '1px solid rgba(0,212,255,0.1)' }}
            >
              {sev}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono" style={{ background: `${color}20`, color }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAck={() => acknowledgeAlert(alert.id, user.name)}
              onResolve={() => resolveAlert(alert.id)}
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-[#7fa3c4]">No alerts matching the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
