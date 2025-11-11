import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';

const Params = z.object({ id: z.string().uuid() });

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = Params.parse(params);
    const { error } = await supabaseAdmin.from('leave_requests').update({ status: 'APPROVED', decided_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('admin approve leave', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
