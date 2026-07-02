// Sends transactional email via SMTP when credentials are configured.
// Falls back to logging the link server-side so the reset flow stays
// testable in local/dev environments that don't have mail credentials.
let transporterPromise = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporterPromise) {
    transporterPromise = import('nodemailer').then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    );
  }
  return transporterPromise;
}

export async function sendPasswordResetEmail(email, rawToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${rawToken}`;
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[mailer] SMTP not configured — password reset link for ${email}: ${resetUrl}`);
    return;
  }
  const t = await transporter;
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'VOLTRA — Parolni tiklash',
    text: `Parolingizni tiklash uchun havola (30 daqiqa amal qiladi): ${resetUrl}`,
    html: `<p>Parolingizni tiklash uchun quyidagi havolani bosing (30 daqiqa amal qiladi):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
