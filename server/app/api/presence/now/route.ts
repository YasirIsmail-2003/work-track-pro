import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET() {
  try {
    // join presence + task_timers + time_entries to compute status
    const { data } = await supabaseAdmin.rpc('get_presence_statuses');
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('presence now', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
