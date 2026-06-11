'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, Download, Plus, Eye,
  CheckCircle, Activity, X, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockIncidents } from '@/lib/mockData';
import { useIncidentStore } from '@/store';
import { getSeverityColor, formatRelativeTime } from '@/lib/utils';
import type { Incident, IncidentSeverity } from '@/types';

const SEVERITY_ORDER: IncidentSeverity[] = ['emergency', 'critical', 'warning', 'info'];

const CATEGORY_LABELS: Record<string, string> = {
  gas_leak: 'Gas Leak',
  overheating: 'Overheating',
  vibration_anomaly: 'Vibration Anomaly',
  ppe_violation: 'PPE Violation',
  helmet_violation: 'Helmet Violation',
  emergency_shutdown: 'Emergency Shutdown',
  equipment_failure: 'Equipment Failure',
  environmental: 'Environmental',
};

function IncidentRow({ incident, onSelect }: { incident: Incident; onSelect: (i: Incident) => void }) {
  const sevColor = getSeverityColor(incident.severity);
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.03)] transition-colors cursor-pointer group"
      onClick={() => onSelect(incident)}
    >
      <td className="px-5 py-4">
        <span className="font-mono text-[#7fa3c4] text-xs">{incident.id}</span>
      </td>
      <td className="px-5 py-4 max-w-xs">
        <div className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">{incident.title}</div>
        {incident.equipment && <div className="text-[#3a5a7a] text-xs font-mono mt-0.5">{incident.equipment}</div>}
      </td>
      <td className="px-5 py-4">
        <span className="text-[#7fa3c4] text-xs">{CATEGORY_LABELS[incident.category] ?? incident.category}</span>
      </td>
      <td className="px-5 py-4">
        <span className="font-mono text-[#7fa3c4] text-xs">{incident.zone}</span>
      </td>
      <td className="px-5 py-4">
        <span className="px-2 py-1 rounded text-[10px] font-bold font-mono uppercase"
          style={{ color: sevColor, background: `${sevColor}15`, border: `1px solid ${sevColor}30` }}>
          {incident.severity}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {incident.status === 'resolved' || incident.status === 'closed'
            ? <CheckCircle className="w-4 h-4 text-green-400" />
            : incident.status === 'investigating'
              ? <Activity className="w-4 h-4 text-cyan-400" />
              : incident.status === 'acknowledged'
                ? <Eye className="w-4 h-4 text-blue-400" />
                : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span className="text-xs text-[#7fa3c4] capitalize">{incident.status}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="text-[#7fa3c4] text-xs">{incident.assignedTo ?? '—'}</div>
      </td>
      <td className="px-5 py-4">
        <div className="text-[#3a5a7a] text-xs font-mono">{formatRelativeTime(incident.createdAt)}</div>
      </td>
      <td className="px-5 py-4">
        <button className="p-1.5 rounded-lg text-[#7fa3c4] hover:text-cyan-400 hover:bg-cyan-400/10 transition-all">
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
}

function exportIncidentPDF(incident: Incident) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('AEGIS-AI — Incident Report', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.setTextColor(0);
  autoTable(doc, {
    startY: 35,
    head: [['Field', 'Value']],
    body: [
      ['Incident ID', incident.id],
      ['Title', incident.title],
      ['Category', incident.category],
      ['Zone', incident.zone],
      ['Severity', incident.severity],
      ['Status', incident.status],
      ['Reported By', incident.reportedBy],
      ['Assigned To', incident.assignedTo ?? 'Unassigned'],
      ['Created', new Date(incident.createdAt).toLocaleString()],
      ['Updated', new Date(incident.updatedAt).toLocaleString()],
      ['Description', incident.description],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 102, 255] },
  });
  doc.save(`Incident_${incident.id}.pdf`);
}

function exportAllIncidents(incidents: Incident[]) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('AEGIS-AI — Incident Summary Report', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()} · Total: ${incidents.length} incidents`, 14, 28);
  doc.setTextColor(0);
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Title', 'Severity', 'Status', 'Zone', 'Created']],
    body: incidents.map((i) => [
      i.id,
      i.title,
      i.severity,
      i.status,
      i.zone,
      new Date(i.createdAt).toLocaleString(),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 102, 255] },
  });
  doc.save(`AEGIS_Incident_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

