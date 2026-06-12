'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';

export function EmergencyOverlay() {
  const alerts = useSimulationDomainStore((state) => state.alerts);
  const criticalCount = alerts.filter((alert) => alert.severity === 'critical' && alert.status !== 'resolved').length;
  const [showSiren, setShowSiren] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (criticalCount > 0) {
      // Flashing siren effect
      const interval = setInterval(() => {
        setShowSiren((prev) => !prev);
      }, 500);

      // AI Voice Alert
      if (!muted) {
        const msg = new SpeechSynthesisUtterance("Critical safety violation detected. All personnel please proceed to designated safety zones.");
        msg.rate = 0.9;
        msg.pitch = 0.8;
        window.speechSynthesis.speak(msg);
      }
      
      return () => clearInterval(interval);
    }
  }, [criticalCount, muted]);

  if (criticalCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-10"
      >
        {/* Fullscreen pulsing red border */}
        <motion.div
          animate={{
            boxShadow: [
              'inset 0 0 0px rgba(255, 51, 85, 0)',
              'inset 0 0 100px rgba(255, 51, 85, 0.4)',
              'inset 0 0 0px rgba(255, 51, 85, 0)',
            ],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none border-4 border-red-500/50"
        />

        {/* Floating warning banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center gap-4 px-8 py-4 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto border-2 ${showSiren ? 'bg-red-600 border-red-400 text-white shadow-red-500/50' : 'bg-black/90 border-red-600/50 text-red-500'}`}
        >
          <ShieldAlert className="w-8 h-8 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-2xl font-black font-display tracking-widest leading-none">
              EMERGENCY PROTOCOL ENGAGED
            </span>
            <span className="text-xs font-mono opacity-80 mt-1">
              {criticalCount} CRITICAL INCIDENTS REQUIRE IMMEDIATE ATTENTION
            </span>
          </div>
          <div className="flex items-center gap-3 ml-4">
             <button 
               onClick={() => setMuted(!muted)}
               className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
             >
               {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
             </button>
             <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
