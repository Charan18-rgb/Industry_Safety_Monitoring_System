'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Camera } from 'lucide-react';

interface VisionAuditEntry {
  id: string;
  timestamp: string;
  type: 'helmet' | 'ppe';
  compliant: boolean;
  confidence: number;
  detections: string[];
  imageUrl?: string;
}

const MOCK_AUDIT_LOG: VisionAuditEntry[] = [
  { id: 'VIS-001', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'helmet', compliant: true, confidence: 0.98, detections: ['helmet', 'person'] },
  { id: 'VIS-002', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'helmet', compliant: false, confidence: 0.92, detections: ['person'] },
  { id: 'VIS-003', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'ppe', compliant: true, confidence: 0.95, detections: ['vest', 'person'] },
  { id: 'VIS-004', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'ppe', compliant: false, confidence: 0.88, detections: ['person'] },
];

export default function VisionAuditPage() {
  const [filter, setFilter] = useState<'all' | 'violation'>('all');

  const filteredLog = MOCK_AUDIT_LOG.filter(entry => filter === 'all' || !entry.compliant);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">AI Vision Audit Log</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Historical AI surveillance detection records</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${filter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-[#040c14] text-[#7fa3c4] border border-[#7fa3c4]/20'}`}
          >
            ALL ENTRIES
          </button>
          <button 
            onClick={() => setFilter('violation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${filter === 'violation' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-[#040c14] text-[#7fa3c4] border border-[#7fa3c4]/20'}`}
          >
            VIOLATIONS ONLY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredLog.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-5 relative overflow-hidden group border-l-4 ${entry.compliant ? 'border-l-green-500' : 'border-l-red-500'}`}
            >
              <div className="flex items-center gap-6">
                {/* Snapshot Placeholder */}
                <div className="w-24 h-24 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/30 transition-colors overflow-hidden">
                  <Camera className="w-6 h-6 text-[#1e3a5a]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-bold tracking-tight">
                      {entry.type === 'helmet' ? 'Helmet Compliance Check' : 'PPE / Vest Detection'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${entry.compliant ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {entry.compliant ? 'PASS' : 'VIOLATION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div className="space-y-1">
                      <div className="text-[#3a5a7a] text-[10px] font-mono uppercase tracking-widest">Entry ID</div>
                      <div className="text-white text-xs font-mono">{entry.id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[#3a5a7a] text-[10px] font-mono uppercase tracking-widest">Timestamp</div>
                      <div className="text-white text-xs font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[#3a5a7a] text-[10px] font-mono uppercase tracking-widest">Confidence</div>
                      <div className="text-white text-xs font-mono">{Math.round(entry.confidence * 100)}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[#3a5a7a] text-[10px] font-mono uppercase tracking-widest">Detections</div>
                      <div className="text-white text-xs font-mono capitalize">{entry.detections.join(', ')}</div>
                    </div>
                  </div>
                </div>


              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
