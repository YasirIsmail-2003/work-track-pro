import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') || '10');
    const { data, error } = await supabaseAdmin.from('time_entries').select('id,user_id,task_id,start_time,end_time,is_break,notes,created_at').order('created_at', { ascending: false }).limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ time_entries: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
