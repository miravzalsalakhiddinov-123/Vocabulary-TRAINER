// Shared logic used by telegram-auth, resume-session, and log-event so
// the streak always advances the same way no matter which function
// touched the user last.

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / msPerDay);
}

// deno-lint-ignore no-explicit-any
export async function touchStreak(supabase: any, user: any) {
  const today = todayUTC();
  if (user.last_active_date === today) {
    return user; // already counted today, nothing to change
  }

  let streak = 1;
  if (user.last_active_date) {
    const gap = daysBetween(user.last_active_date, today);
    if (gap === 1) streak = (user.streak_count || 0) + 1; // consecutive day
    // any bigger gap (or none yet) resets to 1
  }
  const longest = Math.max(user.longest_streak || 0, streak);

  const { data, error } = await supabase
    .from('app_users')
    .update({ streak_count: streak, longest_streak: longest, last_active_date: today })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// deno-lint-ignore no-explicit-any
export async function loadUserBySession(supabase: any, token: string) {
  if (!token) return null;
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const { data: user } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', session.user_id)
    .maybeSingle();

  return user || null;
}
