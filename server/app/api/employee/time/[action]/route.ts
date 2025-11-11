import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../_lib/supabaseServerClient';

const Params = z.object({ action: z.enum(['clock-in', 'clock-out', 'break-start', 'break-end']) });

export async function POST(req: Request, { params }: any) {
  try {
    const { action } = Params.parse(params);
    const body = await req.json();
    const { user_id } = body;
    const ts = new Date().toISOString();

    if (action === 'clock-in') {
      await supabaseAdmin.from('time_entries').insert({ user_id, start_time: ts } as any);
    } else if (action === 'clock-out') {
      // close last open entry
      await supabaseAdmin.rpc('close_last_time_entry', { uid: user_id });
    } else if (action === 'break-start') {
      await supabaseAdmin.from('time_entries').insert({ user_id, start_time: ts, is_break: true } as any);
    } else if (action === 'break-end') {
      await supabaseAdmin.rpc('close_last_time_entry', { uid: user_id });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('time action', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
