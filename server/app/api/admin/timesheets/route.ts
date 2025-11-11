import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('timesheets').select('id,user_id,week_start,week_end,total_hours,status,created_at').order('week_start', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ timesheets: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
