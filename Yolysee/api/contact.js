// api/contact.js
// Vercel Serverless Function — Contact Form Handler
// Uses Resend (https://resend.com) to send emails.
//
// Setup:
//   1. npm install resend  (in your project root)
//   2. Add RESEND_API_KEY to Vercel Environment Variables
//   3. Set TO_EMAIL to your inbox (or use a verified Resend domain)
//   4. Deploy to Vercel — this file auto-becomes /api/contact

export const config = {
  runtime: 'edge', // Optional: use 'nodejs' if you prefer
};

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, subject, message } = body || {};

  // Basic validation
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL || 'hello@yolysse.com';
  const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yolysse.com';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #0A0905; color: #E8DCC8; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #1A1710; border: 1px solid rgba(201,148,58,0.22); border-radius: 12px; overflow: hidden; }
        .header { background: #C9943A; padding: 28px 36px; }
        .header h1 { color: #0A0905; font-size: 18px; letter-spacing: 0.22em; margin: 0; font-weight: 400; }
        .body { padding: 36px; }
        .field { margin-bottom: 20px; }
        .label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8C8070; margin-bottom: 6px; }
        .value { font-size: 15px; color: #E8DCC8; }
        .message-box { background: #232018; border: 1px solid rgba(201,148,58,0.12); border-radius: 8px; padding: 20px; margin-top: 8px; font-size: 15px; color: #E8DCC8; line-height: 1.7; }
        .footer { padding: 20px 36px; border-top: 1px solid rgba(201,148,58,0.12); font-size: 11px; color: #5C5245; letter-spacing: 0.08em; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header"><h1>YOLYSSE — New Message</h1></div>
        <div class="body">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${escapeHtml(subject || 'No subject')}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${escapeHtml(message).replace(/\n/g, '<br />')}</div>
          </div>
        </div>
        <div class="footer">Sent via YOLYSSE contact form · yolysse.com</div>
      </div>
    </body>
    </html>
  `;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `YOLYSSE Contact <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[YOLYSSE] ${subject || 'New message'} — from ${name}`,
        html: emailHtml,
        text: `From: ${name} <${email}>\nSubject: ${subject || 'No subject'}\n\n${message}`,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json().catch(() => ({}));
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
