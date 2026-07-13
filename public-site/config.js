// Fill these in from Supabase → Project Settings → API
// Both are meant to be public/exposed in client code — access control
// is enforced by the Row Level Security policies in supabase/schema.sql,
// not by keeping this key secret.
const SUPABASE_URL = 'https://kyueeuxzdlhbuisyprvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dWVldXh6ZGxoYnVpc3lwcnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTY5MTUsImV4cCI6MjA5OTI3MjkxNX0.NZDCcSptEbbyTCdUZDaKrIUwgnpEnX6yXYTeLoRjtgU';

// ---- Telegram login ----
// Fill in your bot's username (no @), exactly as set with BotFather.
// See SETUP_TELEGRAM.md for the full walkthrough.
const TELEGRAM_BOT_NAME = 'YourBotUsername';

// Base URL for the Supabase Edge Functions (auto-derived, no need to edit).
const FUNCTIONS_URL = SUPABASE_URL.replace('.supabase.co', '.supabase.co') + '/functions/v1';

// How many friends a student needs to refer to unlock the bonus reward.
const REFERRAL_TARGET = 3;
// What the referral reward actually is — edit this freely, no code changes needed.
const REFERRAL_REWARD_TEXT = 'a printable PDF cheat-sheet of the 1000 Collocations set';
