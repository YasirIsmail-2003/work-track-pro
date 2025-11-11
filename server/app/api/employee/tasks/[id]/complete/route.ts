import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';

const Params = z.object({ id: z.string().uuid() });
const Body = z.object({ otp: z.string().length(6) });

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = Params.parse(params);
    const body = Body.parse(await req.json());

    const record = await supabaseAdmin.from('task_client_otps').select('*').eq('task_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!record.data) return NextResponse.json({ error: 'OTP not found' }, { status: 404 });

    const otpRow = record.data as any;
    if (new Date(otpRow.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (otpRow.attempts >= 5) return NextResponse.json({ error: 'Max attempts exceeded' }, { status: 400 });

    const ok = await bcrypt.compare(body.otp, otpRow.otp_hash);
    if (!ok) {
      await supabaseAdmin.from('task_client_otps').update({ attempts: otpRow.attempts + 1 }).eq('id', otpRow.id);
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // success: mark task complete
    await supabaseAdmin.from('tasks').update({ status: 'DONE', completed_at: new Date().toISOString() }).eq('id', id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('complete task', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
