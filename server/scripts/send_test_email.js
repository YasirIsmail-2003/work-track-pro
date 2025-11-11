const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

function loadEnvFile(f) {
  if (!fs.existsSync(f)) return {};
  const txt = fs.readFileSync(f, 'utf8');
  const lines = txt.split(/\r?\n/);
  const out = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

// Try server/.env first then root .env
const serverEnv = loadEnvFile(path.join(__dirname, '..', '.env'));
const rootEnv = loadEnvFile(path.join(__dirname, '..', '..', '.env'));
const env = Object.assign({}, rootEnv, serverEnv, process.env);

const SMTP_HOST = env.SMTP_HOST;
const SMTP_PORT = env.SMTP_PORT ? Number(env.SMTP_PORT) : 587;
const SMTP_USER = env.SMTP_USER;
const SMTP_PASS = env.SMTP_PASS;
const FROM = env.SMTP_FROM || 'WorkTrack Pro <no-reply@worktrack.pro>';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP configuration. Check server/.env or root .env');
  process.exit(1);
}

async function send(to) {
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  const info = await transporter.sendMail({ from: FROM, to, subject: 'WorkTrack Pro — test email', text: 'This is a test email from WorkTrack Pro.', html: '<p>This is a test email from <strong>WorkTrack Pro</strong>.</p>' });
  return info;
}

const to = process.argv[2] || 'yasirismail8319@gmail.com';
send(to).then((info) => { console.log('Sent:', info.messageId || info); process.exit(0); }).catch((err) => { console.error('Send error', err); process.exit(2); });
