'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, AlertTriangle, Activity, Map,
  Bell, BarChart3, Settings, ChevronLeft, ChevronRight,
  Zap, Radio, LogOut, Camera
} from 'lucide-react';
import { useAuthStore, useAlertStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command Center', badge: null },
  { href: '/incidents', icon: AlertTriangle, label: 'Incident Tracking', badge: 'incidents' },
  { href: '/telemetry', icon: Activity, label: 'Sensor Monitoring', badge: null },
  { href: '/digital-twin', icon: Map, label: 'Digital Twin', badge: null },
  { href: '/vision', icon: Camera, label: 'Camera Monitoring', badge: null },
  { href: '/executive', icon: BarChart3, label: 'Safety Analytics', badge: null },
  { href: '/alerts', icon: Bell, label: 'Alerts', badge: 'alerts' },
  { href: '/reports', icon: BarChart3, label: 'Reports', badge: null },
  { href: '/settings', icon: Settings, label: 'Settings', badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { activeCount, criticalCount } = useAlertStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const getBadge = (key: string | null) => {
    if (!key) return null;
    if (key === 'alerts' && activeCount > 0) return activeCount;
    return null;
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-[#020c18] border-r border-[rgba(0,212,255,0.1)] z-40 flex-shrink-0 overflow-hidden"
    >
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-[rgba(0,212,255,0.08)]">
        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="font-display text-sm font-black text-white tracking-widest leading-none">AEGIS</div>
              <div className="text-[#3a5a7a] text-[10px] font-mono tracking-wider">COMMAND CENTER</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status indicator */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-[10px] font-mono tracking-widest">ALL SYSTEMS ONLINE</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-[10px] font-mono">{criticalCount} CRITICAL ACTIVE</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 mt-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          const badgeCount = getBadge(badge);
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'text-[#7fa3c4] hover:bg-cyan-400/5 hover:text-white border border-transparent'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/10 to-transparent"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full" />
                )}
                <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap flex-1 relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {badgeCount && !sidebarCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                    {badgeCount}
                  </span>
                )}
                {badgeCount && sidebarCollapsed && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 status-critical" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-[rgba(0,212,255,0.08)]">
        <div
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm whitespace-nowrap">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg border border-[rgba(0,212,255,0.08)]">
          <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name.charAt(0) ?? 'U'}
            </span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user?.name ?? 'User'}</div>
                <div className="text-[#3a5a7a] text-[10px] capitalize truncate font-mono">
                  {user?.role?.replace('_', ' ')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={logout} className="text-[#3a5a7a] hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#020c18] border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-[#7fa3c4] hover:text-cyan-400 hover:border-cyan-400/40 transition-all duration-200 z-50"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
