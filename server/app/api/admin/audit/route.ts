import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const limit = Number(url.searchParams.get('limit') || '100');

    if (!userId) return NextResponse.json({ error: 'missing user_id' }, { status: 400 });

    // fetch time entries, leaves and timesheets for the user
    const [{ data: teData, error: teErr }, { data: leaves, error: leavesErr }, { data: tsData, error: tsErr }] = await Promise.all([
      supabaseAdmin.from('time_entries').select('id,user_id,task_id,start_time,end_time,is_break,notes,created_at').eq('user_id', userId).order('start_time', { ascending: false }).limit(limit),
      supabaseAdmin.from('leave_requests').select('id,user_id,leave_type,start_date,end_date,reason,status,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
      supabaseAdmin.from('timesheets').select('id,user_id,week_start,week_end,total_hours,status,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    ]);

    if (teErr || leavesErr || tsErr) {
      const msg = teErr?.message || leavesErr?.message || tsErr?.message || 'unknown';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const events: any[] = [];
    (teData || []).forEach((r: any) => events.push({ type: 'time_entry', id: r.id, timestamp: r.start_time || r.created_at, payload: r }));
    (leaves || []).forEach((r: any) => events.push({ type: 'leave_request', id: r.id, timestamp: r.created_at, payload: r }));
    (tsData || []).forEach((r: any) => events.push({ type: 'timesheet', id: r.id, timestamp: r.created_at, payload: r }));

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('admin audit', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
