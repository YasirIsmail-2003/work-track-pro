import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';
import { sendMail } from '../../../../_lib/mailer';

const ApproveParams = z.object({ id: z.string().uuid() });

export async function POST(req: Request, { params }: any) {
  try {
    const p = ApproveParams.parse(params);

    // generate an employee id
    const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabaseAdmin.from('profiles').update({ status: 'ACTIVE', employee_id: employeeId }).eq('id', p.id);
    if (error) {
      console.error('profile approve error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // send set-password magic link
    try {
      // create a password reset / magic link via Supabase admin password reset (or send email with set-password link)
      // For now, notify by SMTP
      const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', p.id).single();
      await sendMail({
        to: (await supabaseAdmin.auth.admin.getUserById(p.id)).data.user?.email || '',
        subject: 'Your account has been approved',
        html: `<p>Hi ${profile?.full_name || ''},</p><p>Your account is approved. Please set your password via the app: ${process.env.APP_URL}</p>`,
      });
    } catch (e) {
      console.warn('approve mail error', e);
    }

    return NextResponse.json({ ok: true, employeeId });
  } catch (err: any) {
    console.error('approve handler', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
