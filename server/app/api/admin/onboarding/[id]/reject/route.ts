import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';
import { sendTemplate } from '../../../../_lib/mailer';

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();
    const reason = body.reason || null;

    const { error } = await supabaseAdmin.from('profiles').update({ status: 'REJECTED' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      const userEmail = data?.user?.email || null;
      const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', id).single();
      if (userEmail) {
        await sendTemplate('onboarding_reject', userEmail, 'Application update', { full_name: profile?.full_name || '', reason: reason || 'Not specified' });
      }
    } catch (e) {
      console.warn('reject email failed', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
