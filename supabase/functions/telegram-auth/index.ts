// Verifies the payload from the Telegram Login Widget, creates/updates the
// user row, links a referral if one was passed, and issues a session token.
//
// Required secret (set via `supabase secrets set`): TELEGRAM_BOT_TOKEN

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { touchStreak } from '../_shared/streak.ts';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  [key: string]: unknown;
}

async function verifyTelegramHash(authData: TelegramAuthData, botToken: string): Promise<boolean> {
  const { hash, ...rest } = authData;
  const checkString = Object.keys(rest)
    .filter((k) => rest[k] !== undefined && rest[k] !== null)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n');

  const secretKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(botToken));
  const hmacKey = await crypto.subtle.importKey(
    'raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(checkString));
  const computedHash = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

  return computedHash === hash;
}

function makeReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { authData, ref } = await req.json();
    if (!authData || !authData.id || !authData.hash) {
      return jsonResponse({ error: 'Missing Telegram auth data' }, 400);
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) return jsonResponse({ error: 'Server not configured' }, 500);

    const valid = await verifyTelegramHash(authData, botToken);
    if (!valid) return jsonResponse({ error: 'Invalid login signature' }, 401);

    // auth_date freshness check — reject stale/replayed payloads (>1 day old)
    const ageSeconds = Date.now() / 1000 - Number(authData.auth_date);
    if (ageSeconds > 86400) return jsonResponse({ error: 'Login expired, please try again' }, 401);

    const supabase = serviceClient();

    const { data: existing } = await supabase
      .from('app_users')
      .select('*')
      .eq('telegram_id', authData.id)
      .maybeSingle();

    let user = existing;

    if (!user) {
      // Generate a referral code, retrying on the rare collision.
      let code = makeReferralCode();
      for (let i = 0; i < 5; i++) {
        const { data: clash } = await supabase.from('app_users').select('id').eq('referral_code', code).maybeSingle();
        if (!clash) break;
        code = makeReferralCode();
      }

      let referredBy: string | null = null;
      if (ref) {
        const { data: referrer } = await supabase
          .from('app_users').select('id, referral_count, bonus_unlocked')
          .eq('referral_code', String(ref).toUpperCase())
          .maybeSingle();
        if (referrer) {
          referredBy = referrer.id;
          const newCount = (referrer.referral_count || 0) + 1;
          await supabase.from('app_users').update({
            referral_count: newCount,
            bonus_unlocked: referrer.bonus_unlocked || newCount >= 3,
          }).eq('id', referrer.id);
        }
      }

      const { data: created, error: insertErr } = await supabase.from('app_users').insert({
        telegram_id: authData.id,
        username: authData.username || null,
        first_name: authData.first_name || 'Student',
        photo_url: authData.photo_url || null,
        referral_code: code,
        referred_by: referredBy,
      }).select().single();

      if (insertErr) throw insertErr;
      user = created;
    } else {
      // keep profile fields fresh on every login
      const { data: updated, error: updateErr } = await supabase.from('app_users').update({
        username: authData.username || existing.username,
        first_name: authData.first_name || existing.first_name,
        photo_url: authData.photo_url || existing.photo_url,
      }).eq('id', existing.id).select().single();
      if (updateErr) throw updateErr;
      user = updated;
    }

    user = await touchStreak(supabase, user);

    const token = crypto.randomUUID() + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error: sessErr } = await supabase.from('sessions').insert({ token, user_id: user.id, expires_at: expiresAt });
    if (sessErr) throw sessErr;

    return jsonResponse({ token, user });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
