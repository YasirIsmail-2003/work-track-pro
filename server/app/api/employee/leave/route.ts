import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

const Body = z.object({ user_id: z.string().uuid(), leave_type: z.enum(['ANNUAL','SICK','UNPAID','OTHER']), start_date: z.string(), end_date: z.string(), reason: z.string().optional() });

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const { error } = await supabaseAdmin.from('leave_requests').insert({ user_id: body.user_id, leave_type: body.leave_type, start_date: body.start_date, end_date: body.end_date, reason: body.reason } as any);
    if (error) {
      console.error('leave insert', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('leave handler', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
