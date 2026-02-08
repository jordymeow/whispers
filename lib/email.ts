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
    const messageData: any = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
    };

    if (text) messageData.text = text;
    if (html) messageData.html = html;

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);

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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #2d2d3a; background-color: #f4f4f7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 32px; margin-bottom: 8px;">🌙</div>
      <h1 style="margin: 0; color: #1a1a2e; font-size: 24px;">Whispers</h1>
    </div>
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e0e0e8;">
      <h2 style="margin-top: 0; color: #1a1a2e;">Password Reset Request</h2>
      <p style="color: #2d2d3a;">Hello,</p>
      <p style="color: #2d2d3a;">You requested a password reset for your Whispers account.</p>
      <p style="color: #2d2d3a;">Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6b6b80;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 14px; word-break: break-all;"><a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a></p>
      <p style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e0e0e8; color: #2d2d3a;">
        <strong>Note:</strong> This link will expire in 1 hour for security reasons.
      </p>
      <p style="color: #6b6b80;">If you didn't request this password reset, you can safely ignore this email.</p>
    </div>
    <div style="text-align: center; margin-top: 32px; font-size: 14px; color: #6b6b80;">
      <p style="margin: 0;">&copy; Whispers &middot; <a href="${SITE_URL}" style="color: #667eea;">whispers.cloud</a></p>
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #2d2d3a; background-color: #f4f4f7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 32px; margin-bottom: 8px;">🌙</div>
      <h1 style="margin: 0; color: #1a1a2e; font-size: 24px;">Whispers</h1>
    </div>
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e0e0e8;">
      <h2 style="margin-top: 0; color: #1a1a2e;">Email Verification Code</h2>
      <p style="color: #2d2d3a;">Please enter this code to verify your new email address:</p>
      <div style="background-color: #f0f0ff; border: 2px solid #d0d0ea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <div style="font-size: 32px; font-family: monospace; letter-spacing: 8px; color: #5a5cd6; font-weight: bold;">${code}</div>
      </div>
      <p style="text-align: center; color: #6b6b80; font-size: 14px;">
        This code will expire in 15 minutes
      </p>
      <p style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e0e0e8; color: #6b6b80;">
        If you didn't request this email change, you can safely ignore this message.
      </p>
    </div>
    <div style="text-align: center; margin-top: 32px; font-size: 14px; color: #6b6b80;">
      <p style="margin: 0;">&copy; Whispers &middot; <a href="${SITE_URL}" style="color: #667eea;">whispers.cloud</a></p>
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #2d2d3a; background-color: #f4f4f7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 32px; margin-bottom: 8px;">🌙</div>
      <h1 style="margin: 0; color: #1a1a2e; font-size: 24px;">Whispers</h1>
    </div>
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e0e0e8;">
      <h2 style="margin-top: 0; color: #1a1a2e;">Hello ${name}!</h2>
      <p style="color: #2d2d3a;">Your account has been created successfully. Welcome to our quiet corner of the internet.</p>
      <p style="color: #2d2d3a;">Whispers is a place for thoughtful expression, where every whisper matters more than the noise.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">Start Whispering</a>
      </div>
      <div style="margin-top: 28px; padding: 20px; background-color: #f0f0ff; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1a1a2e;">Quick Tips:</h3>
        <ul style="color: #2d2d3a;">
          <li>Customize your profile with themes and colors</li>
          <li>Each whisper is limited to 1000 characters - make them count</li>
          <li>Add icons and colors to match your mood</li>
          <li>Your profile lives at <a href="${SITE_URL}/@" style="color: #667eea;">whispers.cloud/@your-username</a></li>
        </ul>
      </div>
    </div>
    <div style="text-align: center; margin-top: 32px; font-size: 14px; color: #6b6b80;">
      <p style="margin: 0;">&copy; Whispers &middot; <a href="${SITE_URL}" style="color: #667eea;">whispers.cloud</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}