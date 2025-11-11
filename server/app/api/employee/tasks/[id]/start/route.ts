import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';

const Params = z.object({ id: z.string().uuid() });

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = Params.parse(params);
    // create a task_timer row
    const now = new Date().toISOString();
    await supabaseAdmin.from('task_timers').insert({ task_id: id, started_at: now } as any);
    await supabaseAdmin.from('tasks').update({ status: 'IN_PROGRESS' }).eq('id', id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('start task handler', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
