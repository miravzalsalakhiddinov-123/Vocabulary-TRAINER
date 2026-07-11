// ============================================================
// VOCABULARY TRAINER — public site
// Read-only: fetches collections from Supabase. All writing/editing
// happens on the separate admin site, never here.
// ============================================================

const WEAK_KEY = 'vocab-weak-words-v1';

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let LIBRARY = [];

async function loadLibrary(){
  const loadingStage = document.getElementById('loadingStage');
  const errorStage = document.getElementById('errorStage');
  const homeStage = document.getElementById('homeStage');

  loadingStage.style.display = 'block';
  errorStage.style.display = 'none';
  homeStage.style.display = 'none';

  if(SUPABASE_URL.includes('YOUR-PROJECT-REF') || SUPABASE_ANON_KEY.includes('YOUR-ANON')){
    loadingStage.style.display = 'none';
    errorStage.style.display = 'block';
    errorStage.innerHTML = 'This site isn\'t connected to a database yet.<br>Fill in <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in <code>config.js</code>.';
    return;
  }

  try{
    const [booksRes, itemsRes] = await Promise.all([
      sb.from('books').select('*').order('sort_order', { ascending: true }),
      sb.from('items').select('*').order('sort_order', { ascending: true })
    ]);
    if(booksRes.error) throw booksRes.error;
    if(itemsRes.error) throw itemsRes.error;

    LIBRARY = booksRes.data.map(b => ({
      ...b,
      items: itemsRes.data.filter(i => i.book_id === b.id)
    }));

    loadingStage.style.display = 'none';
    document.getElementById('weakPill').style.display = 'flex';
    showHome();
  }catch(e){
    console.error(e);
    loadingStage.style.display = 'none';
    errorStage.style.display = 'block';
    errorStage.innerHTML = 'Could not load collections: ' + escapeHtml(e.message || String(e));
  }
}

function wordCount(item){
  return (item.data || []).reduce((sum, cat) => sum + cat.words.length, 0);
}
function bookWordCount(book){
  return book.items.reduce((sum, item) => sum + wordCount(item), 0);
}

// ================= WEAK WORDS (localStorage, personal to each student) =================
let weakWords = {};
function loadWeakWords(){
  try{
    const raw = localStorage.getItem(WEAK_KEY);
    if(raw) weakWords = JSON.parse(raw);
  }catch(e){ weakWords = {}; }
  renderWeakPill();
}
function saveWeakWords(){
  try{ localStorage.setItem(WEAK_KEY, JSON.stringify(weakWords)); }
  catch(e){ console.error('storage save failed', e); }
}
function weakKey(w){ return (w.book||'') + '|' + (w.item||'') + '|' + w.en; }
function markWeak(w){
  const key = weakKey(w);
  const existing = weakWords[key];
  weakWords[key] = {
    en: w.en, ru: w.ru, category: w.category, book: w.book, item: w.item,
    misses: existing ? existing.misses + 1 : 1
  };
  renderWeakPill();
  saveWeakWords();
}
function markMastered(w){
  const key = weakKey(w);
  if(weakWords[key]){
    delete weakWords[key];
    renderWeakPill();
    saveWeakWords();
  }
}
function renderWeakPill(){
  document.getElementById('weakCount').textContent = Object.keys(weakWords).length;
}

const weakPill = document.getElementById('weakPill');
const weakModal = document.getElementById('weakModal');
const weakList = document.getElementById('weakList');

