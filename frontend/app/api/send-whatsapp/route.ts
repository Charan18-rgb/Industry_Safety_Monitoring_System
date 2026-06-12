import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.ALERT_RECEIVER_WHATSAPP;

    if (!accountSid || !authToken || !from || !to) {
      console.warn('Twilio configuration missing in environment variables.');
      return NextResponse.json({ error: 'Twilio configuration missing' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    const response = await client.messages.create({
      body: message,
      from: from,
      to: to,
    });

    return NextResponse.json({ success: true, messageId: response.sid });
  } catch (error: any) {
    console.error('WhatsApp dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
