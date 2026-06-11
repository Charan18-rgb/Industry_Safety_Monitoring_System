'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Sliders, Monitor, Database, Users, Save, CheckCircle, Zap, Mail, Loader2, XCircle, MessageSquare, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendTestEmail, sendTestWhatsApp } from '@/lib/email';
import { useNotificationStore } from '@/store';

const SECTIONS = [
  { id: 'thresholds', icon: Sliders, label: 'Thresholds' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'system', icon: Database, label: 'System' },
  { id: 'display', icon: Monitor, label: 'Display' },
  { id: 'users', icon: Users, label: 'Access Control' },
];

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn('w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0', value ? 'bg-cyan-500' : 'bg-[rgba(255,255,255,0.1)]')}
    >
      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200', value ? 'left-5' : 'left-0.5')} />
    </button>
  );
}

function ThresholdRow({ label, warning, critical, unit, onSave }: {
  label: string; warning: number; critical: number; unit: string;
  onSave: (w: number, c: number) => void;
}) {
  const [w, setW] = useState(warning);
  const [c, setC] = useState(critical);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[rgba(0,212,255,0.06)]">
      <div className="flex-1">
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-[#3a5a7a] text-xs font-mono">{unit}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-xs font-mono w-8">WARN</span>
        <input
          type="number"
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          className="w-16 px-2 py-1 rounded text-center bg-[rgba(255,184,0,0.08)] border border-amber-400/30 text-amber-400 text-xs font-mono outline-none focus:border-amber-400/60"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-xs font-mono w-8">CRIT</span>
        <input
          type="number"
          value={c}
          onChange={(e) => setC(Number(e.target.value))}
          className="w-16 px-2 py-1 rounded text-center bg-[rgba(255,51,85,0.08)] border border-red-400/30 text-red-400 text-xs font-mono outline-none focus:border-red-400/60"
        />
      </div>
      <button
        onClick={() => onSave(w, c)}
        className="px-2.5 py-1 rounded text-[10px] text-cyan-400 border border-cyan-400/25 hover:bg-cyan-400/10 transition-all font-mono"
      >
        Save
      </button>
    </div>
  );
}

function SendTestEmailButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    setStatus('sending');
    setMessage('');
    console.log('[Settings] Sending test email...');
    const result = await sendTestEmail();
    if (result.emailStatus === 'success' || result.whatsappStatus === 'success') {
      setStatus('success');
      setMessage(`Test notification dispatched.`);
      console.log('[Settings] Test notification dispatched:', result);
    } else {
      setStatus('error');
      setMessage('Failed to dispatch test notification');
      console.error('[Settings] Test notification failed:', result);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
          status === 'sending'
            ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 cursor-wait'
            : 'bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 hover:bg-cyan-500/25'
        )}
      >
        {status === 'sending' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
        ) : (
          <><Mail className="w-4 h-4" /> Send Test Email</>
        )}
      </button>
      {status === 'success' && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-green-400 text-xs font-medium">Email sent successfully!</div>
            <div className="text-green-400/70 text-[10px] font-mono mt-0.5 break-all">{message}</div>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 text-xs font-medium">Email failed to send</div>
            <div className="text-red-400/70 text-[10px] font-mono mt-0.5 break-all">{message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function SendTestWhatsAppButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    setStatus('sending');
    setMessage('');
    console.log('[Settings] Sending test WhatsApp...');
    const result = await sendTestWhatsApp();
    if (result.whatsappStatus === 'success') {
      setStatus('success');
      setMessage(`Test WhatsApp dispatched.`);
      console.log('[Settings] Test WhatsApp dispatched:', result);
    } else {
      setStatus('error');
      setMessage(result.whatsappError || 'Failed to dispatch test WhatsApp');
      console.error('[Settings] Test WhatsApp failed:', result);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
          status === 'sending'
            ? 'bg-green-500/10 border border-green-400/20 text-green-400 cursor-wait'
            : 'bg-green-500/15 border border-green-400/25 text-green-400 hover:bg-green-500/25'
        )}
      >
        {status === 'sending' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
        ) : (
          <><MessageSquare className="w-4 h-4" /> Send Test WhatsApp</>
        )}
      </button>
      {status === 'success' && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-green-400 text-xs font-medium">WhatsApp sent successfully!</div>
            <div className="text-green-400/70 text-[10px] font-mono mt-0.5 break-all">{message}</div>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 text-xs font-medium">WhatsApp failed to send</div>
            <div className="text-red-400/70 text-[10px] font-mono mt-0.5 break-all">{message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('thresholds');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    push: false,
    critical: true,
    warning: true,
    info: false,
  });

  const notificationStore = useNotificationStore();
  const lastEmail = notificationStore.logs.find(l => l.emailStatus === 'success');
  const lastWhatsapp = notificationStore.logs.find(l => l.whatsappStatus === 'success');