function openWeakModal(){
  const items = Object.values(weakWords).sort((a,b) => b.misses - a.misses);
  if(items.length === 0){
    weakList.innerHTML = '<div class="modal-empty">No weak words yet — miss a few in Quiz mode or mark flashcards "Still learning" and they will collect here, from any collection.</div>';
  } else {
    weakList.innerHTML = '';
    items.forEach((w, idx) => {
      const row = document.createElement('div');
      row.className = 'weak-row';
      const metaBits = [w.category, w.item, w.book].filter(Boolean).map(escapeHtml).join(' · ');
      row.innerHTML = `
        <div>
          <div class="wr-word"><span class="wr-idx">${idx+1}</span>${escapeHtml(w.en)} <span class="wr-ru">= ${escapeHtml(w.ru)}</span></div>
          <div class="wr-meta">${metaBits}</div>
        </div>
      `;
      const rm = document.createElement('button');
      rm.className = 'wr-remove';
      rm.textContent = 'remove';
      rm.onclick = () => { delete weakWords[weakKey(w)]; renderWeakPill(); saveWeakWords(); openWeakModal(); };
      row.appendChild(rm);
      weakList.appendChild(row);
    });
  }
  weakModal.classList.add('show');
}
weakPill.onclick = openWeakModal;
document.getElementById('weakModalClose').onclick = () => weakModal.classList.remove('show');
weakModal.onclick = (e) => { if(e.target === weakModal) weakModal.classList.remove('show'); };
document.getElementById('weakClearBtn').onclick = () => {
  weakWords = {};
  renderWeakPill();
  saveWeakWords();
  openWeakModal();
};

