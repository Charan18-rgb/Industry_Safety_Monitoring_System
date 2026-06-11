import twilio from 'twilio';

export interface AlertData {
  alertType: string;
  severity: string;
  zone?: string;
  sensor?: string;
  value?: string | number; // They used 'value' instead of 'reading' in their prompt template
  reading?: string | number;
  action?: string;
}

function formatWhatsAppAlert(alert: AlertData): string {
  const valueStr = alert.value ?? alert.reading ?? 'N/A';
  const zoneStr = alert.zone ?? 'N/A';
  const sensorStr = alert.sensor ?? 'N/A';
  const severityStr = alert.severity?.toUpperCase() ?? 'INFO';
  const timeStr = new Date().toLocaleString();

  if (severityStr === 'CRITICAL') {
    return `🚨 AEGIS-AI CRITICAL ALERT\n\n━━━━━━━━━━━━━━━━━━\n\n⚠ ${alert.alertType}\n\n📍 Zone: ${zoneStr}\n📡 Sensor: ${sensorStr}\n📈 Reading: ${valueStr}\n\n🔥 Severity: CRITICAL\n\n🕒 Time:\n${timeStr}\n\n🛑 Action Required:\n${alert.action ?? 'Immediate investigation required.'}\n\n━━━━━━━━━━━━━━━━━━\n\nAEGIS-AI\nAutonomous Enterprise Grade Industrial Safety Intelligence System`;
  }

  if (severityStr === 'WARNING') {
    return `⚠ AEGIS-AI WARNING\n\n━━━━━━━━━━━━━━━━━━\n\n📍 Zone: ${zoneStr}\n📡 Sensor: ${sensorStr}\n📈 Reading: ${valueStr}\n\n🟡 Severity: WARNING\n\n🕒 Time:\n${timeStr}\n\nRecommended Action:\n${alert.action ?? 'Monitor Conditions'}\n\n━━━━━━━━━━━━━━━━━━\n\nAEGIS-AI Safety Monitoring Platform`;
  }

  // Default to INFO
  return `ℹ AEGIS-AI INFORMATION\n\n━━━━━━━━━━━━━━━━━━\n\n📍 Zone: ${zoneStr}\n📡 Sensor: ${sensorStr}\n\n🟢 Severity: INFO\n\n🕒 Time:\n${timeStr}\n\nSystem operating normally.\n\n━━━━━━━━━━━━━━━━━━\n\nAEGIS-AI Safety Monitoring Platform`;
}

export async function sendWhatsAppAlert(alertData: AlertData) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  const toNumber = process.env.ALERT_RECEIVER_WHATSAPP;
  const enableWhatsapp = process.env.ENABLE_WHATSAPP === 'true';

  const messageBody = formatWhatsAppAlert(alertData);

  if (!enableWhatsapp || !accountSid || !authToken || accountSid.includes('your_twilio_sid_here')) {
    console.log('[WhatsApp Service] Mock Mode Enabled (ENABLE_WHATSAPP=false or missing credentials)');
    console.log('[WhatsApp Service] Would send message:\n', messageBody);
    
    // Simulate slight delay
    await new Promise(r => setTimeout(r, 800));

    return { 
      success: true, 
      messageId: `mock_wa_${Date.now()}`,
      mocked: true,
      note: 'Message simulated. Configure Twilio to send real messages.'
    };
  }

  console.log('[WhatsApp Service] TWILIO_ACCOUNT_SID loaded:', !!accountSid);
  console.log('[WhatsApp Service] TWILIO_AUTH_TOKEN loaded:', !!authToken);
  console.log('[WhatsApp Service] EXACT TWILIO_WHATSAPP_FROM:', fromNumber);
  console.log('[WhatsApp Service] EXACT ALERT_RECEIVER_WHATSAPP:', toNumber);

  if (!toNumber || !fromNumber) {
    throw new Error('Sender or Receiver WhatsApp numbers not configured.');
  }

  // Ensure 'whatsapp:' prefix is present
  const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
  const formattedTo = toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`;

  console.log('[WhatsApp Service] FORMATTED FROM:', formattedFrom);
  console.log('[WhatsApp Service] FORMATTED TO:', formattedTo);

  try {
    const client = twilio(accountSid, authToken);
    
    const messagePayload = {
      body: messageBody,
      from: formattedFrom,
      to: formattedTo,
    };

    console.log('[WhatsApp Service] Full Twilio Payload:', JSON.stringify(messagePayload, null, 2));

    const message = await client.messages.create(messagePayload);

    console.log('[WhatsApp Service] Twilio Response SID:', message.sid);
    console.log('[WhatsApp Service] ✅ Sent successfully! SID:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown Twilio error';
    console.error('[WhatsApp Service] Twilio Error:', errorMessage);
    throw new Error(errorMessage);
  }
}
