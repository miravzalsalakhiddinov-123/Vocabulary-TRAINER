import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { touchStreak, loadUserBySession } from '../_shared/streak.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { token, word_en, word_ru, category, book_title, item_title, result } = body;
    if (!token || !word_en || !['known', 'weak'].includes(result)) {
      return jsonResponse({ error: 'Missing/invalid fields' }, 400);
    }

    const supabase = serviceClient();
    let user = await loadUserBySession(supabase, token);
    if (!user) return jsonResponse({ error: 'Session expired' }, 401);

    const { error: insertErr } = await supabase.from('study_events').insert({
      user_id: user.id, word_en, word_ru, category, book_title, item_title, result,
    });
    if (insertErr) throw insertErr;

    const xpGain = result === 'known' ? 2 : 1;
    const { data: updated, error: updateErr } = await supabase
      .from('app_users').update({ xp: (user.xp || 0) + xpGain }).eq('id', user.id).select().single();
    if (updateErr) throw updateErr;

    user = await touchStreak(supabase, updated);

    return jsonResponse({ xp: user.xp, streak_count: user.streak_count });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
