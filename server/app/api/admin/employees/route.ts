import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id,full_name,phone,role,status,employee_id,created_at').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ employees: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
