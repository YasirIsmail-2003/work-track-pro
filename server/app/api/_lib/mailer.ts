import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
// default sender if not provided
const from = process.env.SMTP_FROM || 'info@bakgroup.net';

if (!host || !port || !user || !pass) {
  // We'll throw lazily when sending instead of on import to make local typecheck easier.
}

export function createTransporter() {
  if (!host || !port || !user || !pass || !from) {
    throw new Error('Missing SMTP env vars. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  return info;
}

// Render and send a template stored under app/email/templates
export async function sendTemplate(templateName: string, to: string, subject: string, vars: Record<string, string | number | undefined> = {}) {
  const tplPath = path.join(__dirname, '..', '..', 'email', 'templates', `${templateName}.html`);
  let tpl = '';
  try {
    tpl = await fs.promises.readFile(tplPath, 'utf8');
  } catch (e) {
    throw new Error(`Template not found: ${templateName}`);
  }

  let html = tpl;
  for (const k of Object.keys(vars)) {
    const v = vars[k];
    html = html.replace(new RegExp(`{{\s*${k}\s*}}`, 'g'), String(v ?? ''));
  }

  return sendMail({ to, subject, html, text: undefined });
}
