'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAlertStore, useIncidentStore, useTelemetryStore } from '@/store';
import { useMemo } from 'react';
import { SensorHistoryPanel } from '@/components/dashboard/SensorHistoryPanel';

const COLORS = ['#00d4ff', '#ffb800', '#ff3355', '#7c3aed'];

export default function AnalyticsPage() {
  const { alerts } = useAlertStore();
  const { incidents } = useIncidentStore();
  const { riskScore } = useTelemetryStore();

  const alertDistributionData = useMemo(() => {
    let critical = 0, warning = 0, info = 0;
    alerts.forEach(a => {
      if (a.severity === 'critical') critical++;
      else if (a.severity === 'warning') warning++;
      else info++;
    });
    // Fallback to show something if zero
    if (critical === 0 && warning === 0 && info === 0) {
      return [{ name: 'No Alerts', value: 1 }];
    }
    return [
      { name: 'Critical', value: critical },
      { name: 'Warning', value: warning },
      { name: 'Info', value: info },
    ].filter(d => d.value > 0);
  }, [alerts]);

  const incidentStatsData = useMemo(() => {
    let open = 0, investigating = 0, resolved = 0;
    incidents.forEach(i => {
      if (i.status === 'open') open++;
      else if (i.status === 'investigating') investigating++;
      else if (i.status === 'resolved' || i.status === 'closed') resolved++;
    });
    if (open === 0 && investigating === 0 && resolved === 0) {
      return [{ name: 'No Incidents', value: 0 }];
    }
    return [
      { name: 'Open', value: open },
      { name: 'Investigating', value: investigating },
      { name: 'Resolved', value: resolved },
    ];
  }, [incidents]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide uppercase">System Analytics</h1>
        <p className="text-[#7fa3c4] text-sm mt-0.5 tracking-widest">Simplified risk and telemetry insights</p>
      </div>

      {/* Sensor History Panel (Tinkercad Integration) */}
      <SensorHistoryPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Overview */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4 font-mono tracking-widest text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Risk Overview
          </h3>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle
                  cx="70" cy="70" r="58" fill="none"
                  stroke={riskScore?.overall && riskScore.overall > 60 ? '#ff3355' : '#00d4ff'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - (riskScore?.overall || 0) / 100) }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-mono text-white">{riskScore?.overall || 0}</span>
                <span className="text-[#7fa3c4] text-[10px] tracking-widest">RISK SCORE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Removed mock Temperature Trend, now handled by SensorHistoryPanel */}
        {/* Alert Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4 font-mono tracking-widest text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Alert Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {alertDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 12, 24, 0.9)', borderColor: 'rgba(0, 212, 255, 0.2)', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Statistics */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4 font-mono tracking-widest text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Incident Statistics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentStatsData}>
                <XAxis dataKey="name" stroke="#3a5a7a" tick={{ fill: '#7fa3c4', fontSize: 10 }} />
                <YAxis stroke="#3a5a7a" tick={{ fill: '#7fa3c4', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 12, 24, 0.9)', borderColor: 'rgba(255, 51, 85, 0.2)', color: '#fff' }} />
                <Bar dataKey="value" fill="#ff3355" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
