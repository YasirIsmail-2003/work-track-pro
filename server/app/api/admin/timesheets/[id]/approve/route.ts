import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from('timesheets').update({ status: 'APPROVED' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