function IncidentDetail({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const { updateIncident } = useIncidentStore();
  const sevColor = getSeverityColor(incident.severity);

  const acknowledge = () => updateIncident(incident.id, { status: 'acknowledged', updatedAt: new Date().toISOString() });
  const resolve = () => updateIncident(incident.id, { status: 'resolved', resolvedAt: new Date().toISOString() });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-[480px] bg-[#020c18] border-l border-[rgba(0,212,255,0.15)] z-50 flex flex-col shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Header */}
      <div className="p-6 border-b border-[rgba(0,212,255,0.08)]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[#7fa3c4] text-xs">{incident.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                style={{ color: sevColor, background: `${sevColor}15`, border: `1px solid ${sevColor}30` }}>
                {incident.severity}
              </span>
            </div>
            <h2 className="text-white font-semibold text-base leading-snug">{incident.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#7fa3c4] hover:text-white transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {incident.status === 'open' && (
            <button onClick={acknowledge} className="flex-1 py-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/25 transition-all">
              Acknowledge
            </button>
          )}
          {(incident.status === 'open' || incident.status === 'acknowledged' || incident.status === 'investigating') && (
            <button onClick={resolve} className="flex-1 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-all">
              Mark Resolved
            </button>
          )}
          <button
            onClick={() => exportIncidentPDF(incident)}
            className="py-2 px-3 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-cyan-400 text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all flex items-center gap-1.5"
            title="Download PDF"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Detail content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="glass-card p-4">
          <h3 className="text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-3">Description</h3>
          <p className="text-[#e8f4ff] text-sm leading-relaxed">{incident.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Category', value: CATEGORY_LABELS[incident.category] },
            { label: 'Zone', value: incident.zone },
            { label: 'Status', value: incident.status },
            { label: 'Equipment', value: incident.equipment ?? 'N/A' },
            { label: 'Reported By', value: incident.reportedBy },
            { label: 'Assigned To', value: incident.assignedTo ?? 'Unassigned' },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card p-3">
              <div className="text-[#3a5a7a] text-[10px] uppercase tracking-widest mb-1">{label}</div>
              <div className="text-[#e8f4ff] text-xs font-medium capitalize">{value}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-3">Timeline</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#7fa3c4]" />
              <span className="text-[#7fa3c4]">Created:</span>
              <span className="text-white font-mono">{new Date(incident.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#7fa3c4]" />
              <span className="text-[#7fa3c4]">Updated:</span>
              <span className="text-white font-mono">{new Date(incident.updatedAt).toLocaleString()}</span>
            </div>
            {incident.resolvedAt && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Resolved:</span>
                <span className="text-white font-mono">{new Date(incident.resolvedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {incident.tags.length > 0 && (
          <div>
            <div className="text-[#3a5a7a] text-[10px] uppercase tracking-widest mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {incident.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full border border-[rgba(0,212,255,0.15)] text-cyan-400 text-[10px] font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {incident.notes && (
          <div className="glass-card p-4">
            <h3 className="text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">Notes</h3>
            <p className="text-[#e8f4ff] text-sm">{incident.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function IncidentsPage() {
  const { incidents, setIncidents } = useIncidentStore();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);

  // Seed incidents
  useEffect(() => {
    if (incidents.length === 0) setIncidents(mockIncidents);
  }, [incidents.length, setIncidents]);

  const displayIncidents = incidents.length > 0 ? incidents : mockIncidents;

  const filtered = useMemo(() => {
    return displayIncidents
      .filter((i) => {
        if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.id.includes(search.toUpperCase())) return false;
        if (severityFilter.length > 0 && !severityFilter.includes(i.severity)) return false;
        if (statusFilter.length > 0 && !statusFilter.includes(i.status)) return false;
        return true;
      })
      .sort((a, b) => {
        const ai = SEVERITY_ORDER.indexOf(a.severity);
        const bi = SEVERITY_ORDER.indexOf(b.severity);
        if (ai !== bi) return ai - bi;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [displayIncidents, search, severityFilter, statusFilter]);

  const counts = {
    open: displayIncidents.filter((i) => i.status === 'open').length,
    critical: displayIncidents.filter((i) => i.severity === 'critical' || i.severity === 'emergency').length,
    resolved: displayIncidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">Incident Management</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Track, investigate, and resolve safety incidents across all zones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all">
          <Plus className="w-4 h-4" />
          New Incident
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open', value: counts.open, color: '#ffb800' },
          { label: 'Critical', value: counts.critical, color: '#ff3355' },
          { label: 'Resolved', value: counts.resolved, color: '#00ff88' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ background: color }} />
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
              <div className="text-[#7fa3c4] text-xs">{label} Incidents</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or ID..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.1)] text-white placeholder-[#3a5a7a] outline-none text-sm focus:border-cyan-400/30 transition-all"
            />
          </div>

          {/* Severity quick filter */}
          <div className="flex gap-2">
            {(['emergency', 'critical', 'warning', 'info'] as IncidentSeverity[]).map((sev) => {
              const color = getSeverityColor(sev);
              const active = severityFilter.includes(sev);
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter((prev) => active ? prev.filter((s) => s !== sev) : [...prev, sev])}
                  className="px-2.5 py-1.5 rounded text-[10px] font-bold font-mono uppercase transition-all"
                  style={{
                    color,
                    background: active ? `${color}25` : `${color}10`,
                    border: `1px solid ${active ? color : `${color}30`}`,
                  }}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 ml-auto">
            {severityFilter.length > 0 && (
              <button onClick={() => { setSeverityFilter([]); setStatusFilter([]); setSearch(''); }}
                className="text-xs text-[#7fa3c4] hover:text-white flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={() => exportAllIncidents(displayIncidents)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(0,212,255,0.15)] text-[#7fa3c4] hover:text-cyan-400 text-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.08)]">
                {['ID', 'Incident', 'Category', 'Zone', 'Severity', 'Status', 'Assigned To', 'Reported', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[#7fa3c4] text-xs font-medium tracking-widest uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-[#3a5a7a] text-sm">
                    No incidents match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <IncidentRow key={inc.id} incident={inc} onSelect={setSelected} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[rgba(0,212,255,0.06)] text-[#3a5a7a] text-xs font-mono">
          Showing {filtered.length} of {displayIncidents.length} incidents
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)}
            />
            <IncidentDetail incident={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
