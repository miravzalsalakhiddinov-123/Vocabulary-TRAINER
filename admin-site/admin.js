// ============================================================
// VOCABULARY TRAINER — admin site
// Separate app/URL from the public student site. Requires a real
// Supabase Auth sign-in before any content is shown. Writes go
// straight to Supabase, so the public site reflects changes
// immediately (no export/re-upload step).
// ============================================================

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function wordCount(item){
  return (item.data || []).reduce((sum, cat) => sum + cat.words.length, 0);
}
function bookWordCount(book){
  return book.items.reduce((sum, item) => sum + wordCount(item), 0);
}

const loadingStage = document.getElementById('loadingStage');
const errorStage = document.getElementById('errorStage');
const loginStage = document.getElementById('loginStage');
const dashboardStage = document.getElementById('dashboardStage');

if(SUPABASE_URL.includes('YOUR-PROJECT-REF') || SUPABASE_ANON_KEY.includes('YOUR-ANON')){
  loadingStage.style.display = 'none';
  errorStage.style.display = 'block';
  errorStage.innerHTML = 'This admin site isn\'t connected to a database yet.<br>Fill in <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in <code>config.js</code>.';
  throw new Error('Supabase not configured');
}

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let LIBRARY = [];
let currentBook = null;

// ================= AUTH =================
async function initAuth(){
  const { data: { session } } = await sb.auth.getSession();
  if(session){
    onSignedIn(session);
  } else {
    loadingStage.style.display = 'none';
    loginStage.style.display = 'block';
  }
}

document.getElementById('loginSubmit').onclick = async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.classList.remove('show');
  const btn = document.getElementById('loginSubmit');
  btn.disabled = true; btn.textContent = 'Signing in…';

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  btn.disabled = false; btn.textContent = 'Sign in';

  if(error){
    errEl.textContent = error.message;
    errEl.classList.add('show');
    return;
  }
  onSignedIn(data.session);
};
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
  if(e.key === 'Enter') document.getElementById('loginSubmit').click();
});

document.getElementById('signOutBtn').onclick = async () => {
  await sb.auth.signOut();
  dashboardStage.style.display = 'none';
  loginStage.style.display = 'block';
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
};

async function onSignedIn(session){
  loginStage.style.display = 'none';
  loadingStage.style.display = 'none';
  dashboardStage.style.display = 'block';
  document.getElementById('whoAmI').textContent = session.user.email;
  await loadLibrary();
  showHome();
}

// ================= DATA LOAD =================
async function loadLibrary(){
  const [booksRes, itemsRes] = await Promise.all([
    sb.from('books').select('*').order('sort_order', { ascending: true }),
    sb.from('items').select('*').order('sort_order', { ascending: true })
  ]);
  if(booksRes.error){ alert('Failed to load books: ' + booksRes.error.message); return; }
  if(itemsRes.error){ alert('Failed to load items: ' + itemsRes.error.message); return; }

  LIBRARY = booksRes.data.map(b => ({
    ...b,
    items: itemsRes.data.filter(i => i.book_id === b.id)
  }));
}

// ================= NAVIGATION =================
const homeStage = document.getElementById('homeStage');
const bookStage = document.getElementById('bookStage');

function showHome(){
  currentBook = null;
  homeStage.style.display = 'block';
  bookStage.style.display = 'none';
  renderBookGrid();
}
function showBook(book){
  currentBook = book;
  homeStage.style.display = 'none';
  bookStage.style.display = 'block';
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookSubtitle').textContent = book.subtitle;
  renderItemGrid(book);
}
document.getElementById('backToHomeBtn').onclick = showHome;

function renderBookGrid(){
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = '';
  LIBRARY.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.setProperty('--book-accent', book.accent);
    const n = book.items.length;
    const wc = bookWordCount(book);
    const countLabel = n === 0 ? 'no sets yet' : (n + (n === 1 ? ' set' : ' sets') + ' · ' + wc + ' words');
    card.innerHTML = `
      <div class="bc-title">${escapeHtml(book.title)}</div>
      <div class="bc-sub">${escapeHtml(book.subtitle)}</div>
      <span class="bc-count">${countLabel}</span>
    `;
    card.onclick = () => showBook(book);
    const row = document.createElement('div');
    row.className = 'card-edit-row';
    row.innerHTML = `<button class="mini-btn" data-act="edit">✎ Edit</button><button class="mini-btn danger" data-act="del">🗑 Delete</button>`;
    row.addEventListener('click', (e) => e.stopPropagation());
    row.querySelector('[data-act=edit]').onclick = () => openBookModal(book);
    row.querySelector('[data-act=del]').onclick = () => deleteBook(book);
    card.appendChild(row);
    grid.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'add-card';
  addCard.textContent = '+ Add collection';
  addCard.onclick = () => openBookModal(null);
  grid.appendChild(addCard);
}

