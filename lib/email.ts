import Mailgun from 'mailgun.js';
import formData from 'form-data';

const mailgun = new Mailgun(formData);

const mg = process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: process.env.MAILGUN_EU === 'true' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net'
    })
  : null;

const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@whispers.cloud';
const FROM_NAME = process.env.MAILGUN_FROM_NAME || 'Whispers';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
  if (!mg || !process.env.MAILGUN_DOMAIN) {
    console.error('Mailgun not configured. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
    return false;
  }

  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text,
      html
    });

    console.log('Email sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${SITE_URL}/reset-password/${resetToken}`;

  const subject = 'Reset Your Whispers Password';

  const text = `
Hello,

You requested a password reset for your Whispers account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best,
The Whispers Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #e0e0f0; background: #0a0a0f; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; margin-bottom: 10px; }
    .content { background: rgba(18, 20, 30, 0.95); border-radius: 12px; padding: 30px; border: 1px solid rgba(158, 160, 255, 0.2); }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #9090a0; }
    a { color: #9ea0ff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌙</div>
      <h1 style="margin: 0;">Whispers</h1>
    </div>
    <div class="content">
      <h2 style="color: #e0e0f0;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your Whispers account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #9090a0;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 14px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(158, 160, 255, 0.1);">
        <strong>Note:</strong> This link will expire in 1 hour for security reasons.
      </p>
      <p style="color: #9090a0;">If you didn't request this password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© Whispers · <a href="${SITE_URL}">whispers.cloud</a></p>
      <p style="font-size: 12px;">A quiet corner of the internet</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

export async function sendEmailVerificationCode(email: string, code: string): Promise<boolean> {
  const subject = 'Verify Your Email - Whispers';

  const text = `
Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't request this email change, please ignore this message.

Best,
The Whispers Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #e0e0f0; background: #0a0a0f; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; margin-bottom: 10px; }
    .content { background: rgba(18, 20, 30, 0.95); border-radius: 12px; padding: 30px; border: 1px solid rgba(158, 160, 255, 0.2); }
    .code-box { background: rgba(158, 160, 255, 0.1); border: 2px solid rgba(158, 160, 255, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { font-size: 32px; font-family: monospace; letter-spacing: 8px; color: #9ea0ff; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #9090a0; }
    a { color: #9ea0ff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌙</div>
      <h1 style="margin: 0;">Whispers</h1>
    </div>
    <div class="content">
      <h2 style="color: #e0e0f0;">Email Verification Code</h2>
      <p>Please enter this code to verify your new email address:</p>

      <div class="code-box">
        <div class="code">${code}</div>
      </div>

      <p style="text-align: center; color: #9090a0; font-size: 14px;">
        This code will expire in 15 minutes
      </p>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(158, 160, 255, 0.1); color: #9090a0;">
        If you didn't request this email change, you can safely ignore this message.
      </p>
    </div>
    <div class="footer">
      <p>© Whispers · <a href="${SITE_URL}">whispers.cloud</a></p>
      <p style="font-size: 12px;">A quiet corner of the internet</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to Whispers 🌙';

  const text = `
Hello ${name},

Welcome to Whispers! Your account has been created successfully.

Start sharing your whispers at ${SITE_URL}

Best,
The Whispers Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #e0e0f0; background: #0a0a0f; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; margin-bottom: 10px; }
    .content { background: rgba(18, 20, 30, 0.95); border-radius: 12px; padding: 30px; border: 1px solid rgba(158, 160, 255, 0.2); }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #9090a0; }
    a { color: #9ea0ff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌙</div>
      <h1 style="margin: 0;">Welcome to Whispers</h1>
    </div>
    <div class="content">
      <h2 style="color: #e0e0f0;">Hello ${name}!</h2>
      <p>Your account has been created successfully. Welcome to our quiet corner of the internet.</p>
      <p>Whispers is a place for thoughtful expression, where every whisper matters more than the noise.</p>
      <div style="text-align: center;">
        <a href="${SITE_URL}" class="button">Start Whispering</a>
      </div>
      <div style="margin-top: 30px; padding: 20px; background: rgba(158, 160, 255, 0.1); border-radius: 8px;">
        <h3 style="margin-top: 0; color: #e0e0f0;">Quick Tips:</h3>
        <ul style="color: #d0d0e0;">
          <li>Customize your profile with themes and colors</li>
          <li>Each whisper is limited to 1000 characters - make them count</li>
          <li>Add icons and colors to match your mood</li>
          <li>Your profile lives at <a href="${SITE_URL}/@">whispers.cloud/@your-username</a></li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>© Whispers · <a href="${SITE_URL}">whispers.cloud</a></p>
      <p style="font-size: 12px;">A quiet corner of the internet</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}