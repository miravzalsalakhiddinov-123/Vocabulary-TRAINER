import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { touchStreak, loadUserBySession } from '../_shared/streak.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) return jsonResponse({ error: 'Missing token' }, 400);

    const supabase = serviceClient();
    let user = await loadUserBySession(supabase, token);
    if (!user) return jsonResponse({ error: 'Session expired' }, 401);

    user = await touchStreak(supabase, user);
    return jsonResponse({ user });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
