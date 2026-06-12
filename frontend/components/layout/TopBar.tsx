'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Wifi, Clock, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import { formatTimestamp } from '@/lib/utils';

export function TopBar() {
  const { user, logout } = useAuthStore();
  const alerts = useSimulationDomainStore((state) => state.alerts);
  const activeScenario = useSimulationDomainStore((state) => state.activeScenario);
  const startScenario = useSimulationDomainStore((state) => state.startScenario);
  const resetSimulation = useSimulationDomainStore((state) => state.resetSimulation);
  const isConnected = useSimulationDomainStore((state) => state.isConnected);
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);

  const activeCount = alerts.filter((alert) => alert.status !== 'resolved').length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const roleColors: Record<string, string> = {
    admin: 'text-purple-400',
    safety_officer: 'text-cyan-400',
    plant_manager: 'text-blue-400',
    operator: 'text-green-400',
  };

  return (
    <header className="h-16 bg-[#020c18]/95 backdrop-blur-md border-b border-[rgba(0,212,255,0.1)] flex items-center px-6 gap-4 relative z-30 flex-shrink-0">
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="flex-1 flex items-center gap-2 text-[#7fa3c4]">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono hidden sm:inline">Industrial Safety Monitoring Platform</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-2 text-[#3a5a7a]">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-xs text-[#7fa3c4]">{formatTimestamp(time)}</span>
        </div>

        {/* Connection status */}
        <div className={`flex items-center gap-1.5 ${isConnected ? 'text-green-400' : 'text-amber-400'}`}>
          <Wifi className="w-4 h-4" />
          <span className="text-xs font-mono hidden sm:inline">Simulation Environment</span>
        </div>

        {/* Simulation menu */}
        <div className="relative">
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
              activeScenario
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.1)] text-[#7fa3c4] hover:text-cyan-400 hover:border-cyan-400/30'
            }`}
          >
            <span>Simulate</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <AnimatePresence>
            {showSimMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card-bright rounded-xl overflow-hidden z-50 p-1"
              >
                <button
                  onClick={() => { startScenario('gas_leak'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#7fa3c4] hover:text-white hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
                >
                  Simulate Gas Leak
                </button>
                <button
                  onClick={() => { startScenario('high_temperature'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#7fa3c4] hover:text-white hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
                >
                  Simulate High Temp
                </button>
                <button
                  onClick={() => { startScenario('machine_fault'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#7fa3c4] hover:text-white hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
                >
                  Simulate Machine Fault
                </button>
                <button
                  onClick={() => { startScenario('ppe_violation'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#7fa3c4] hover:text-white hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
                >
                  Simulate PPE Violation
                </button>
                <div className="h-px bg-[rgba(0,212,255,0.1)] my-1" />
                <button
                  onClick={() => { resetSimulation(); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                >
                  Reset System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alert bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-9 h-9 rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] flex items-center justify-center text-[#7fa3c4] hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </button>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] hover:border-cyan-400/30 transition-all duration-200"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{user?.name.charAt(0)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-white text-xs font-medium leading-none mb-0.5">{user?.name}</div>
              <div className={`text-[10px] font-mono capitalize leading-none ${roleColors[user?.role ?? ''] ?? 'text-[#7fa3c4]'}`}>
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#3a5a7a] hidden sm:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 glass-card-bright rounded-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-[rgba(0,212,255,0.1)]">
                  <div className="text-white text-sm font-medium">{user?.name}</div>
                  <div className="text-[#7fa3c4] text-xs font-mono mt-0.5">{user?.email}</div>
                  <div className="text-[#3a5a7a] text-xs mt-1">{user?.plant}</div>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
