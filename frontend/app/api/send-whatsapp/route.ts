import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppAlert } from '@/lib/notifications/whatsapp';

export async function POST(req: NextRequest) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  console.log('[AEGIS WhatsApp API] Request received');

  try {
    const result = await sendWhatsAppAlert(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
