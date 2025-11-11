import bcrypt from 'bcrypt';

// OTP helpers for task-client verification
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndStoreOtp(supabaseAdmin: any, taskId: string, ttlHours = 24) {
  // rate-limit: don't allow more than one OTP generation per task within 10 minutes
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = await supabaseAdmin.from('task_client_otps').select('id').eq('task_id', taskId).gt('created_at', cutoff).limit(1);
  if (recent.error) throw recent.error;
  if (recent.data && recent.data.length > 0) throw new Error('OTP recently generated; please wait before requesting another.');

  // also limit total OTPs generated in last 24 hours to avoid abuse
  const dayCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentDay = await supabaseAdmin.from('task_client_otps').select('id', { count: 'exact' }).eq('task_id', taskId).gt('created_at', dayCutoff);
  if (recentDay.error) throw recentDay.error;
  const count24 = (recentDay.count || 0) as number;
  if (count24 >= 5) throw new Error('Too many OTP requests for this task in the last 24 hours');

  const otp = generateOtp();
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from('task_client_otps').insert({ task_id: taskId, otp_hash: hash, expires_at: expiresAt, attempts: 0 } as any);
  if (error) throw error;
  return otp;
}

export async function verifyOtpAndConsume(supabaseAdmin: any, taskId: string, providedOtp: string) {
  const { data, error } = await supabaseAdmin.from('task_client_otps').select('*').eq('task_id', taskId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, reason: 'OTP not found' };
  const row = data as any;
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: 'expired' };
  if (row.attempts >= 5) return { ok: false, reason: 'max_attempts' };

  const ok = await bcrypt.compare(providedOtp, row.otp_hash);
  if (!ok) {
    await supabaseAdmin.from('task_client_otps').update({ attempts: row.attempts + 1 }).eq('id', row.id);
    return { ok: false, reason: 'invalid' };
  }

  // mark consumed: increment attempts and set expires_at to now
  await supabaseAdmin.from('task_client_otps').update({ attempts: row.attempts + 1, expires_at: new Date().toISOString() }).eq('id', row.id);
  return { ok: true };
}

export function renderTaskOtpEmail(otp: string, taskTitle?: string, hours = 24) {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#111">
    <h2>Task verification code</h2>
    <p>Use the following verification code to confirm task completion${taskTitle ? ` for <strong>${taskTitle}</strong>` : ''}:</p>
    <p style="font-size:20px;font-weight:700;">${otp}</p>
    <p>This code expires in ${hours} hours.</p>
    <p>If you did not request this, please ignore this message.</p>
  </div>
  `;

  const text = `Your verification code is ${otp}. It expires in ${hours} hours.`;
  return { html, text };
}
