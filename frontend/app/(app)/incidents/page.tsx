'use client';

import { useMemo, useState } from 'react';
import { Activity, CheckCircle2, ChevronDown, ChevronUp, Search, Shield } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import type { Incident, IncidentStatus, OperationalRole } from '@/types';
import { formatRelativeTime, getSeverityColor } from '@/lib/utils';

const ROLES: OperationalRole[] = [
  'Safety Officer',
  'Shift Supervisor',
  'Maintenance Engineer',
  'Control Room Operator',
];

const INCIDENT_STATES: IncidentStatus[] = ['open', 'investigating', 'resolved', 'closed'];

export default function IncidentTrackingPage() {
  const incidents = useSimulationDomainStore((state) => state.incidents);
  const transitionIncident = useSimulationDomainStore((state) => state.transitionIncident);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IncidentStatus | 'all'>('all');
  const [actorRole, setActorRole] = useState<OperationalRole>('Safety Officer');
  const [notes, setNotes] = useState('Reviewed and recorded in the simulation environment.');

  const filtered = useMemo(() => incidents.filter((incident) => {
    const matchesSearch = !search || `${incident.id} ${incident.title} ${incident.zone}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === 'all' || incident.status === status);
  }), [incidents, search, status]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Incident Tracking</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Investigate and close incidents created by controlled safety scenarios</p>
      </div>

      <section className="glass-card p-4 grid grid-cols-1 lg:grid-cols-[1fr_220px_1fr] gap-3">
        <label>
          <span className="block text-[#587996] text-[10px] uppercase mb-1.5">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#587996]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="field pl-9" placeholder="ID, incident, or zone" />
          </div>
        </label>
        <label>
          <span className="block text-[#587996] text-[10px] uppercase mb-1.5">Actor Role</span>
          <select value={actorRole} onChange={(event) => setActorRole(event.target.value as OperationalRole)} className="field">
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-[#587996] text-[10px] uppercase mb-1.5">Transition Notes</span>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} className="field" />
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        {(['all', ...INCIDENT_STATES] as const).map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`px-3 py-2 rounded-lg border text-xs font-mono uppercase ${
              status === item ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400' : 'border-[rgba(0,212,255,0.12)] text-[#7fa3c4]'
            }`}
          >
            {item} {item === 'all' ? incidents.length : incidents.filter((incident) => incident.status === item).length}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onTransition={(nextStatus) => transitionIncident(incident.id, nextStatus, actorRole, notes)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="glass-card py-16 text-center">
            <CheckCircle2 className="w-9 h-9 text-green-400 mx-auto mb-3" />
            <p className="text-white text-sm">No incidents found</p>
            <p className="text-[#587996] text-xs mt-1">Controlled scenarios can create linked incident records.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IncidentCard({ incident, onTransition }: { incident: Incident; onTransition: (status: IncidentStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = getSeverityColor(incident.severity);
  return (
    <article className="glass-card p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color, background: `${color}14`, border: `1px solid ${color}35` }}>
          {incident.status === 'resolved' || incident.status === 'closed' ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border" style={{ color, borderColor: `${color}40`, background: `${color}12` }}>{incident.severity}</span>
            <span className="text-[10px] uppercase font-mono text-cyan-400 border border-cyan-400/25 px-2 py-0.5 rounded">{incident.status}</span>
            <span className="text-[#3a5a7a] text-[10px] font-mono">{incident.id}</span>
          </div>
          <h2 className="text-white text-sm font-semibold mt-2">{incident.title}</h2>
          <p className="text-[#7fa3c4] text-xs mt-1">{incident.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#587996] text-[10px] font-mono mt-3">
            <span>{incident.zone}</span>
            <span>Assigned: {incident.assignedTo ?? 'Safety Officer'}</span>
            <span>{formatRelativeTime(incident.createdAt)}</span>
            {incident.originatingAlertId && <span>Alert {incident.originatingAlertId}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {incident.status === 'open' && <button onClick={() => onTransition('investigating')} className="action-button text-blue-400 border-blue-400/30">Investigate</button>}
          {(incident.status === 'open' || incident.status === 'investigating') && <button onClick={() => onTransition('resolved')} className="action-button text-green-400 border-green-400/30">Resolve</button>}
          {incident.status === 'resolved' && <button onClick={() => onTransition('closed')} className="action-button text-cyan-400 border-cyan-400/30">Close</button>}
          <button onClick={() => setExpanded((value) => !value)} className="p-2 rounded-lg border border-[rgba(0,212,255,0.15)] text-[#7fa3c4]" title="Toggle audit history">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.08)]">
          <div className="flex items-center gap-2 text-[#7fa3c4] text-xs uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" /> Audit History
          </div>
          <div className="space-y-2">
            {(incident.auditHistory ?? []).map((entry) => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[130px_180px_1fr] gap-2 text-xs">
                <span className="text-cyan-400 uppercase font-mono">{entry.status}</span>
                <span className="text-[#7fa3c4]">{entry.actorRole}</span>
                <span className="text-[#587996]">{entry.notes} · {new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
