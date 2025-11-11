import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../_lib/supabaseServerClient';
import { sendMail } from '../../../../_lib/mailer';
import { createAndStoreOtp, renderTaskOtpEmail } from '../../../../_lib/otp';

const Params = z.object({ id: z.string().uuid() });

export async function POST(req: Request, { params }: any) {
  try {
    const { id } = Params.parse(params);
    const body = await req.json();
    const { client_email } = body;

    // create OTP and store it (server-side). This enforces a short rate-limit.
    const taskRes = await supabaseAdmin.from('tasks').select('title').eq('id', id).single();
    const taskTitle = taskRes.data?.title;
    const otp = await createAndStoreOtp(supabaseAdmin, id);

    // email to client
    try {
      const { html, text } = renderTaskOtpEmail(otp, taskTitle, 24);
      await sendMail({ to: client_email, subject: 'Your OTP for task verification', html, text });
    } catch (e) {
      console.warn('failed to send otp mail', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('otp handler', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
