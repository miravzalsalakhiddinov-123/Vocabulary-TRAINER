// ============================================================
// VOCABULARY TRAINER — auth.js
// Shared on every page. Handles Telegram login, session persistence,
// study-event logging, and referral links.
// ============================================================

const SESSION_KEY = 'vocab-session-token-v1';
const USER_KEY = 'vocab-user-v1';

let currentUser = null;
let currentToken = null;

function getStoredSession(){
  try{
    const token = localStorage.getItem(SESSION_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if(token && userRaw) return { token, user: JSON.parse(userRaw) };
  }catch(e){}
  return null;
}
function storeSession(token, user){
  currentToken = token; currentUser = user;
  try{
    localStorage.setItem(SESSION_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }catch(e){}
}
function clearSession(){
  currentToken = null; currentUser = null;
  try{
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
  }catch(e){}
}

function isLoggedIn(){ return !!currentUser; }
function getUser(){ return currentUser; }
function getToken(){ return currentToken; }

async function callFunction(name, body){
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getReferralCodeFromURL(){
  const params = new URLSearchParams(location.search);
  return params.get('ref');
}
function stripReferralFromURL(){
  const url = new URL(location.href);
  if(url.searchParams.has('ref')){
    url.searchParams.delete('ref');
    history.replaceState({}, '', url.toString());
  }
}
function getReferralLink(){
  if(!currentUser) return '';
  const url = new URL(location.origin + location.pathname.replace(/[^/]+$/, ''));
  url.searchParams.set('ref', currentUser.referral_code);
  return url.toString();
}

// ---------- Telegram bot login (deep link + polling) ----------
// Instead of the oauth.telegram.org widget (which asks for a phone number
// and can fail to deliver a code), this opens a t.me/YourBot?start=CODE
// deep link straight into the Telegram app. The user taps Start once,
// the bot's webhook logs them in server-side, and this tab polls until
// that happens.

let loginPollTimer = null;

function stopLoginPoll(){
  if(loginPollTimer){ clearInterval(loginPollTimer); loginPollTimer = null; }
}

function makeLoginCode(){
  if(crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return 'c' + Date.now() + Math.random().toString(36).slice(2);
}

async function startTelegramBotLogin(){
  const authArea = document.getElementById('authArea');
  if(!authArea) return;

  if(!TELEGRAM_BOT_NAME || TELEGRAM_BOT_NAME === 'YourBotUsername'){
    authArea.innerHTML = '<div class="auth-hint">Telegram login not configured yet.</div>';
    return;
  }

  const code = makeLoginCode();

  // Register the code BEFORE opening Telegram — otherwise a fast tap on
  // "Start" in the bot can arrive before our first poll would have created
  // the row, and the webhook reports the (nonexistent) code as expired.
  try{
    await callFunction('check-login', { code });
  }catch(e){
    console.error('failed to register login code', e);
  }

  authArea.innerHTML = `
    <div class="auth-pending">
      <span>Waiting for Telegram… </span>
      <a id="authOpenBot" href="https://t.me/${TELEGRAM_BOT_NAME}?start=${code}" target="_blank" rel="noopener" class="auth-btn">Open Telegram</a>
      <button id="authCancelPoll" class="auth-cancel" title="Cancel">✕</button>
    </div>
  `;

  // Open it immediately too, in case the user's click was swallowed by the re-render.
  window.open(`https://t.me/${TELEGRAM_BOT_NAME}?start=${code}`, '_blank', 'noopener');

  document.getElementById('authCancelPoll').onclick = () => {
    stopLoginPoll();
    renderAuthUI();
  };

  stopLoginPoll();
  const startedAt = Date.now();

  const pollOnce = async () => {
    if(Date.now() - startedAt > 3 * 60 * 1000){
      stopLoginPoll();
      const area = document.getElementById('authArea');
      if(area) area.innerHTML = '<div class="auth-hint">Login timed out. Try again.</div>';
      return;
    }
    try{
      const data = await callFunction('check-login', { code });
      if(data.status === 'claimed' && data.token && data.user){
        stopLoginPoll();
        storeSession(data.token, data.user);
        stripReferralFromURL();
        renderAuthUI();
        if(typeof onAuthChanged === 'function') onAuthChanged();
      }
    }catch(e){
      console.error('check-login failed', e);
    }
  };

  loginPollTimer = setInterval(pollOnce, 2000);
}

// ---------- Email magic link login ----------
// Primary login method — doesn't depend on Telegram being reachable.

async function sendMagicLink(email){
  const statusEl = document.getElementById('authMagicStatus');
  if(!email || !email.includes('@')){
    if(statusEl) statusEl.textContent = 'Enter a valid email address.';
    return;
  }
  if(statusEl) statusEl.textContent = 'Sending…';
  try{
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    });
    if(error) throw error;
    if(statusEl) statusEl.textContent = 'Check your email for a login link ✉️';
  }catch(e){
    console.error('magic link failed', e);
    if(statusEl) statusEl.textContent = 'Could not send link. Try again.';
  }
}

// Fires automatically once Supabase detects a magic-link redirect and
// creates an auth session. We exchange that for this app's own session
// token (same kind Telegram login issues) so everything else keeps working.
async function handleAuthStateChange(session){
  if(!session || !session.access_token) return;
  const authArea = document.getElementById('authArea');
  if(authArea) authArea.innerHTML = '<div class="auth-loading">Signing in…</div>';
  try{
    const ref = getReferralCodeFromURL();
    const data = await callFunction('magic-login', { access_token: session.access_token, ref });
    storeSession(data.token, data.user);
    stripReferralFromURL();
    // Clean up Supabase's own auth session — we only needed it once, to
    // mint our own session token above; keeping two parallel session
    // systems around is unnecessary.
    sb.auth.signOut().catch(()=>{});
  }catch(e){
    console.error('magic-login failed', e);
  }
  renderAuthUI();
  if(typeof onAuthChanged === 'function') onAuthChanged();
}

if(typeof sb !== 'undefined' && sb.auth){
  sb.auth.onAuthStateChange((_event, session) => {
    if(session) handleAuthStateChange(session);
  });
}

function injectLoginUI(container){
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'auth-login-wrap';
  wrap.innerHTML = `
    <div class="auth-magic">
      <input type="email" id="authEmailInput" class="auth-email-input" placeholder="you@email.com" autocomplete="email" />
      <button id="authMagicBtn" class="auth-btn">Email me a login link</button>
      <div id="authMagicStatus" class="auth-hint" style="margin-top:6px;"></div>
    </div>
  `;
  container.appendChild(wrap);

  document.getElementById('authMagicBtn').onclick = () => {
    const email = document.getElementById('authEmailInput').value.trim();
    sendMagicLink(email);
  };
  document.getElementById('authEmailInput').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') document.getElementById('authMagicBtn').click();
  });

  if(TELEGRAM_BOT_NAME && TELEGRAM_BOT_NAME !== 'YourBotUsername'){
    const divider = document.createElement('div');
    divider.className = 'auth-hint';
    divider.style.margin = '8px 0 4px';
    divider.textContent = 'or';
    container.appendChild(divider);

    const tgBtn = document.createElement('button');
    tgBtn.className = 'auth-btn auth-btn-telegram';
    tgBtn.textContent = 'Log in with Telegram';
    tgBtn.onclick = startTelegramBotLogin;
    container.appendChild(tgBtn);
  }
}

