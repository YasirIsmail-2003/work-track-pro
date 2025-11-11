import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';
import { sendTemplate } from '../../../../_lib/mailer';

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = params;
    // set profile active and generate employee id
    const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabaseAdmin.from('profiles').update({ status: 'ACTIVE', employee_id: employeeId }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // try to fetch user email from auth
    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      const userEmail = data?.user?.email || null;
      const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', id).single();
      if (userEmail) {
        await sendTemplate('approve_set_password', userEmail, 'Your account is approved', { full_name: profile?.full_name || '', app_url: process.env.APP_URL, user_id: id });
      }
    } catch (e) {
      console.warn('approve email send failed', e);
    }

    return NextResponse.json({ ok: true, employeeId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
