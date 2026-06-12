'use client';

import { Bell, CheckCircle2, Mail, MessageSquare, Monitor } from 'lucide-react';
import { useSimulationDomainStore } from '@/store/simulationDomain';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const notifications = useSimulationDomainStore((state) => state.notifications);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide">Notifications</h1>
        <p className="text-[#7fa3c4] text-sm mt-1">Local delivery records from the Notification Simulation Engine</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Summary label="Email" value={notifications.filter((item) => item.channel === 'Email').length} icon={Mail} />
        <Summary label="WhatsApp" value={notifications.filter((item) => item.channel === 'WhatsApp').length} icon={MessageSquare} />
        <Summary label="In-App" value={notifications.filter((item) => item.channel === 'In-App').length} icon={Monitor} />
      </div>

      <section className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h2 className="text-white text-sm font-semibold">Delivery Records</h2>
        </div>
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-9 h-9 text-green-400 mx-auto mb-3" />
            <p className="text-white text-sm">No notification records</p>
            <p className="text-[#587996] text-xs mt-1">A scenario will create local simulated delivery entries.</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(0,212,255,0.05)]">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-5 py-4 grid grid-cols-1 md:grid-cols-[170px_1fr_160px_100px] gap-3 items-center">
                <div>
                  <div className="text-cyan-400 text-xs font-mono">{notification.channel ?? 'In-App'}</div>
                  <div className="text-[#3a5a7a] text-[10px] mt-1">{notification.id}</div>
                </div>
                <div>
                  <div className="text-white text-sm">{notification.alertType}</div>
                  <div className="text-[#7fa3c4] text-xs mt-1">{notification.message ?? 'Simulated notification record.'}</div>
                </div>
                <div className="text-[#7fa3c4] text-xs">{notification.recipientRole ?? 'Safety Officer'}</div>
                <div className="md:text-right">
                  <div className="text-green-400 text-[10px] font-mono uppercase">{notification.status ?? 'delivered'}</div>
                  <div className="text-[#3a5a7a] text-[10px] mt-1">{formatRelativeTime(notification.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Mail }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center"><Icon className="w-4 h-4 text-cyan-400" /></div>
      <div><div className="text-white text-xl font-mono">{value}</div><div className="text-[#587996] text-xs">{label}</div></div>
    </div>
  );
}
