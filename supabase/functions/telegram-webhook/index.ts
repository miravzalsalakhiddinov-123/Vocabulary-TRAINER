// Handles incoming updates from Telegram (via webhook) — currently just
// replies to /start. Telegram also supports deep-link payloads
// (t.me/YourBot?start=CODE -> message.text = "/start CODE"), which we use
// here so a raw bot link still credits a referral, even if a friend
// shares the t.me link instead of the website link.
//
// Required secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SITE_URL

import { corsHeaders } from '../_shared/cors.ts';

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: false }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Telegram sends this header on every webhook call when a secret_token
  // was set via setWebhook — reject anything that doesn't match, so
  // randoms can't fake updates to your bot.
  const expectedSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
  if (expectedSecret && req.headers.get('x-telegram-bot-api-secret-token') !== expectedSecret) {
    return new Response('unauthorized', { status: 401 });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');

  try {
    const update = await req.json();
    const message = update?.message;
    const text: string | undefined = message?.text;
    const chatId = message?.chat?.id;
    const firstName = message?.from?.first_name || 'there';

    if (botToken && chatId && text && text.startsWith('/start')) {
      const payload = text.split(' ')[1]; // referral code, if any
      const link = payload ? `${siteUrl}/?ref=${encodeURIComponent(payload)}` : siteUrl;

      const reply =
        `Hey ${firstName}! 👋\n\n` +
        `This bot powers login for <b>Vocabulary Trainer</b> — flashcards and quizzes for IELTS vocabulary.\n\n` +
        `Open the app here and tap "Log in with Telegram" to save your streak and stats:\n${link}`;

      await sendTelegramMessage(botToken, chatId, reply);
    }

    // Any other message type (non-/start text, stickers, etc.) — ignore silently.
    return new Response('ok', { headers: corsHeaders });
  } catch (e) {
    console.error(e);
    // Always return 200 to Telegram even on internal errors, or it will
    // keep retrying the same update.
    return new Response('ok', { headers: corsHeaders });
  }
});
