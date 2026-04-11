// api/dykm-notify.js — Vercel Serverless Function (DoYouKnowMe)
//
// MAILERLITE SETUP:
//   1. Create / reuse your account at https://app.mailerlite.com
//   2. Go to Integrations → API → Create new token (or reuse RealorNah token)
//   3. Add ONE env var in Vercel: Settings → Environment Variables:
//       Name:  MAILERLITE_API_KEY
//       Value: eyJ0eXAiOiJKV1QiLCJhbGciOi...  (your full token)
//   4. Verify your sender email under Settings → Verified Senders
//       Then set FROM_EMAIL below to that verified email.
//
// TRIGGER: fires from DYKMquiz.html when plays hits a multiple of NOTIFY_AT

const NOTIFY_AT      = 3;
const ALLOWED_ORIGIN = 'https://doyouknowme.vercel.app';  // ← your DYKM domain
const FROM_EMAIL     = 'hello@doyouknowme.app';            // ← must be verified in MailerLite
const FROM_NAME      = 'DoYouKnowMe';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const { creatorEmail, creatorName, quizId, plays, quizLink } = req.body || {};

    // No email provided — silently skip, not an error
    if (!creatorEmail) return res.status(200).json({ sent: false, reason: 'No creator email' });
    if (!plays || !quizId) return res.status(400).json({ error: 'Missing fields' });

    // Only fire at multiples of NOTIFY_AT (3, 6, 9…)
    if (plays % NOTIFY_AT !== 0) return res.status(200).json({ sent: false, reason: 'Not a notify threshold' });

    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration: missing MAILERLITE_API_KEY' });

    const htmlBody = `
<div style="font-family:sans-serif;max-width:520px;margin:auto;background:#1a0015;color:#fff;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#ff4d8d,#c77dff);padding:24px 28px;">
    <h1 style="margin:0;font-size:22px;font-weight:800;">Your Quiz is Getting Love! 💕</h1>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px;">DoYouKnowMe Milestone</p>
  </div>
  <div style="padding:28px;background:#2a0023;">
    <p style="font-size:18px;color:#ffc2d1;font-weight:700;margin:0 0 12px;">Hey ${esc(creatorName)} 💕</p>
    <p style="color:rgba(255,255,255,.85);line-height:1.7;margin:0 0 20px;">
      Your couple quiz just hit <strong style="color:#ffc2d1;font-size:22px;">${plays} plays</strong>!
      Someone is finding out how well they really know you. Check the leaderboard!
    </p>
    <a href="${esc(quizLink)}"
       style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff4d8d,#ff758f);color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;">
      View Leaderboard →
    </a>
  </div>
  <div style="padding:16px 28px;background:#12000f;font-size:12px;color:rgba(255,255,255,.4);text-align:center;">
    DoYouKnowMe · doyouknowme.app · You got this notification because you left your email at quiz creation.
  </div>
</div>`;

    try {
        const r = await fetch('https://connect.mailerlite.com/api/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                from: { email: FROM_EMAIL, name: FROM_NAME },
                to: [{ email: creatorEmail, name: creatorName }],
                subject: `Your couple quiz just hit ${plays} plays! 💕`,
                html: htmlBody,
                text: `Hey ${creatorName}! Your DoYouKnowMe quiz hit ${plays} plays. Check the leaderboard: ${quizLink}`,
            }),
        });

        if (!r.ok) {
            const errBody = await r.text();
            console.error('MailerLite error:', errBody);
            return res.status(502).json({ error: 'Email delivery failed. Check MailerLite logs.' });
        }

        return res.status(200).json({ sent: true, plays });
    } catch(e) {
        console.error('dykm-notify.js unhandled error:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
