// Sends a Telegram DM to every student whose streak is about to break
// (they practiced yesterday but not yet today). Meant to be called once a
// day by an external scheduler (see SETUP_TELEGRAM.md for two options).
//
// Protected by a shared secret so randoms can't trigger mass messages —
// pass it as header:  x-cron-secret: <CRON_SECRET>
//
// Required secrets: TELEGRAM_BOT_TOKEN, CRON_SECRET

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';

function yesterdayUTC(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) return jsonResponse({ error: 'Server not configured' }, 500);

  try {
    const supabase = serviceClient();
    const { data: atRisk, error } = await supabase
      .from('app_users')
      .select('telegram_id, first_name, streak_count')
      .eq('last_active_date', yesterdayUTC())
      .gt('streak_count', 0);
    if (error) throw error;

    let sent = 0;
    for (const u of atRisk || []) {
      const text = `🔥 ${u.first_name}, your ${u.streak_count}-day streak is about to reset!\n\nOpen Vocabulary Trainer and do one quick round today to keep it alive.`;
      const ok = await sendTelegramMessage(botToken, u.telegram_id, text);
      if (ok) sent++;
    }

    return jsonResponse({ candidates: (atRisk || []).length, sent });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
