import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Uses the service_role key, which is only ever available as an env var
// inside the Edge Function runtime — never sent to the browser.
export function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}
