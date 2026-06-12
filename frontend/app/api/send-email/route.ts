import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { title, message } = await request.json();

    if (!message || !title) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.ALERT_EMAIL;

    if (!resendApiKey || !toEmail) {
      console.warn('Resend configuration missing in environment variables.');
      return NextResponse.json({ error: 'Resend configuration missing' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'AEGIS-AI <onboarding@resend.dev>',
      to: [toEmail],
      subject: `[AEGIS ALERT] ${title}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #e53e3e;">AEGIS-AI Industrial Safety Alert</h2>
        <p><strong>Alert Type:</strong> ${title}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          This is an automated message from the AEGIS-AI simulation environment.
        </p>
      </div>`,
    });

    if (error) {
      console.error('Resend dispatch error response:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
