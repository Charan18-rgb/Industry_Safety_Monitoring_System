// AEGIS-AI Email Service — Client-side helper
// Calls the server-side API route at /api/send-email

import { useNotificationStore, useActivityStore } from '@/store';

export interface EmailPayload {
  subject: string;
  message: string;
  to?: string;
  type?: 'alert' | 'critical' | 'warning' | 'test' | 'info';
  details?: Record<string, string>;
  action?: string;
}

export interface WhatsAppPayload {
  alertType: string;
  severity: string;
  zone?: string;
  sensor?: string;
  reading?: string;
  action?: string;
  mediaUrl?: string;
}

export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export async function sendAlertEmail(payload: EmailPayload): Promise<EmailResult> {
  console.log('[AEGIS Email Client] Sending email:', payload.subject);
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('[AEGIS Email Client] Failed:', data.error);
      return { success: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return { success: true, emailId: data.emailId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

export async function sendWhatsAppAlert(payload: WhatsAppPayload): Promise<EmailResult> {
  console.log('[AEGIS WhatsApp Client] Sending message:', payload.alertType);
  try {
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('[AEGIS WhatsApp Client] Failed:', data.error);
      return { success: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return { success: true, emailId: data.messageId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

// ─── Unified Dispatcher ──────────────────────────────────────────────────

export async function dispatchNotification({
  emailPayload,
  whatsappPayload
}: {
  emailPayload?: EmailPayload;
  whatsappPayload?: WhatsAppPayload;
}) {
  const logId = `LOG-${Date.now()}`;
  
  // Read notification preferences from localStorage
  let emailEnabled = true;
  let whatsappEnabled = true;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('aegis-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) {
          emailEnabled = parsed.notifications.email !== false;
          whatsappEnabled = parsed.notifications.whatsapp !== false;
        }
      }
    } catch {
      // Ignore parse error
    }
  }
  
  // Create initial pending log
  useNotificationStore.getState().addLog({
    id: logId,
    alertType: whatsappPayload?.alertType ?? emailPayload?.subject ?? 'Unknown Alert',
    severity: whatsappPayload?.severity ?? emailPayload?.type?.toUpperCase() ?? 'INFO',
    emailStatus: emailEnabled && emailPayload ? 'pending' : 'disabled',
    whatsappStatus: whatsappEnabled && whatsappPayload ? 'pending' : 'disabled',
    timestamp: new Date().toISOString()
  });

  const promises = [];
  
  if (emailEnabled && emailPayload) {
    promises.push(sendAlertEmail(emailPayload).then(res => ({ type: 'email', res })));
  }
  
  if (whatsappEnabled && whatsappPayload) {
    promises.push(sendWhatsAppAlert(whatsappPayload).then(res => ({ type: 'whatsapp', res })));
  }

  const results = await Promise.allSettled(promises);

  let emailStatus: 'success' | 'failed' | 'disabled' = emailEnabled && emailPayload ? 'failed' : 'disabled';
  let whatsappStatus: 'success' | 'failed' | 'disabled' = whatsappEnabled && whatsappPayload ? 'failed' : 'disabled';
  let whatsappError: string | undefined;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.type === 'email') {
        emailStatus = result.value.res.success ? 'success' : 'failed';
      } else if (result.value.type === 'whatsapp') {
        whatsappStatus = result.value.res.success ? 'success' : 'failed';
        if (!result.value.res.success) whatsappError = result.value.res.error;
      }
    }
  }

  // Update store with final statuses
  useNotificationStore.getState().updateLogStatus(logId, {
    emailStatus,
    whatsappStatus
  });

  // Log to Activity Store
  const activityStore = useActivityStore.getState();
  if (emailStatus === 'success') {
    activityStore.addActivity({ message: 'Email Delivered', category: 'email' });
  }
  if (whatsappStatus === 'success') {
    activityStore.addActivity({ message: 'WhatsApp Delivered', category: 'whatsapp' });
  }

  return { emailStatus, whatsappStatus, whatsappError };
}

// ─── Pre-built Alerts ──────────────────────────────────────────────────

export function sendGasLeakAlert(reading: number, unit: string, zone: string) {
  return dispatchNotification({
    emailPayload: {
      subject: '🚨 AEGIS-AI Critical Gas Leak Alert',
      message: `Elevated gas concentration detected in ${zone}. Immediate attention required.`,
      type: 'critical',
      details: {
        'Alert Type': 'Hazardous Gas Leak',
        'Severity': 'CRITICAL',
        'Zone': zone,
        'Sensor Name': 'Gas Detector Alpha',
        'Current Reading': `${reading} ${unit}`,
        'Timestamp': new Date().toLocaleString(),
      },
      action: 'Initiate Evacuation Protocol'
    },
    whatsappPayload: {
      alertType: 'Hazardous Gas Leak',
      severity: 'CRITICAL',
      zone: zone,
      sensor: 'Gas Detector Alpha',
      reading: `${reading} ${unit}`,
      action: 'Initiate Evacuation Protocol'
    }
  });
}

export function sendHighTempAlert(temperature: number, equipment: string) {
  return dispatchNotification({
    emailPayload: {
      subject: '🔥 AEGIS-AI High Temperature Alert',
      message: `Temperature sensor in ${equipment} exceeded the warning threshold.`,
      type: 'warning',
      details: {
        'Alert Type': 'High Temperature',
        'Severity': 'WARNING',
        'Affected Equipment': equipment,
        'Current Reading': `${temperature}°C`,
        'Timestamp': new Date().toLocaleString(),
      },
      action: 'Monitor Equipment Closely'
    },
    whatsappPayload: {
      alertType: 'High Temperature',
      severity: 'WARNING',
      zone: 'Factory Floor',
      sensor: equipment,
      reading: `${temperature}°C`,
      action: 'Monitor Equipment Closely'
    }
  });
}

export function sendMachineFaultAlert(equipment: string, faultType: string) {
  return dispatchNotification({
    emailPayload: {
      subject: '⚙️ AEGIS-AI Machine Fault Alert',
      message: `A critical machine fault was detected on ${equipment}.`,
      type: 'critical',
      details: {
        'Alert Type': 'Machine Fault',
        'Severity': 'CRITICAL',
        'Machine Name': equipment,
        'Fault Type': faultType,
        'Status': 'Offline',
        'Timestamp': new Date().toLocaleString(),
      },
      action: 'Dispatch Maintenance Team'
    },
    whatsappPayload: {
      alertType: 'Machine Fault',
      severity: 'CRITICAL',
      zone: 'Factory Floor',
      sensor: equipment,
      reading: faultType,
      action: 'Dispatch Maintenance Team'
    }
  });
}

// Test email
export function sendTestEmail() {
  return dispatchNotification({
    emailPayload: {
      subject: '🧪 AEGIS-AI — Test Email',
      message: 'This is a test email from AEGIS-AI. If you received this, your email notifications are working correctly.',
      type: 'test',
    }
  });
}

// Test WhatsApp
export function sendTestWhatsApp() {
  return dispatchNotification({
    whatsappPayload: {
      alertType: 'Test WhatsApp Notification',
      severity: 'INFO',
      action: 'No action required. Your WhatsApp integration is working.'
    }
  });
}
