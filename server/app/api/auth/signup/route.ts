import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';
import { sendMail } from '../../_lib/mailer';

const SignupSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = SignupSchema.parse(body);

    // create user via supabase admin
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: false,
      user_metadata: { full_name: data.full_name, phone: data.phone },
    } as any);

    if (createError) {
      console.error('createUser error', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // insert profile in public.profiles
    const profile = {
      id: userData.user?.id,
      role: data.role,
      full_name: data.full_name,
      phone: data.phone || null,
      status: data.role === 'ADMIN' ? 'ACTIVE' : 'PENDING_ADMIN_REVIEW',
    };

    const { error: profErr } = await supabaseAdmin.from('profiles').insert(profile as any);
    if (profErr) {
      console.error('insert profile error', profErr);
    }

    // send verification email via supabase (magic link) or nodemailer + verify link
    // Prefer using Supabase built-in invite/OTP; for now send a simple notice via SMTP (non-blocking)
    try {
      await sendMail({
        to: data.email,
        subject: 'Welcome to WorkTrack Pro — verify your email',
        html: `<p>Hello ${data.full_name},</p><p>Thanks for signing up. An admin will review your account shortly.</p>`,
      });
    } catch (e) {
      console.warn('mail send warning', e);
    }

    return NextResponse.json({ ok: true, id: userData.user?.id });
  } catch (err: any) {
    console.error('signup handler error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
