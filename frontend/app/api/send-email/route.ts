// AEGIS-AI Email Notification API Route
// Server-side only — Resend API key is never exposed to the browser

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultTo = process.env.ALERT_EMAIL;

  console.log('[AEGIS Email] POST /api/send-email called');
  console.log('[AEGIS Email] RESEND_API_KEY present:', !!apiKey);
  console.log('[AEGIS Email] ALERT_EMAIL:', defaultTo ?? '(not set)');

  if (!apiKey || apiKey === 're_your_api_key_here') {
    console.error('[AEGIS Email] ERROR: RESEND_API_KEY not configured');
    return NextResponse.json(
      { success: false, error: 'RESEND_API_KEY is not configured. Please set it in .env.local' },
      { status: 500 }
    );
  }

  if (!defaultTo || defaultTo === 'your-email@example.com') {
    console.error('[AEGIS Email] ERROR: ALERT_EMAIL not configured');
    return NextResponse.json(
      { success: false, error: 'ALERT_EMAIL is not configured. Please set it in .env.local' },
      { status: 500 }
    );
  }

  let body: { subject?: string; message?: string; to?: string; type?: string; details?: Record<string, string>; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const subject = body.subject ?? 'AEGIS-AI Alert Notification';
  const message = body.message ?? 'An alert was triggered in AEGIS-AI.';
  const to = body.to ?? defaultTo;
  const type = body.type ?? 'alert';
  const details = body.details;
  const action = body.action;

  console.log('[AEGIS Email] Sending to:', to);
  console.log('[AEGIS Email] Subject:', subject);
  console.log('[AEGIS Email] Type:', type);

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'AEGIS-AI <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e0e8f0; padding: 24px; border-radius: 12px; border: 1px solid #1a3050;">
          <div style="text-align: center; padding: 16px 0; border-bottom: 1px solid #1a3050;">
            <h1 style="margin: 0; color: #00d4ff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">🛡️ AEGIS-AI</h1>
            <p style="margin: 4px 0 0; color: #7fa3c4; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Industrial Safety Monitoring Platform</p>
          </div>
          <div style="padding: 24px 0;">
            <div style="background: ${type === 'critical' ? '#ff335515' : type === 'warning' ? '#ffb80015' : '#00d4ff10'}; border-left: 4px solid ${type === 'critical' ? '#ff3355' : type === 'warning' ? '#ffb800' : '#00d4ff'}; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
              <h2 style="margin: 0 0 8px; color: ${type === 'critical' ? '#ff3355' : type === 'warning' ? '#ffb800' : '#00d4ff'}; font-size: 18px; text-transform: uppercase;">
                ${type === 'critical' ? '🚨 CRITICAL ALERT' : type === 'warning' ? '⚠️ WARNING' : type === 'test' ? '🧪 TEST EMAIL' : 'ℹ️ NOTIFICATION'}
              </h2>
              <p style="margin: 0; color: #e0e8f0; font-size: 15px; line-height: 1.6;">${message}</p>
            </div>
            
            ${details ? `
            <div style="background: #112240; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #1a3050;">
              <h3 style="margin: 0 0 12px; color: #7fa3c4; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Alert Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(details).map(([key, val]) => `
                  <tr>
                    <td style="padding: 6px 0; color: #7fa3c4; font-size: 14px; width: 40%; vertical-align: top;">${key}</td>
                    <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: bold; font-family: monospace;">${val}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            ` : ''}

            ${action ? `
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: ${type === 'critical' ? '#ff3355' : '#ffb800'}; color: #fff; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px ${type === 'critical' ? '#ff335540' : '#ffb80040'};">
                ACTION REQUIRED: ${action}
              </div>
            </div>
            ` : ''}

            <p style="color: #3a5a7a; font-size: 12px; margin: 0; border-top: 1px solid #1a3050; padding-top: 16px; text-align: center;">
              Generated at: ${new Date().toLocaleString()}<br/>
              Source: AEGIS-AI Core Telemetry Engine
            </p>
          </div>
          <div style="text-align: center; padding: 16px 0; background: #07101d; border-radius: 0 0 12px 12px; margin: 0 -24px -24px -24px;">
            <p style="margin: 0; color: #3a5a7a; font-size: 11px;">This is an automated alert generated by the AEGIS-AI Industrial Safety Monitoring Platform.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[AEGIS Email] Resend API error:', JSON.stringify(error));
      return NextResponse.json(
        { success: false, error: error.message ?? 'Unknown Resend error', details: error },
        { status: 500 }
      );
    }

    console.log('[AEGIS Email] ✅ Email sent successfully! ID:', data?.id);
    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[AEGIS Email] Exception:', errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
