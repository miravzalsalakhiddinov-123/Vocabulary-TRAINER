import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { loadUserBySession } from '../_shared/streak.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) return jsonResponse({ error: 'Missing token' }, 400);

    const supabase = serviceClient();
    const user = await loadUserBySession(supabase, token);
    if (!user) return jsonResponse({ error: 'Session expired' }, 401);

    const { data: events, error } = await supabase
      .from('study_events')
      .select('word_en, result, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) throw error;

    const totalAttempts = events.length;
    const knownEvents = events.filter((e) => e.result === 'known');
    const masteredWords = new Set(knownEvents.map((e) => e.word_en)).size;
    const accuracy = totalAttempts ? Math.round((knownEvents.length / totalAttempts) * 100) : 0;

    // last 14 days activity, for a simple bar chart
    const dayBuckets: Record<string, number> = {};
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days.push(d);
      dayBuckets[d] = 0;
    }
    for (const e of events) {
      const d = e.created_at.slice(0, 10);
      if (d in dayBuckets) dayBuckets[d]++;
    }

    return jsonResponse({
      user,
      stats: {
        total_attempts: totalAttempts,
        mastered_words: masteredWords,
        accuracy,
        activity: days.map((d) => ({ date: d, count: dayBuckets[d] })),
      },
      referral: {
        code: user.referral_code,
        count: user.referral_count,
        target: 3,
        unlocked: user.bonus_unlocked,
      },
    });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
