import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

const Body = z.object({ user_id: z.string().uuid(), activeTaskId: z.string().optional(), tabVisible: z.boolean().optional(), device: z.string().optional() });

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const now = new Date().toISOString();

  await supabaseAdmin.from('presence').upsert({ user_id: body.user_id, last_heartbeat: now, active_task_id: body.activeTaskId || null, tab_visible: body.tabVisible ?? true, device: body.device || null } as any, { onConflict: 'user_id' });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('presence heartbeat', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
