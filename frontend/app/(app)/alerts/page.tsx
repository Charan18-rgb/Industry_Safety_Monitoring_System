'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import type { Alert, AlertStatus, OperationalRole } from '@/types';
import { formatRelativeTime, getSeverityColor } from '@/lib/utils';

const ROLES: OperationalRole[] = [
  'Safety Officer',
  'Shift Supervisor',
  'Maintenance Engineer',
  'Control Room Operator',
];

const STATUS_ORDER: AlertStatus[] = ['active', 'acknowledged', 'escalated', 'resolved'];

export default function AlertManagementPage() {
  const alerts = useSimulationDomainStore((state) => state.alerts);
  const transitionAlert = useSimulationDomainStore((state) => state.transitionAlert);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [actorRole, setActorRole] = useState<OperationalRole>('Safety Officer');
  const [notes, setNotes] = useState('Reviewed in the simulation environment.');

  const filtered = useMemo(
    () => alerts.filter((alert) => statusFilter === 'all' || alert.status === statusFilter),
    [alerts, statusFilter],
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Alert Management</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Acknowledge, escalate, and resolve simulated safety alerts</p>
      </div>

      <section className="glass-card p-4 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3">
        <label>
          <span className="block text-[#587996] text-[10px] uppercase mb-1.5">Actor Role</span>
          <select
            value={actorRole}
            onChange={(event) => setActorRole(event.target.value as OperationalRole)}
            className="w-full rounded-lg bg-[#071421] border border-[rgba(0,212,255,0.15)] text-white text-sm px-3 py-2 outline-none"
          >
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-[#587996] text-[10px] uppercase mb-1.5">Transition Notes</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg bg-[#071421] border border-[rgba(0,212,255,0.15)] text-white text-sm px-3 py-2 outline-none focus:border-cyan-400/40"
          />
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        {(['all', ...STATUS_ORDER] as const).map((status) => {
          const count = status === 'all' ? alerts.length : alerts.filter((alert) => alert.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg border text-xs font-mono uppercase transition-colors ${
                statusFilter === status
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                  : 'border-[rgba(0,212,255,0.12)] text-[#7fa3c4] hover:text-white'
              }`}
            >
              {status} {count}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onTransition={(status) => transitionAlert(alert.id, status, actorRole, notes)}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="glass-card py-16 text-center">
            <CheckCircle2 className="w-9 h-9 text-green-400 mx-auto mb-3" />
            <p className="text-white text-sm">No alerts in this state</p>
            <p className="text-[#587996] text-xs mt-1">Run a scenario from the top bar to create a controlled alert.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onTransition }: { alert: Alert; onTransition: (status: AlertStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = getSeverityColor(alert.severity);
  return (
    <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color, background: `${color}14`, border: `1px solid ${color}35` }}>
          {alert.status === 'resolved' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border" style={{ color, borderColor: `${color}40`, background: `${color}12` }}>{alert.severity}</span>
            <span className="text-[10px] uppercase font-mono text-cyan-400 border border-cyan-400/25 px-2 py-0.5 rounded">{alert.status}</span>
            <span className="text-[#3a5a7a] text-[10px] font-mono">{alert.id}</span>
          </div>
          <h2 className="text-white text-sm font-semibold mt-2">{alert.title}</h2>
          <p className="text-[#7fa3c4] text-xs mt-1">{alert.message}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#587996] text-[10px] font-mono mt-3">
            <span>{alert.zone}</span>
            <span>{alert.source}</span>
            <span>{formatRelativeTime(alert.timestamp)}</span>
            {alert.incidentId && <span>Incident {alert.incidentId}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {alert.status === 'active' && (
            <button onClick={() => onTransition('acknowledged')} className="action-button text-blue-400 border-blue-400/30">Acknowledge</button>
          )}
          {(alert.status === 'active' || alert.status === 'acknowledged') && (
            <button onClick={() => onTransition('escalated')} className="action-button text-amber-400 border-amber-400/30">Escalate</button>
          )}
          {alert.status !== 'resolved' && (
            <button onClick={() => onTransition('resolved')} className="action-button text-green-400 border-green-400/30">Resolve</button>
          )}
          <button onClick={() => setExpanded((value) => !value)} className="p-2 rounded-lg border border-[rgba(0,212,255,0.15)] text-[#7fa3c4]" title="Toggle audit history">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.08)]">
          <div className="flex items-center gap-2 text-[#7fa3c4] text-xs uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Audit History
          </div>
          <div className="space-y-2">
            {(alert.auditHistory ?? []).map((entry) => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[130px_180px_1fr] gap-2 text-xs">
                <span className="text-cyan-400 uppercase font-mono">{entry.status}</span>
                <span className="text-[#7fa3c4]">{entry.actorRole}</span>
                <span className="text-[#587996]">{entry.notes} · {new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.article>
  );
}