document.getElementById('weakExportBtn').onclick = async () => {
  const items = Object.values(weakWords).sort((a,b) => a.en.localeCompare(b.en));
  if(items.length === 0) return;

  const btn = document.getElementById('weakExportBtn');
  const originalLabel = btn.textContent;
  btn.textContent = 'Preparing…';
  btn.disabled = true;

  const PAGE_W = 794;
  const dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

  const sheet = document.createElement('div');
  sheet.style.position = 'fixed';
  sheet.style.left = '-99999px';
  sheet.style.top = '0';
  sheet.style.width = PAGE_W + 'px';
  sheet.style.background = '#ffffff';
  sheet.style.padding = '50px 56px 44px';
  sheet.style.fontFamily = 'Arial, Helvetica, sans-serif';
  sheet.style.color = '#1a1a1a';
  sheet.style.boxSizing = 'border-box';

  // ---- header ----
  const header = document.createElement('div');
  header.style.marginBottom = '26px';
  header.style.paddingBottom = '16px';
  header.style.borderBottom = '3px solid #4655f5';
  header.innerHTML = `
    <div style="font-size:26px;font-weight:800;color:#1c2440;letter-spacing:-0.01em;">Weak Words</div>
    <div style="font-size:12.5px;color:#667089;margin-top:6px;">Vocabulary Trainer &middot; ${items.length} word${items.length===1?'':'s'} to review &middot; generated ${dateStr}</div>
  `;
  sheet.appendChild(header);

  // ---- table ----
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontSize = '13.5px';

  const thead = document.createElement('thead');
  const headCellStyle = 'text-align:left; padding:9px 12px; background:#4655f5; color:#ffffff; border:1px solid #4655f5; font-size:11px; font-weight:bold; letter-spacing:0.04em; text-transform:uppercase;';
  thead.innerHTML = `
    <tr>
      <th style="${headCellStyle} width:42px;">#</th>
      <th style="${headCellStyle}">English</th>
      <th style="${headCellStyle}">Russian</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  items.forEach((w, idx) => {
    const tr = document.createElement('tr');
    const bg = idx % 2 === 0 ? '#ffffff' : '#f5f6fd';
    const cellBase = `padding:9px 12px; border:1px solid #cccccc; background:${bg};`;
    tr.innerHTML = `
      <td style="${cellBase} color:#667089;">${idx+1}</td>
      <td style="${cellBase} color:#1c2440; font-weight:bold;">${escapeHtml(w.en)}</td>
      <td style="${cellBase} color:#1c2440;">${escapeHtml(w.ru)}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  sheet.appendChild(table);

  // ---- footer ----
  const footer = document.createElement('div');
  footer.style.marginTop = '30px';
  footer.style.paddingTop = '14px';
  footer.style.borderTop = '1px solid #cccccc';
  footer.style.fontSize = '11px';
  footer.style.color = '#667089';
  footer.style.textAlign = 'center';
  footer.innerHTML = `Prepared by: <strong style="color:#1c2440;">Miravzal Salakhiddinov</strong> &middot; Telegram: <span style="color:#4655f5;">@salakhiddinovm</span>`;
  sheet.appendChild(footer);

  document.body.appendChild(sheet);

  try{
    if(document.fonts && document.fonts.ready){ await document.fonts.ready; }
    const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: '#ffffff' });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfW = doc.internal.pageSize.getWidth();
    const pdfH = doc.internal.pageSize.getHeight();

    const pxPerPagePt = canvas.width / pdfW;
    const pageHeightPx = Math.floor(pdfH * pxPerPagePt);

    let renderedPx = 0;
    let first = true;
    while(renderedPx < canvas.height){
      const sliceH = Math.min(pageHeightPx, canvas.height - renderedPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      const ctx = sliceCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

      const imgData = sliceCanvas.toDataURL('image/png');
      if(!first) doc.addPage();
      first = false;
      const sliceHeightPt = sliceH / pxPerPagePt;
      doc.addImage(imgData, 'PNG', 0, 0, pdfW, sliceHeightPt);

      renderedPx += sliceH;
    }

    doc.save('weak-words.pdf');
  } finally {
    document.body.removeChild(sheet);
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
};

loadWeakWords();

// ================= NAVIGATION =================
const homeStage = document.getElementById('homeStage');
const bookStage = document.getElementById('bookStage');
const studyStage = document.getElementById('studyStage');

let currentBook = null;
let currentItem = null;

function showHome(){
  currentBook = null; currentItem = null;
  homeStage.style.display = 'block';
  bookStage.style.display = 'none';
  studyStage.style.display = 'none';
  renderBookGrid();
}

function showBook(book){
  currentBook = book; currentItem = null;
  homeStage.style.display = 'none';
  bookStage.style.display = 'block';
  studyStage.style.display = 'none';
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookSubtitle').textContent = book.subtitle;
  renderItemGrid(book);
}

function showStudy(book, item){
  if(!item.data || item.data.length === 0){
    alert('This set has no words yet.');
    showBook(book);
    return;
  }
  currentBook = book; currentItem = item;
  homeStage.style.display = 'none';
  bookStage.style.display = 'none';
  studyStage.style.display = 'block';
  document.getElementById('studyTitle').textContent = item.title;
  document.getElementById('backLabel').textContent = book.title;
  document.getElementById('studyBreadcrumb').textContent = book.title + ' → ' + item.title;

  allWords = [];
  item.data.forEach(cat => cat.words.forEach(w => allWords.push({
    ...w, category: cat.category, book: book.title, item: item.title
  })));
  activeCategories = new Set(item.data.map(c => c.category));
  document.getElementById('wordcount-label').textContent = allWords.length + ' words across ' + item.data.length + ' parts';

  renderChips();
  currentMode = 'flash';
  btnFlash.classList.add('active'); btnQuiz.classList.remove('active');
  resetSession();
}

function renderBookGrid(){
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = '';
  LIBRARY.forEach((book, idx) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.setProperty('--book-accent', book.accent);
    card.style.animationDelay = Math.min(idx * 0.05, 0.4) + 's';
    const n = book.items.length;
    const wc = bookWordCount(book);
    const countLabel = n === 0 ? 'coming soon' : (n + (n === 1 ? ' set' : ' sets') + ' · ' + wc + ' words');
    card.innerHTML = `
      <div class="bc-title">${escapeHtml(book.title)}</div>
      <div class="bc-sub">${escapeHtml(book.subtitle)}</div>
      <span class="bc-count">${countLabel}</span>
    `;
    card.onclick = () => showBook(book);
    grid.appendChild(card);
  });
}

function renderItemGrid(book){
  const wrap = document.getElementById('itemGridWrap');
  if(book.items.length === 0){
    wrap.innerHTML = `<div class="empty-state">No days or tests added yet for <strong>${escapeHtml(book.title)}</strong>.<br>Check back soon.</div>`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'item-grid';
  book.items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.animationDelay = Math.min(idx * 0.04, 0.4) + 's';
    card.innerHTML = `
      <div class="ic-idx">${idx+1}</div>
      <div class="ic-title">${escapeHtml(item.title)}</div>
      <div class="ic-sub">${escapeHtml(item.subtitle || (wordCount(item) + ' words'))}</div>
    `;
    card.onclick = () => showStudy(book, item);
    grid.appendChild(card);
  });
  wrap.innerHTML = '';
  wrap.appendChild(grid);
}

document.getElementById('backToHomeBtn').onclick = showHome;
document.getElementById('backToBookBtn').onclick = () => showBook(currentBook);

// ---------- category chips ----------
const catbar = document.getElementById('catbar');
function renderChips(){
  catbar.innerHTML = '';
  const totalCats = currentItem.data.length;
  const allChip = document.createElement('div');
  allChip.className = 'cat-chip' + (activeCategories.size === totalCats ? ' active' : '');
  allChip.textContent = 'All';
  allChip.onclick = () => { activeCategories = new Set(currentItem.data.map(c=>c.category)); renderChips(); resetSession(); };
  catbar.appendChild(allChip);

  currentItem.data.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip' + (activeCategories.has(cat.category) ? ' active' : '');
    chip.textContent = cat.category + ' (' + cat.words.length + ')';
    chip.onclick = () => {
      if(activeCategories.has(cat.category) && activeCategories.size > 1){
        activeCategories.delete(cat.category);
      } else if (activeCategories.size === totalCats){
        activeCategories = new Set([cat.category]);
      } else {
        activeCategories.add(cat.category);
      }
      renderChips();
      resetSession();
    };
    catbar.appendChild(chip);
  });
}

let allWords = [];
let activeCategories = new Set();
let currentMode = 'flash';

function currentPool(){
  return allWords.filter(w => activeCategories.has(w.category));
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ---------- mode toggle ----------
const btnFlash = document.getElementById('btn-flash');
const btnQuiz = document.getElementById('btn-quiz');
const flashStage = document.getElementById('flashStage');
const quizStage = document.getElementById('quizStage');
const summaryStage = document.getElementById('summaryStage');

btnFlash.onclick = () => { currentMode='flash'; btnFlash.classList.add('active'); btnQuiz.classList.remove('active'); resetSession(); };
btnQuiz.onclick = () => { currentMode='quiz'; btnQuiz.classList.add('active'); btnFlash.classList.remove('active'); resetSession(); };

function resetSession(){
  summaryStage.style.display = 'none';
  if(currentPool().length === 0) return;
  if(currentMode === 'flash'){
    flashStage.style.display='flex'; quizStage.style.display='none';
    startFlash();
  } else {
    flashStage.style.display='none'; quizStage.style.display='flex';
    startQuiz();
  }
}

// ---------- FLASHCARDS ----------
let flashDeck = [], flashIdx = 0, flashKnown = 0;
const card = document.getElementById('card');
const frontWord = document.getElementById('frontWord');
const backWord = document.getElementById('backWord');
const frontTag = document.getElementById('frontTag');
const flashProgress = document.getElementById('flashProgress');
const flashBar = document.getElementById('flashBar');
const flashKnownEl = document.getElementById('flashKnown');

function startFlash(){
  flashDeck = shuffle(currentPool());
  flashIdx = 0; flashKnown = 0;
  showFlashCard();
}
function showFlashCard(){
  if(flashDeck.length === 0) return;
  if(flashIdx >= flashDeck.length){
    showSummaryFlash();
    return;
  }
  card.classList.remove('flipped');
  const w = flashDeck[flashIdx];
  frontWord.textContent = w.en;
  backWord.textContent = w.ru;
  frontTag.textContent = w.category;
  flashProgress.textContent = (flashIdx+1) + ' / ' + flashDeck.length;
  flashBar.style.width = Math.round((flashIdx/flashDeck.length)*100) + '%';
  flashKnownEl.textContent = '✓ ' + flashKnown;
}
card.onclick = () => card.classList.toggle('flipped');
document.getElementById('knowBtn').onclick = () => {
  if(flashIdx >= flashDeck.length) return;
  flashKnown++;
  markMastered(flashDeck[flashIdx]);
  flashIdx++; showFlashCard();
};
document.getElementById('dontKnowBtn').onclick = () => {
  if(flashIdx >= flashDeck.length) return;
  markWeak(flashDeck[flashIdx]);
  flashIdx++; showFlashCard();
};

function showSummaryFlash(){
  flashStage.style.display='none';
  summaryStage.style.display='flex';
  document.getElementById('summaryScore').textContent = flashKnown + ' / ' + flashDeck.length;
  document.getElementById('summaryDetail').textContent = 'marked as known';
}

// ---------- QUIZ ----------
let quizDeck = [], quizIdx = 0, quizScore = 0, quizAnswered = false;
const quizProgress = document.getElementById('quizProgress');
const quizBar = document.getElementById('quizBar');
const quizScoreEl = document.getElementById('quizScore');
const quizQ = document.getElementById('quizQ');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const nextBtn = document.getElementById('nextBtn');
const quizTag = document.getElementById('quizTag');

function startQuiz(){
  const pool = currentPool();
  quizDeck = shuffle(pool).slice(0, Math.min(20, pool.length));
  quizIdx = 0; quizScore = 0;
  showQuizQuestion();
}
function showQuizQuestion(){
  if(quizIdx >= quizDeck.length){
    showSummaryQuiz();
    return;
  }
  quizAnswered = false;
  nextBtn.classList.remove('show');
  quizFeedback.textContent = '';
  const pool = currentPool();
  const w = quizDeck[quizIdx];
  const askEnglish = Math.random() < 0.5;
  quizTag.textContent = askEnglish ? 'translate into Russian' : 'what does this mean in English';
  quizQ.textContent = askEnglish ? w.en : w.ru;

  let distractors = shuffle(pool.filter(x => x.en !== w.en)).slice(0,3);
  let options = shuffle([w, ...distractors]);

  quizOptions.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.textContent = askEnglish ? opt.ru : opt.en;
    btn.onclick = () => {
      if(quizAnswered) return;
      quizAnswered = true;
      const isCorrect = opt.en === w.en;
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if(!isCorrect){
        [...quizOptions.children].forEach(c => {
          if(c.textContent === (askEnglish ? w.ru : w.en)) c.classList.add('correct');
        });
      } else {
        quizScore++;
      }
      if(isCorrect){ markMastered(w); } else { markWeak(w); }
      [...quizOptions.children].forEach(c => c.disabled = true);
      quizFeedback.textContent = isCorrect ? 'Correct' : 'Not quite';
      nextBtn.classList.add('show');
      quizScoreEl.textContent = '✓ ' + quizScore;
    };
    quizOptions.appendChild(btn);
  });

  quizProgress.textContent = (quizIdx+1) + ' / ' + quizDeck.length;
  quizBar.style.width = Math.round((quizIdx/quizDeck.length)*100) + '%';
  quizScoreEl.textContent = '✓ ' + quizScore;
}
nextBtn.onclick = () => { quizIdx++; showQuizQuestion(); };

function showSummaryQuiz(){
  quizStage.style.display='none';
  summaryStage.style.display='flex';
  document.getElementById('summaryScore').textContent = quizScore + ' / ' + quizDeck.length;
  document.getElementById('summaryDetail').textContent = 'correct answers';
}

document.getElementById('restartBtn').onclick = resetSession;

loadLibrary();