const [system, setSystem] = useState({
  plantName: '',
  timezone: 'UTC',
  refreshInterval: 10,
  retentionDays: 90,
  autoAcknowledge: false,
});
// Load saved settings from localStorage on mount
const [thresholds, setThresholds] = useState([
  { label: 'Gas', warning: 35, critical: 70, unit: 'ppm' },
  { label: 'Temperature', warning: 75, critical: 100, unit: '°C' },
  { label: 'Pressure', warning: 150, critical: 250, unit: 'kPa' },
]);

const updateThreshold = (label: string, warning: number, critical: number) => {
  setThresholds(prev =>
    prev.map(t => (t.label === label ? { ...t, warning, critical } : t))
  );
};
useEffect(() => {
  const saved = localStorage.getItem('aegis-settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Wait to set state to avoid cascading updates in render phase
      setTimeout(() => {
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.system) setSystem(parsed.system);
        if (parsed.thresholds) setThresholds(parsed.thresholds);
      }, 0);
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
  }
}, []);

// Persist settings on save
const handleSave = () => {
  const payload = { notifications, system, thresholds };
  localStorage.setItem('aegis-settings', JSON.stringify(payload));
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-wide">System Settings</h1>
          <p className="text-[#7fa3c4] text-sm mt-0.5">Configure thresholds, alerts, and platform preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar nav */}
        <div className="col-span-12 lg:col-span-3">
          <div className="glass-card p-2 space-y-0.5">
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all', activeSection === id ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-[#7fa3c4] hover:text-white hover:bg-[rgba(0,212,255,0.05)] border border-transparent')}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 lg:col-span-9">
          {activeSection === 'thresholds' && (
            <div className="glass-card p-5">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Sensor Alert Thresholds
              </h2>
              <p className="text-[#7fa3c4] text-xs mb-4">
                Configure warning and critical thresholds for each sensor type. Changes take effect immediately.
              </p>
              {thresholds.map((t) => (
                <ThresholdRow key={t.label} {...t} onSave={(w, c) => updateThreshold(t.label, w, c)} />
              ))}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card p-5 space-y-6">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                Notification Settings
              </h2>

              <div className="glass-card p-4 bg-[rgba(0,212,255,0.02)] border border-[rgba(0,212,255,0.08)] mb-6">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Notification System Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-[#7fa3c4]">Email Service <span className="text-green-400 font-medium">Online</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-[#7fa3c4]">WhatsApp Service <span className="text-green-400 font-medium">Online</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-[#7fa3c4]">Notification Tracking <span className="text-green-400 font-medium">Active</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-[#7fa3c4]">Delivery Monitoring <span className="text-green-400 font-medium">Active</span></span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[#7fa3c4] text-xs uppercase tracking-widest mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]">
                    <div className="flex gap-3 items-start">
                      <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <div className="text-white text-sm font-medium">Email Notifications</div>
                        <div className="text-[#3a5a7a] text-xs">Send alerts to registered email addresses</div>
                        {lastEmail && (
                          <div className="text-green-400 text-[10px] font-mono mt-1">Last Sent: {new Date(lastEmail.timestamp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <ToggleSwitch
                      value={notifications.email}
                      onChange={(v) => setNotifications({ ...notifications, email: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]">
                    <div className="flex gap-3 items-start">
                      <MessageSquare className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="text-white text-sm font-medium">WhatsApp Notifications</div>
                        <div className="text-[#3a5a7a] text-xs">Instant delivery via Twilio API</div>
                        {lastWhatsapp && (
                          <div className="text-green-400 text-[10px] font-mono mt-1">Last Sent: {new Date(lastWhatsapp.timestamp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <ToggleSwitch
                      value={notifications.whatsapp}
                      onChange={(v) => setNotifications({ ...notifications, whatsapp: v })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[#7fa3c4] text-xs uppercase tracking-widest mb-3">Severity Filter</h3>
                <div className="space-y-2">
                  {['critical', 'warning', 'info'].map((s) => (
                    <div key={s} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,212,255,0.08)]">
                      <span className="text-white text-sm capitalize">{s} alerts</span>
                      <ToggleSwitch
                        value={notifications[s as keyof typeof notifications] as boolean}
                        onChange={(v) => setNotifications({ ...notifications, [s]: v })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[rgba(0,212,255,0.08)] pt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[#7fa3c4] text-xs uppercase tracking-widest mb-3">Test Email</h3>
                  <SendTestEmailButton />
                </div>
                <div>
                  <h3 className="text-[#7fa3c4] text-xs uppercase tracking-widest mb-3">Test WhatsApp</h3>
                  <SendTestWhatsAppButton />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="glass-card p-5 space-y-5">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                System Configuration
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">Plant Name</label>
                  <input
                    value={system.plantName}
                    onChange={(e) => setSystem({ ...system, plantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white text-sm outline-none focus:border-cyan-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">Timezone</label>
                  <select
                    value={system.timezone}
                    onChange={(e) => setSystem({ ...system, timezone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white text-sm outline-none focus:border-cyan-400/40 transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    {['UTC', 'UTC+5:30', 'UTC+8', 'UTC-5', 'UTC-8'].map((tz) => (
                      <option key={tz} value={tz} style={{ background: '#040c14' }}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">Telemetry Refresh (seconds)</label>
                  <input
                    type="number"
                    value={system.refreshInterval}
                    onChange={(e) => setSystem({ ...system, refreshInterval: Number(e.target.value) })}
                    min={1} max={60}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white text-sm outline-none focus:border-cyan-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    value={system.retentionDays}
                    onChange={(e) => setSystem({ ...system, retentionDays: Number(e.target.value) })}
                    min={30} max={365}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white text-sm outline-none focus:border-cyan-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,212,255,0.08)]">
                <div>
                  <div className="text-white text-sm font-medium">Auto-Acknowledge Low Priority</div>
                  <div className="text-[#3a5a7a] text-xs">Automatically acknowledge info-level alerts after 24h</div>
                </div>
                <ToggleSwitch value={system.autoAcknowledge} onChange={(v) => setSystem({ ...system, autoAcknowledge: v })} />
              </div>

              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-semibold">Danger Zone</span>
                </div>
                <p className="text-[#7fa3c4] text-xs mb-3">These actions are irreversible. Proceed with caution.</p>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-all">
                    Reset All Thresholds
                  </button>
                  <button className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-all">
                    Clear Historical Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeSection === 'display' || activeSection === 'users') && (
            <div className="glass-card p-12 text-center">
              <Settings className="w-8 h-8 text-[#3a5a7a] mx-auto mb-3" />
              <p className="text-[#7fa3c4] text-sm">
                {activeSection === 'display' ? 'Display preferences' : 'Access control & user management'} — Coming soon
              </p>
              <p className="text-[#3a5a7a] text-xs mt-2 font-mono">AEGIS-CODEX-AI integration pending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