function renderAuthUI(){
  const authArea = document.getElementById('authArea');
  if(!authArea) return;

  if(isLoggedIn()){
    const u = currentUser;
    authArea.innerHTML = `
      <div class="auth-pill" id="authProfilePill" title="View your stats">
        ${u.photo_url ? `<img src="${u.photo_url}" class="auth-avatar" alt="">` : `<span class="auth-avatar auth-avatar-fallback">${(u.first_name||'S')[0]}</span>`}
        <span class="auth-name">${u.first_name}</span>
        <span class="auth-streak">🔥${u.streak_count||0}</span>
        <button class="auth-logout" id="authLogoutBtn" title="Log out">⏻</button>
      </div>
    `;
    document.getElementById('authProfilePill').onclick = (e) => {
      if(e.target.id === 'authLogoutBtn') return;
      location.href = 'stats.html';
    };
    document.getElementById('authLogoutBtn').onclick = (e) => {
      e.stopPropagation();
      clearSession();
      renderAuthUI();
      if(typeof onAuthChanged === 'function') onAuthChanged();
    };
  } else {
    injectLoginUI(authArea);
  }
}

async function resumeSessionIfAny(){
  const stored = getStoredSession();
  if(!stored) { renderAuthUI(); return; }
  currentToken = stored.token; currentUser = stored.user;
  renderAuthUI(); // show cached state immediately, refresh in background
  try{
    const data = await callFunction('resume-session', { token: stored.token });
    storeSession(stored.token, data.user);
    renderAuthUI();
    if(typeof onAuthChanged === 'function') onAuthChanged();
  }catch(e){
    clearSession();
    renderAuthUI();
  }
}

// Fire-and-forget: logs one flashcard/quiz answer for the stats page.
// Silently does nothing if the student isn't logged in — study still
// works fully logged-out, they just won't have a stats history.
function logStudyEvent(w, result){
  if(!isLoggedIn()) return;
  callFunction('log-event', {
    token: currentToken,
    word_en: w.en, word_ru: w.ru, category: w.category,
    book_title: w.book, item_title: w.item, result
  }).then(data => {
    if(currentUser){
      currentUser.xp = data.xp;
      currentUser.streak_count = data.streak_count;
      storeSession(currentToken, currentUser);
      renderAuthUI();
    }
  }).catch(e => console.error('log-event failed', e));
}

document.addEventListener('DOMContentLoaded', resumeSessionIfAny);
