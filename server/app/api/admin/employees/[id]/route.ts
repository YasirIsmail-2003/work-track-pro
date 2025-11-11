import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../_lib/supabaseServerClient';

export async function GET(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { data: profile, error: profileErr } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    const { data: documents } = await supabaseAdmin.from('documents').select('id,storage_key,url,type,uploaded_at,metadata').eq('user_id', id);
    const { data: timesheets } = await supabaseAdmin.from('timesheets').select('id,week_start,week_end,total_hours,status,created_at').eq('user_id', id).order('week_start', { ascending: false });
    const { data: leaves } = await supabaseAdmin.from('leave_requests').select('id,leave_type,start_date,end_date,reason,status,created_at').eq('user_id', id).order('created_at', { ascending: false });

    return NextResponse.json({ profile: profile || null, documents: documents || [], timesheets: timesheets || [], leaves: leaves || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
