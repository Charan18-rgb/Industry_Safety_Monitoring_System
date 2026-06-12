'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import Link from 'next/link';

export function AlertBanner() {
  const alerts = useSimulationDomainStore((state) => state.alerts);

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status === 'active');
  const topCritical = criticalAlerts[0];

  if (!topCritical) return null;

  const alert = topCritical;
  const isEmergency = alert.severity === 'emergency';
  const criticalCount = criticalAlerts.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`flex-shrink-0 border-b ${isEmergency ? 'bg-red-500/15 border-red-500/40' : 'bg-red-500/10 border-red-500/25'}`}
      >
        <div className="flex items-center gap-3 px-6 py-2.5">
          <motion.div
            animate={isEmergency ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {isEmergency ? (
              <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <span className="text-red-400 text-xs font-bold font-mono tracking-widest mr-3">
              {isEmergency ? '⚡ EMERGENCY' : `⚠ CRITICAL`}
              {criticalCount > 1 && !isEmergency && ` (${criticalCount} active)`}
            </span>
            <span className="text-[#e8f4ff] text-xs truncate">{alert.title}</span>
            <span className="text-[#7fa3c4] text-xs ml-2 hidden sm:inline">— {alert.zone}</span>
          </div>

          <Link href="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono whitespace-nowrap flex-shrink-0">
            View All →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