function renderItemGrid(book){
  const wrap = document.getElementById('itemGridWrap');
  wrap.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'item-grid';
  book.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="ic-title">${escapeHtml(item.title)}</div>
      <div class="ic-sub">${escapeHtml(item.subtitle || (wordCount(item) + ' words'))}</div>
    `;
    card.onclick = () => openWordsModal(book, item);
    const row = document.createElement('div');
    row.className = 'card-edit-row';
    row.innerHTML = `<button class="mini-btn" data-act="words">📝 Words</button><button class="mini-btn" data-act="edit">✎ Edit</button><button class="mini-btn danger" data-act="del">🗑 Delete</button>`;
    row.addEventListener('click', (e) => e.stopPropagation());
    row.querySelector('[data-act=words]').onclick = () => openWordsModal(book, item);
    row.querySelector('[data-act=edit]').onclick = () => openItemModal(book, item);
    row.querySelector('[data-act=del]').onclick = () => deleteItem(book, item);
    card.appendChild(row);
    grid.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'add-card';
  addCard.textContent = '+ Add set';
  addCard.onclick = () => openItemModal(book, null);
  grid.appendChild(addCard);

  wrap.appendChild(grid);
}

// ================= BOOK CRUD =================
const bookModal = document.getElementById('bookModal');
let editingBook = null;

function openBookModal(book){
  editingBook = book;
  document.getElementById('bookModalTitle').textContent = book ? 'Edit collection' : 'New collection';
  document.getElementById('bookTitleInput').value = book ? book.title : '';
  document.getElementById('bookSubtitleInput').value = book ? book.subtitle : '';
  document.getElementById('bookAccentInput').value = book ? book.accent : '#4361ee';
  bookModal.classList.add('show');
}
document.getElementById('bookModalClose').onclick = () => bookModal.classList.remove('show');
document.getElementById('bookModalCancel').onclick = () => bookModal.classList.remove('show');
bookModal.onclick = (e) => { if(e.target === bookModal) bookModal.classList.remove('show'); };

document.getElementById('bookModalSave').onclick = async () => {
  const title = document.getElementById('bookTitleInput').value.trim();
  const subtitle = document.getElementById('bookSubtitleInput').value.trim();
  const accent = document.getElementById('bookAccentInput').value;
  if(!title){ alert('Please enter a title.'); return; }

  const btn = document.getElementById('bookModalSave');
  btn.disabled = true;
  try{
    if(editingBook){
      const { error } = await sb.from('books').update({ title, subtitle, accent }).eq('id', editingBook.id);
      if(error) throw error;
    } else {
      const sort_order = LIBRARY.length;
      const { error } = await sb.from('books').insert({ title, subtitle, accent, sort_order });
      if(error) throw error;
    }
    await loadLibrary();
    bookModal.classList.remove('show');
    showHome();
  }catch(e){
    alert('Save failed: ' + e.message);
  }finally{
    btn.disabled = false;
  }
};

async function deleteBook(book){
  if(!confirm(`Delete "${book.title}" and all its sets? This cannot be undone.`)) return;
  const { error } = await sb.from('books').delete().eq('id', book.id);
  if(error){ alert('Delete failed: ' + error.message); return; }
  await loadLibrary();
  showHome();
}

// ================= ITEM (set) CRUD =================
const itemModal = document.getElementById('itemModal');
let editingItem = null;
let itemModalBook = null;

function openItemModal(book, item){
  itemModalBook = book;
  editingItem = item;
  document.getElementById('itemModalTitle').textContent = item ? 'Edit set' : 'New set';
  document.getElementById('itemTitleInput').value = item ? item.title : '';
  document.getElementById('itemSubtitleInput').value = item ? item.subtitle : '';
  itemModal.classList.add('show');
}
document.getElementById('itemModalClose').onclick = () => itemModal.classList.remove('show');
document.getElementById('itemModalCancel').onclick = () => itemModal.classList.remove('show');
itemModal.onclick = (e) => { if(e.target === itemModal) itemModal.classList.remove('show'); };

document.getElementById('itemModalSave').onclick = async () => {
  const title = document.getElementById('itemTitleInput').value.trim();
  const subtitle = document.getElementById('itemSubtitleInput').value.trim();
  if(!title){ alert('Please enter a title.'); return; }

  const btn = document.getElementById('itemModalSave');
  btn.disabled = true;
  try{
    if(editingItem){
      const update = { title };
      if(subtitle) update.subtitle = subtitle;
      const { error } = await sb.from('items').update(update).eq('id', editingItem.id);
      if(error) throw error;
    } else {
      const sort_order = itemModalBook.items.length;
      const { error } = await sb.from('items').insert({
        book_id: itemModalBook.id, title, subtitle: subtitle || '0 parts', data: [], sort_order
      });
      if(error) throw error;
    }
    await loadLibrary();
    itemModal.classList.remove('show');
    showBook(LIBRARY.find(b => b.id === itemModalBook.id));
  }catch(e){
    alert('Save failed: ' + e.message);
  }finally{
    btn.disabled = false;
  }
};

async function deleteItem(book, item){
  if(!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
  const { error } = await sb.from('items').delete().eq('id', item.id);
  if(error){ alert('Delete failed: ' + error.message); return; }
  await loadLibrary();
  showBook(LIBRARY.find(b => b.id === book.id));
}

// ================= WORDS (bulk text editor) =================
const wordsModal = document.getElementById('wordsModal');
const wordsTextarea = document.getElementById('wordsTextarea');
const wordsError = document.getElementById('wordsError');
let wordsModalItem = null;
let wordsModalBook = null;

function dataToText(data){
  const lines = [];
  (data || []).forEach(cat => {
    lines.push('## ' + cat.category);
    cat.words.forEach(w => lines.push(w.en + ' = ' + w.ru));
  });
  return lines.join('\n');
}
function textToData(text){
  const lines = text.split('\n');
  const data = [];
  let current = null;
  lines.forEach(raw => {
    const line = raw.trim();
    if(!line) return;
    if(line.startsWith('##')){
      const name = line.replace(/^##\s*/, '').trim() || ('Part ' + (data.length + 1));
      const existing = data.find(c => c.category === name);
      if(existing){ current = existing; }
      else { current = { category: name, words: [] }; data.push(current); }
    } else if(line.includes('=')){
      const idx = line.indexOf('=');
      const en = line.slice(0, idx).trim();
      const ru = line.slice(idx + 1).trim();
      if(!en || !ru) return;
      if(!current){ current = { category: 'Part 1', words: [] }; data.push(current); }
      current.words.push({ en, ru });
    }
  });
  return data;
}

function openWordsModal(book, item){
  wordsModalBook = book;
  wordsModalItem = item;
  document.getElementById('wordsModalTitle').textContent = 'Edit words — ' + item.title;
  wordsTextarea.value = dataToText(item.data);
  wordsError.classList.remove('show');
  wordsModal.classList.add('show');
}
document.getElementById('wordsModalClose').onclick = () => wordsModal.classList.remove('show');
document.getElementById('wordsModalCancel').onclick = () => wordsModal.classList.remove('show');
wordsModal.onclick = (e) => { if(e.target === wordsModal) wordsModal.classList.remove('show'); };

document.getElementById('wordsModalSave').onclick = async () => {
  const parsed = textToData(wordsTextarea.value);
  const total = parsed.reduce((s,c) => s + c.words.length, 0);
  if(total === 0){
    wordsError.textContent = 'Add at least one word, in the form: english = translation';
    wordsError.classList.add('show');
    return;
  }
  const subtitle = parsed.length + (parsed.length === 1 ? ' part' : ' parts');

  const btn = document.getElementById('wordsModalSave');
  btn.disabled = true;
  try{
    const { error } = await sb.from('items').update({ data: parsed, subtitle }).eq('id', wordsModalItem.id);
    if(error) throw error;
    await loadLibrary();
    wordsModal.classList.remove('show');
    showBook(LIBRARY.find(b => b.id === wordsModalBook.id));
  }catch(e){
    wordsError.textContent = 'Save failed: ' + e.message;
    wordsError.classList.add('show');
  }finally{
    btn.disabled = false;
  }
};

initAuth();
