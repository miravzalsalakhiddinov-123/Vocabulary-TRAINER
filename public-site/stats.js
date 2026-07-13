// ============================================================
// VOCABULARY TRAINER — stats.js
// ============================================================

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

async function loadStatsPage(){
  const loggedOut = document.getElementById('loggedOutView');
  const loggedIn = document.getElementById('loggedInView');

  if(!isLoggedIn()){
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
    injectTelegramWidgetIntoGate();
    return;
  }

  loggedOut.style.display = 'none';
  loggedIn.style.display = 'block';

  try{
    const data = await callFunction('get-stats', { token: getToken() });
    renderStats(data);
  }catch(e){
    console.error(e);
    loggedIn.innerHTML = '<div class="error-state" style="display:block;">Could not load your stats right now.</div>';
  }
}

function injectTelegramWidgetIntoGate(){
  const container = document.getElementById('loginGateWidget');
  if(!container) return;
  container.innerHTML = '';
  if(!TELEGRAM_BOT_NAME || TELEGRAM_BOT_NAME === 'YourBotUsername'){
    container.innerHTML = '<div class="auth-hint">Telegram login not configured yet.</div>';
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '10');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-request-access', 'write');
  container.appendChild(script);
}

function renderStats(data){
  const { user, stats, referral } = data;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="sc-value">🔥 ${user.streak_count}</div><div class="sc-label">Current streak (days)</div></div>
    <div class="stat-card"><div class="sc-value">${user.longest_streak}</div><div class="sc-label">Longest streak</div></div>
    <div class="stat-card"><div class="sc-value">${stats.mastered_words}</div><div class="sc-label">Words mastered</div></div>
    <div class="stat-card"><div class="sc-value">${stats.accuracy}%</div><div class="sc-label">Accuracy</div></div>
    <div class="stat-card"><div class="sc-value">${user.xp}</div><div class="sc-label">XP</div></div>
  `;

  const maxCount = Math.max(1, ...stats.activity.map(d => d.count));
  document.getElementById('activityChart').innerHTML = stats.activity.map(d => {
    const h = Math.max(3, Math.round((d.count / maxCount) * 100));
    const label = d.date.slice(5); // MM-DD
    return `<div class="activity-bar" style="height:${h}%" title="${label}: ${d.count}"></div>`;
  }).join('');

  document.getElementById('referralTargetLabel').textContent = referral.target;
  document.getElementById('referralTargetLabel2').textContent = referral.target;
  document.getElementById('referralRewardText').textContent = (typeof REFERRAL_REWARD_TEXT !== 'undefined') ? REFERRAL_REWARD_TEXT : 'a bonus reward';
  document.getElementById('referralCountLabel').textContent = referral.count;
  const pct = Math.min(100, Math.round((referral.count / referral.target) * 100));
  document.getElementById('referralProgressFill').style.width = pct + '%';
  document.getElementById('referralUnlockedBanner').style.display = referral.unlocked ? 'block' : 'none';

  const link = getReferralLink();
  const linkInput = document.getElementById('referralLinkInput');
  linkInput.value = link;

  document.getElementById('referralCopyBtn').onclick = () => {
    linkInput.select();
    navigator.clipboard && navigator.clipboard.writeText(link).catch(()=>{});
    const btn = document.getElementById('referralCopyBtn');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  };

  document.getElementById('referralShareBtn').onclick = () => {
    shareResultCard({
      headline: `${user.first_name}'s progress`,
      statLine: `${stats.mastered_words}`,
      subLine: 'words mastered',
      footer: `🔥 ${user.streak_count}-day streak — join me!`,
      filename: 'vocab-progress.png',
      shareText: `I've mastered ${stats.mastered_words} words on a ${user.streak_count}-day streak! Join me: ${link}`
    });
  };
}

function onAuthChanged(){ loadStatsPage(); }
document.addEventListener('DOMContentLoaded', () => setTimeout(loadStatsPage, 50));
