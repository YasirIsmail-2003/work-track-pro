import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

// For onboarding queue we treat profiles with status PENDING_ADMIN_REVIEW as applicants
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id,full_name,phone,status,created_at').eq('status', 'PENDING_ADMIN_REVIEW').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applicants: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
