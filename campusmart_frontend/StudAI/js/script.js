/* ═══════════════════════════════════════════════════════
   CAMPUSMART — APPLICATION LOGIC
   Firebase-ready architecture (mock data for demo)
   ═══════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════
//  FIREBASE CONFIG (from your project)
// ══════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAAkodF_w28Y_VVamAdhvn9mAq2u770Jvw",
  authDomain: "campusmart-53ffd.firebaseapp.com",
  projectId: "campusmart-53ffd",
  storageBucket: "campusmart-53ffd.appspot.com", // correct bucket endpoint
  messagingSenderId: "447336883879",
  appId: "1:447336883879:web:627fbe0bf84c822a7b5d82"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    loginSuccess({ name: user.displayName || user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: user.email, id: user.uid });
  } else {
    document.getElementById('auth-screen').style.display = 'grid';
    document.getElementById('app').style.display = 'none';
  }
});

// ══════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════
const MOCK_PRODUCTS = [
  { id: 1, name: "Data Structures & Algorithms (5th Ed)", category: "Books", price: 320, mrp: 650, condition: "Good", qty: 2, desc: "Cormen's CLRS 5th edition. Minimal pencil highlights in chapters 1–4 only. Binding is perfect.", img: "📚", seller: "Arjun Krishnan", sellerId: "u_arjun", demand: 11, createdAt: Date.now() - 3600000, duration: 3, reviews: [{ user: "Priya M.", stars: 5, text: "Exactly as described! Fast handover." }, { user: "Rohit S.", stars: 4, text: "Good condition, fair price." }] },
  { id: 2, name: "Casio FX-991EX ClassWiz", category: "Electronics", price: 880, mrp: 1250, condition: "Like New", qty: 1, desc: "Used for one semester only. All functions work perfectly. Box and manual included.", img: "🔢", seller: "Meena Rajan", sellerId: "u_meena", demand: 6, createdAt: Date.now() - 7200000, duration: 7, reviews: [{ user: "Sai K.", stars: 5, text: "Works perfectly!" }] },
  { id: 3, name: "IPL Match Tickets — Row C Seats", category: "Tickets", price: 2400, mrp: 1800, condition: "New", qty: 2, desc: "Premium Row C seats for the upcoming IPL match. Face value ₹1800 — high demand means premium pricing.", img: "🎟️", seller: "Karthik Menon", sellerId: "u_karthik", demand: 15, createdAt: Date.now() - 900000, duration: 1, reviews: [] },
  { id: 4, name: "Engineering Drawing Full Set", category: "Stationery", price: 175, mrp: 380, condition: "Good", qty: 3, desc: "Complete set: compass, protractor, set squares (45° and 60°), mini drafter. Barely used.", img: "📐", seller: "Divya Sharma", sellerId: "u_divya", demand: 4, createdAt: Date.now() - 86400000, duration: 3, reviews: [{ user: "Anand R.", stars: 4, text: "Full set, exactly what I needed." }] },
  { id: 5, name: "Nike Campus Hoodie (Size L)", category: "Clothing", price: 540, mrp: 1299, condition: "Like New", qty: 1, desc: "Worn twice. No stains, no pilling. Size L. Washed and freshly packed.", img: "👕", seller: "Rahul Patel", sellerId: "u_rahul", demand: 7, createdAt: Date.now() - 10800000, duration: 7, reviews: [] },
  { id: 6, name: "The Ordinary Skincare Trio", category: "Skincare", price: 395, mrp: 720, condition: "New", qty: 1, desc: "Niacinamide 10%, Hyaluronic Acid, SPF 50 — all sealed, unused. Bought extra set.", img: "🧴", seller: "Priya Nair", sellerId: "u_priya", demand: 3, createdAt: Date.now() - 21600000, duration: 3, reviews: [{ user: "Sneha V.", stars: 5, text: "Genuine products, sealed packaging!" }] },
  { id: 7, name: "Python Programming (O'Reilly, 2023)", category: "Books", price: 270, mrp: 750, condition: "Good", qty: 1, desc: "2023 printing. Zero markings. Pages pristine. Great for DSA + web dev both.", img: "🐍", seller: "Arjun Krishnan", sellerId: "u_arjun", demand: 8, createdAt: Date.now() - 43200000, duration: 7, reviews: [] },
  { id: 8, name: "USB-C Hub 7-in-1 (HDMI + PD)", category: "Electronics", price: 640, mrp: 1100, condition: "Like New", qty: 1, desc: "All 7 ports tested and working: 2×USB-A, 1×USB-C PD, HDMI 4K, SD, microSD, LAN.", img: "🔌", seller: "Vikram T.", sellerId: "u_vikram", demand: 9, createdAt: Date.now() - 1800000, duration: 3, reviews: [] },
  { id: 9, name: "Fluid Mechanics (Frank White)", category: "Books", price: 290, mrp: 699, condition: "Used", qty: 1, desc: "8th edition. Heavy annotations but legible — actually helps with understanding! Good for quick revision.", img: "💧", seller: "Meena Rajan", sellerId: "u_meena", demand: 5, createdAt: Date.now() - 28800000, duration: 5, reviews: [] },
  { id: 10, name: "Arduino Mega 2560 + Starter Kit", category: "Electronics", price: 1200, mrp: 2800, condition: "Good", qty: 1, desc: "Board + breadboard, jumpers, sensors, LCD, servo. Used for one semester project. All tested.", img: "🤖", seller: "Divya Sharma", sellerId: "u_divya", demand: 12, createdAt: Date.now() - 5400000, duration: 7, reviews: [{ user: "Kavin R.", stars: 5, text: "All components working, great deal!" }] },
];

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let STATE = {
  user: null,
  products: JSON.parse(JSON.stringify(MOCK_PRODUCTS)),
  myProducts: [],
  negotiations: {},      // { productId: { status, currentAiOffer, rounds, finalPrice, productId } }
  finalChats: {},        // { chatKey: [messages] }
  activeChatPid: null,
  activeFinalKey: null,
  chatUnsubscribe: null,
  filter: 'all',
  sortOrder: 'latest',
  searchQuery: '',
};

// Load products from Firestore
const seedDefaultProducts = async () => {
  const snapshot = await db.collection('products').get();
  if (!snapshot.empty) return;
  const batch = db.batch();
  const defaults = MOCK_PRODUCTS.slice(0, 6); // turn initial load into first products
  defaults.forEach(p => {
    const doc = db.collection('products').doc();
    const payload = {
      ...p,
      createdAt: firebase.firestore.Timestamp.fromMillis(p.createdAt || Date.now()),
      sellerId: p.sellerId || 'u_system',
      negotiations: p.negotiations || [],
      reviews: p.reviews || []
    };
    batch.set(doc, payload);
  });
  await batch.commit();
  console.info('Seeded default products.');
};

const loadProducts = async () => {
  try {
    await seedDefaultProducts();
    // Set up real-time listener for products
    db.collection('products').onSnapshot(snapshot => {
      STATE.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderGrid();
      renderSeller();
    });
  } catch (error) {
    console.error('Failed to set up product listener:', error);
    // Fallback to mock data
    STATE.products = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
    renderGrid();
    renderSeller();
  }
};

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════
function switchTab(tab) {
  ['login', 'signup'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`${t}-panel`).style.display = t === tab ? 'block' : 'none';
  });
}

function validateEmail(email) {
  return email.includes('@') && (email.includes('.edu') || email.includes('.ac.'));
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass = document.getElementById('l-pass').value;
  if (!email || !pass) { alert('Please fill in all fields.'); return; }
  auth.signInWithEmailAndPassword(email, pass)
    .then(userCredential => {
      const user = userCredential.user;
      loginSuccess({ name: user.displayName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: user.email, id: user.uid });
    })
    .catch(error => alert(error.message));
}

function doSignup() {
  const fname = document.getElementById('s-fname').value.trim();
  const lname = document.getElementById('s-lname').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass = document.getElementById('s-pass').value;
  if (!fname || !email || !pass) { alert('Please fill all required fields.'); return; }
  if (pass.length < 8) { alert('Password must be at least 8 characters.'); return; }
  auth.createUserWithEmailAndPassword(email, pass)
    .then(userCredential => {
      const user = userCredential.user;
      return user.updateProfile({ displayName: `${fname} ${lname}`.trim() });
    })
    .then(() => {
      const user = auth.currentUser;
      loginSuccess({ name: user.displayName, email: user.email, id: user.uid });
    })
    .catch(error => alert(error.message));
}

function loginSuccess(user) {
  STATE.user = user;
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  const initial = user.name[0].toUpperCase();
  ['nav-ava', 'um-ava'].forEach(id => document.getElementById(id).textContent = initial);
  document.getElementById('nav-username').textContent = user.name.split(' ')[0];
  document.getElementById('um-name').textContent = user.name;
  document.getElementById('um-email').textContent = user.email;
  showView('browse');
  loadProducts();
}

function doLogout() {
  auth.signOut().then(() => {
    STATE = { ...STATE, user: null, negotiations: {}, finalChats: {}, myProducts: [] };
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'grid';
    document.getElementById('user-menu').classList.remove('open');
  }).catch(error => alert(error.message));
}

function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.user-chip')) document.getElementById('user-menu')?.classList.remove('open');
});

// ══════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(`view-${view}`);
  if (el) el.classList.add('active');
  const nb = document.getElementById(`nav-${view}`);
  if (nb) nb.classList.add('active');
  document.getElementById('user-menu').classList.remove('open');
  if (view === 'seller') renderSeller();
  if (view === 'activity') renderActivity();
}

// ══════════════════════════════════════════
//  BROWSE
// ══════════════════════════════════════════
function handleSearch() {
  STATE.searchQuery = document.getElementById('search-input').value.toLowerCase();
  renderGrid();
}

function setFilter(cat, btn) {
  STATE.filter = cat;
  document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}

function handleSort(val) {
  STATE.sortOrder = val;
  renderGrid();
}

function getFilteredProducts() {
  let list = [...STATE.products];
  if (STATE.filter !== 'all') list = list.filter(p => p.category === STATE.filter);
  if (STATE.searchQuery) list = list.filter(p =>
    p.name.toLowerCase().includes(STATE.searchQuery) ||
    p.category.toLowerCase().includes(STATE.searchQuery) ||
    p.seller.toLowerCase().includes(STATE.searchQuery)
  );
  switch (STATE.sortOrder) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'demand':     list.sort((a, b) => b.demand - a.demand); break;
    default:           list.sort((a, b) => b.createdAt - a.createdAt);
  }
  return list;
}

function renderGrid() {
  const list = getFilteredProducts();
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  if (!list.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = list.map(p => buildProductCard(p)).join('');
}

function buildProductCard(p) {
  const msLeft = (p.createdAt + p.duration * 86400000) - Date.now();
  const hrs = Math.max(0, Math.floor(msLeft / 3600000));
  const mins = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  const timeStr = hrs > 24 ? `${Math.floor(hrs / 24)}d left` : hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
  const endingSoon = hrs < 24 && msLeft > 0;
  const highDemand = p.demand >= 8;
  const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const neg = STATE.negotiations[p.id];
  const hasChat = neg && neg.status === 'agreed';
  const isImg = p.img && (p.img.startsWith('http') || p.img.startsWith('data:'));

  return `<div class="product-card">
    <div class="pc-image">
      <div class="pc-image-inner">${isImg ? `<img src="${p.img}" alt="${p.name}" onerror="this.parentNode.textContent='📦'">` : p.img}</div>
      ${highDemand ? `<div class="pc-badge-tl">🔥 High Demand</div>` : ''}
      ${endingSoon ? `<div class="pc-badge-tr">⏳ Ending Soon</div>` : ''}
      <div class="pc-badge-br">${p.condition}</div>
    </div>
    <div class="pc-body">
      <div class="pc-category">${p.category}</div>
      <div class="pc-name">${p.name}</div>
      <div class="pc-pricing">
        <span class="pc-price">₹${p.price.toLocaleString()}</span>
        ${p.mrp > p.price ? `<span class="pc-mrp">₹${p.mrp.toLocaleString()}</span>` : ''}
        ${discount > 0 ? `<span class="pc-discount">${discount}% off</span>` : ''}
      </div>
      <div class="pc-meta">
        <span class="pc-meta-item">👥 ${p.demand} interested</span>
        <span class="pc-meta-item">⏱ ${timeStr}</span>
      </div>
      <div class="pc-actions">
        ${hasChat
          ? `<button class="pc-btn-negotiate locked" onclick="openFinalChat('${p.id}','buyer')">💬 Chat Seller</button>`
          : `<button class="pc-btn-negotiate" onclick="openNegotiation('${p.id}')">🤖 Negotiate</button>`
        }
        <button class="pc-btn-details" onclick="openProductDetail('${p.id}')">Details</button>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  PRODUCT DETAIL MODAL
// ══════════════════════════════════════════
function openProductDetail(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;

  // Track visitor
  if (STATE.user && STATE.user.id !== p.sellerId) {
    const visitor = { id: STATE.user.id, name: STATE.user.name, at: Date.now() };
    if (!p.visitors) p.visitors = [];
    const existing = p.visitors.find(v => v.id === STATE.user.id);
    if (!existing) {
      p.visitors.push(visitor);
      // Update Firestore
      db.collection('products').doc(id).update({ visitors: p.visitors }).catch(err => console.warn('Failed to update visitors:', err));
    }
  }
  const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const neg = STATE.negotiations[id];
  const hasChat = neg && neg.status === 'agreed';
  const starsOf = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const isImg = p.img && (p.img.startsWith('http') || p.img.startsWith('data:'));

  document.getElementById('md-product-body').innerHTML = `
    <div style="padding:28px">
      <div class="pd-layout">
        <div>
          <div class="pd-image">${isImg ? `<img src="${p.img}" alt="${p.name}" onerror="this.textContent='📦'">` : p.img}</div>
        </div>
        <div class="pd-info">
          <div class="pd-cat">${p.category}</div>
          <div class="pd-name">${p.name}</div>
          <div class="pd-pricing">
            <span class="pd-price">₹${p.price.toLocaleString()}</span>
            ${p.mrp > p.price ? `<span class="pd-mrp">₹${p.mrp.toLocaleString()}</span>` : ''}
          </div>
          <div class="pd-tags">
            ${discount > 0 ? `<span class="tag tag-green">${discount}% below MRP</span>` : ''}
            <span class="tag tag-gray">${p.condition}</span>
            <span class="tag tag-${p.demand >= 8 ? 'red' : 'gray'}">${p.demand >= 8 ? '🔥 High Demand' : `${p.demand} interested`}</span>
          </div>
          <div class="pd-desc">${p.desc}</div>
          <table class="pd-table">
            <tr><td class="pd-td-label">Seller</td><td class="pd-td-val">${p.seller}</td></tr>
            <tr><td class="pd-td-label">Quantity</td><td class="pd-td-val">${p.qty} available</td></tr>
            <tr><td class="pd-td-label">Listed</td><td class="pd-td-val">${timeAgo(p.createdAt)}</td></tr>
          </table>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">
            ${hasChat
              ? `<button class="btn-primary" onclick="openFinalChat('${id}','buyer')">💬 Chat with Seller</button>
                 <span class="tag tag-green">✅ Deal at ₹${neg.finalPrice}</span>`
              : `<button class="btn-primary" onclick="closeMd('md-product');openNegotiation('${id}')">🤖 Start Negotiation</button>`
            }
          </div>
        </div>
      </div>
      ${p.reviews.length ? `
        <div class="reviews-list">
          <div class="section-head" style="margin-top:20px"><h3 class="section-title">Reviews (${p.reviews.length})</h3></div>
          ${p.reviews.map(r => `<div class="review-item"><div class="ri-top"><span class="ri-name">${r.user}</span><span class="ri-stars">${starsOf(r.stars)}</span></div><div class="ri-text">${r.text}</div></div>`).join('')}
        </div>` : ''}
    </div>`;
  openMd('md-product');
}

// ══════════════════════════════════════════
//  AI NEGOTIATION ENGINE
// ══════════════════════════════════════════
const AI_MARGIN = {
  Books: { markup: 0.14, min: 0.80 },
  Electronics: { markup: 0.18, min: 0.82 },
  Stationery: { markup: 0.12, min: 0.78 },
  Clothing: { markup: 0.16, min: 0.80 },
  Tickets: { markup: 0.30, min: 0.92 },
  Skincare: { makeup: 0.14, min: 0.80 },
  Projects: { markup: 0.12, min: 0.78 },
  default: { markup: 0.14, min: 0.80 },
};

function openNegotiation(pid) {
  const p = STATE.products.find(x => x.id === pid);
  if (!p) return;
  if (p.qty <= 0 || p.status === 'sold') {
    alert('This product has been sold and is no longer available for negotiation.');
    return;
  }

  // Track visitor
  if (STATE.user && STATE.user.id !== p.sellerId) {
    const visitor = { id: STATE.user.id, name: STATE.user.name, at: Date.now() };
    if (!p.visitors) p.visitors = [];
    const existing = p.visitors.find(v => v.id === STATE.user.id);
    if (!existing) {
      p.visitors.push(visitor);
      // Update Firestore
      db.collection('products').doc(pid).update({ visitors: p.visitors }).catch(err => console.warn('Failed to update visitors:', err));
    }
  }

  const cfg = AI_MARGIN[p.category] || AI_MARGIN.default;
  const minPrice = Math.round(p.price * cfg.min);
  const startPrice = Math.round(p.price * (1 + (cfg.markup || 0.14)));

  if (!STATE.negotiations[pid]) {
    STATE.negotiations[pid] = { status: 'negotiating', minPrice, currentAiOffer: startPrice, startPrice, rounds: 0, finalPrice: null, productId: pid };
    p.demand++;
  } else if (STATE.negotiations[pid].status === 'agreed') {
    openFinalChat(pid, 'buyer'); return;
  }

  const neg = STATE.negotiations[pid];
  neg.status = 'negotiating';

  document.getElementById('cm-icon').textContent = p.img;
  document.getElementById('cm-title').textContent = p.name.length > 28 ? p.name.slice(0, 28) + '…' : p.name;
  document.getElementById('cm-sub').textContent = `Listed ₹${p.price.toLocaleString()} · AI opens at ₹${startPrice.toLocaleString()}`;
  document.getElementById('cm-price-bar').innerHTML = `<span class="cpb-label">Current AI Offer</span><span class="cpb-price" id="live-price">₹${neg.currentAiOffer.toLocaleString()}</span>`;

  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = '';

  addBubble('ai', `Hi! I'm the negotiation agent for <strong>${p.name}</strong>. 🤖<br><br>
    Listed price: <strong>₹${p.price.toLocaleString()}</strong> (MRP was ₹${p.mrp.toLocaleString()}).<br>
    There are <strong>${p.demand} interested buyers</strong> — demand is ${p.demand >= 8 ? 'very high' : 'steady'}.<br><br>
    My opening offer: <strong>₹${startPrice.toLocaleString()}</strong>. Make your counter-offer!`);

  setQuickOffers(pid);
  STATE.activeChatPid = pid;
  document.getElementById('chat-inp').disabled = false;
  openMd('md-chat');
}

function setQuickOffers(pid) {
  const neg = STATE.negotiations[pid];
  if (!neg) return;
  const cur = neg.currentAiOffer;
  const offers = [
    Math.round(cur * 0.92),
    Math.round(cur * 0.87),
    Math.round(neg.minPrice),
  ].filter(o => o > 0);
  const qb = document.getElementById('chat-quick');
  qb.innerHTML = offers.map(o => `<button class="quick-offer-btn" onclick="makeOffer('${pid}',${o})">Offer ₹${o.toLocaleString()}</button>`).join('') +
    `<button class="quick-offer-btn accept" onclick="acceptOffer('${pid}')">Accept ₹${cur.toLocaleString()} ✓</button>`;
}

function submitChatMsg() {
  const inp = document.getElementById('chat-inp');
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  addBubble('user', text);

  const pid = STATE.activeChatPid;
  const neg = STATE.negotiations[pid];
  if (!neg || neg.status === 'agreed') return;

  // Call Gemini backend; show offline message on failure
  callNegotiateAPI(pid, text).catch(err => {
    console.error('Negotiate API error:', err);
    addBubble('system', '⚠️ The campus agent is offline. Please try again later.');
    inp_disable(false);
  });
}

async function callNegotiateAPI(pid, userText) {
  const negotiationId = `neg_${pid}_${STATE.user.id}`;

  showTyping('chat-msgs');
  inp_disable(true);

  let res;
  try {
    res = await fetch('http://localhost:8000/negotiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: String(pid),
        negotiation_id: negotiationId,
        message: userText
      })
    });
  } catch (networkErr) {
    removeTyping('chat-msgs');
    inp_disable(false);
    throw networkErr;
  }

  removeTyping('chat-msgs');
  inp_disable(false);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  let reply = data.reply || '';

  // If the backend returned a rate-limit or error string, show it and bail out
  // (no deal detection, no quick-offer update — just let the user retry)
  const isErrorMsg = reply.includes('thinking a bit too hard') || reply.includes('campus signal');
  if (isErrorMsg) {
    addBubble('ai', reply);
    return;
  }

  // Deal detection — look for [[DEAL:price]] token
  const dealMatch = reply.match(/\[\[DEAL:(\d+)\]\]/);
  if (dealMatch) {
    const agreedPrice = parseInt(dealMatch[1], 10);
    reply = reply.replace(/\[\[DEAL:\d+\]\]/, '').trim();
    if (reply) addBubble('ai', reply);
    finalizeNegotiation(pid, agreedPrice);
  } else {
    addBubble('ai', reply);
    setQuickOffers(pid);
  }
}

function inp_disable(disabled) {
  const el = document.getElementById('chat-inp');
  if (el) el.disabled = disabled;
}

function makeOffer(pid, amount) {
  const text = `I'd like to offer ₹${amount.toLocaleString()}`;
  addBubble('user', text);
  callNegotiateAPI(pid, text).catch(err => {
    console.error('Negotiate API error:', err);
    addBubble('system', '⚠️ The campus agent is offline. Please try again later.');
    inp_disable(false);
  });
}

function acceptOffer(pid) {
  const neg = STATE.negotiations[pid];
  const text = `I accept ₹${neg.currentAiOffer.toLocaleString()}`;
  addBubble('user', text);
  callNegotiateAPI(pid, text).catch(err => {
    console.error('Negotiate API error:', err);
    addBubble('system', '⚠️ The campus agent is offline. Please try again later.');
    inp_disable(false);
  });
}

function processOffer(pid, offered) {
  const neg = STATE.negotiations[pid];
  const p = STATE.products.find(x => x.id === pid);
  neg.rounds++;

  // Buyer accepts or offers above current
  if (offered >= neg.currentAiOffer) {
    finalizeNegotiation(pid, neg.currentAiOffer); return;
  }

  // Too low
  if (offered < neg.minPrice) {
    const counter = neg.minPrice;
    neg.currentAiOffer = counter;
    updatePriceBar(counter);
    addBubble('ai', `₹${offered.toLocaleString()} is below the seller's minimum. The absolute floor is <strong>₹${counter.toLocaleString()}</strong> — that's the lowest I can go. Want to accept?`);
    setQuickOffers(pid);
    if (neg.rounds >= 4) lockFinalOffer(pid, counter);
    return;
  }

  // Valid counter — negotiate
  const gap = neg.currentAiOffer - offered;
  let counter;
  if (neg.rounds >= 3) {
    counter = Math.max(neg.minPrice, Math.round(neg.minPrice + (neg.currentAiOffer - neg.minPrice) * 0.25));
  } else {
    counter = Math.round(offered + gap * 0.55);
  }
  counter = Math.max(neg.minPrice, counter);
  neg.currentAiOffer = counter;
  updatePriceBar(counter);

  const savings = p.price - counter;
  const responsePool = [
    `₹${offered.toLocaleString()} is a bit low, but I can work with you. My counter: <strong>₹${counter.toLocaleString()}</strong>. That saves you ₹${savings > 0 ? savings.toLocaleString() : 0} from the listing price!`,
    `There are ${p.demand} people watching this item. I can bring it to <strong>₹${counter.toLocaleString()}</strong> — but I can't hold this much longer.`,
    `The seller values this item at ₹${p.price.toLocaleString()} in this condition. I'll meet you at <strong>₹${counter.toLocaleString()}</strong>. Deal?`,
    `You drive a hard bargain! Last counter: <strong>₹${counter.toLocaleString()}</strong>. That's ₹${(neg.startPrice - counter).toLocaleString()} off my opening offer.`,
  ];
  addBubble('ai', responsePool[neg.rounds % responsePool.length]);
  setQuickOffers(pid);

  if (neg.rounds >= 4) {
    setTimeout(() => lockFinalOffer(pid, counter), 800);
  }
}

function handleTextInput(pid, text) {
  const neg = STATE.negotiations[pid];
  const p = STATE.products.find(x => x.id === pid);
  const lc = text.toLowerCase();

  if (lc.includes('lowest') || lc.includes('minimum') || lc.includes('best') || lc.includes('final')) {
    addBubble('ai', `The seller's absolute minimum is <strong>₹${neg.minPrice.toLocaleString()}</strong>. That's already ${Math.round((1 - neg.minPrice / p.mrp) * 100)}% below MRP — an excellent deal!`);
  } else if (lc.includes('why') || lc.includes('expensive') || lc.includes('high')) {
    addBubble('ai', `Fair question! This item's MRP is ₹${p.mrp.toLocaleString()} and it's in <em>${p.condition}</em> condition. ${p.demand} buyers are interested right now, so it's priced competitively at ₹${neg.currentAiOffer.toLocaleString()}.`);
  } else if (lc.includes('condition') || lc.includes('damage')) {
    addBubble('ai', `The seller rates it: <em>${p.condition}</em>. "${p.desc.slice(0, 80)}…"`);
  } else {
    addBubble('ai', `Got it! My current best offer remains <strong>₹${neg.currentAiOffer.toLocaleString()}</strong>. You can type an offer amount or use the quick buttons below.`);
  }
  setQuickOffers(pid);
}

function lockFinalOffer(pid, price) {
  const neg = STATE.negotiations[pid];
  addBubble('system', `⏳ Final Round — this is the seller's last offer`);
  setTimeout(() => {
    addBubble('ai', `This is my <strong>final offer: ₹${price.toLocaleString()}</strong>. I can't go lower — the seller needs this minimum. Accept or we'll have to pass.`);
    document.getElementById('chat-quick').innerHTML =
      `<button class="quick-offer-btn accept" onclick="acceptOffer('${pid}')">✅ Accept ₹${price.toLocaleString()}</button>` +
      `<button class="quick-offer-btn" onclick="closeMd('md-chat')">Decline</button>`;
  }, 600);
}

function finalizeNegotiation(pid, price) {
  const neg = STATE.negotiations[pid];
  const p = STATE.products.find(x => x.id === pid);
  neg.status = 'agreed';
  neg.finalPrice = price;

  // Record offer in product for seller dashboard
  if (!p.negotiations) p.negotiations = [];
  p.negotiations.push({
    buyerId: STATE.user.id,
    buyerName: STATE.user.name,
    offer: price,
    at: Date.now(),
    recommended: price >= neg.minPrice + (neg.startPrice - neg.minPrice) * 0.3
  });

  addBubble('deal', `🎉 Deal agreed at ₹${price.toLocaleString()}! The seller has been notified.`);
  addBubble('ai', `Excellent! I've locked in the price at <strong>₹${price.toLocaleString()}</strong>. The seller can now see your offer. Once they confirm, you'll be able to chat directly to arrange pickup. 🤝`);
  document.getElementById('chat-quick').innerHTML = '';
  document.getElementById('chat-inp').disabled = true;
  updatePriceBar(price);
  document.getElementById('cm-sub').textContent = `✅ Deal locked at ₹${price.toLocaleString()}`;

  // reduce stock or remove sold item from listings
  if (p.qty > 1) {
    p.qty -= 1;
    p.demand = Math.max(0, p.demand - 1);
  } else {
    STATE.products = STATE.products.filter(x => x.id !== pid);
  }

  // update Firestore product status/qty when backend available
  if (p && p.id) {
    const updates = {};
    if (p.qty > 0) updates.qty = p.qty;
    updates.status = p.qty > 0 ? 'available' : 'sold';
    db.collection('products').doc(pid).update(updates).catch(err => console.warn('Failed to update product status:', err));
  }

  renderGrid();
  renderSeller();
}

function updatePriceBar(price) {
  const el = document.getElementById('live-price');
  if (el) el.textContent = `₹${price.toLocaleString()}`;
}

// ══════════════════════════════════════════
//  FINAL CHAT
// ══════════════════════════════════════════
function openFinalChat(pid, role) {
  const p = STATE.products.find(x => x.id === pid);
  if (!p) {
    console.error('openFinalChat: product not found', pid);
    alert('Product not found. Please refresh and retry.');
    return;
  }
  const neg = STATE.negotiations[pid];
  if (!neg) {
    console.error('openFinalChat: negotiation record not found for', pid);
    alert('No active negotiation for this product. Start negotiation first.');
    return;
  }
  const buyerId = neg.buyerId || STATE.user.id; // For buyer role
  const sellerId = p.sellerId;
  const chatId = `${pid}_${buyerId}_${sellerId}`;
  STATE.activeFinalKey = chatId;

  document.getElementById('fc-icon').textContent = p.img;
  document.getElementById('fc-title').textContent = p.name.length > 26 ? p.name.slice(0, 26) + '…' : p.name;
  document.getElementById('fc-deal-bar').textContent = `✅ Price agreed at ₹${neg ? neg.finalPrice?.toLocaleString() : '—'} · No more negotiation`;

  const msgs = document.getElementById('fc-msgs');
  msgs.innerHTML = '';

  // Load chat from Firestore
  const chatRef = db.collection('chats').doc(chatId);
  chatRef.get().then(doc => {
    if (doc.exists) {
      const chatData = doc.data();
      STATE.finalChats[chatId] = chatData.messages || [];
    } else {
      // Initialize chat
      STATE.finalChats[chatId] = [];
      const initialMsg = role === 'buyer'
        ? `Hi ${p.seller}! Deal confirmed at ₹${neg.finalPrice.toLocaleString()}. When can you come pick it up? I'm usually free after 4 PM near the Main Block.`
        : `Hi! I've confirmed your deal at ₹${neg.finalPrice.toLocaleString()}. When and where would you like to meet?`;
      const sender = role === 'buyer' ? STATE.user.name : p.seller;
      STATE.finalChats[chatId].push({ text: initialMsg, mine: role === 'buyer', sender, timestamp: Date.now() });
      // Save initial message
      chatRef.set({ messages: STATE.finalChats[chatId], productId: pid, buyerId, sellerId });
    }
    STATE.finalChats[chatId].forEach(m => addFinalBubble(m.text, m.mine, m.sender));

    // Set up real-time listener for chat updates
    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        const updatedMessages = doc.data().messages || [];
        // Only add new messages
        if (updatedMessages.length > STATE.finalChats[chatId].length) {
          for (let i = STATE.finalChats[chatId].length; i < updatedMessages.length; i++) {
            const m = updatedMessages[i];
            STATE.finalChats[chatId].push(m);
            addFinalBubble(m.text, m.mine === (role === 'buyer'), m.sender);
          }
        }
      }
    });
    // Store unsubscribe function to clean up later
    STATE.chatUnsubscribe = unsubscribe;
  }).catch(err => {
    console.error('Failed to load chat:', err);
    alert('Failed to load chat. Please try again.');
  });

  closeMd('md-product');
  closeMd('md-chat');
  openMd('md-finalchat');
}

function submitFinalMsg() {
  const inp = document.getElementById('fc-inp');
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  const key = STATE.activeFinalKey;
  const msg = { text, mine: true, sender: STATE.user.name, timestamp: Date.now() };
  STATE.finalChats[key].push(msg);
  addFinalBubble(text, true, STATE.user.name);

  // Save to Firestore
  const chatRef = db.collection('chats').doc(key);
  chatRef.update({
    messages: STATE.finalChats[key]
  }).catch(err => console.warn('Failed to save message:', err));

  // Simulate reply
  setTimeout(() => {
    const replies = [
      'Sounds good! See you then. Please bring exact change or UPI ready.',
      'Perfect! I\'ll be there. When can you arrive?',
      'Sure, works for me! Main Block main gate okay for you?',
      'Got it. See you! WhatsApp me if anything changes.',
      'Great — confirmed! Looking forward to meeting you.',
    ];
    const r = replies[Math.floor(Math.random() * replies.length)];
    const replyMsg = { text: r, mine: false, sender: 'Seller', timestamp: Date.now() };
    STATE.finalChats[key].push(replyMsg);
    addFinalBubble(r, false, 'Seller');
    // Save reply
    chatRef.update({
      messages: STATE.finalChats[key]
    }).catch(err => console.warn('Failed to save reply:', err));
  }, 1200);
}

function addFinalBubble(text, mine, sender) {
  const msgs = document.getElementById('fc-msgs');
  const d = document.createElement('div');
  d.className = `chat-bubble ${mine ? 'cb-user' : 'cb-ai'}`;
  d.innerHTML = mine ? text : `<strong style="font-size:12px;opacity:.7">${sender}</strong><br>${text}`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

// ══════════════════════════════════════════
//  SELLER DASHBOARD
// ══════════════════════════════════════════
function renderSeller() {
  if (!STATE.user) return;
  const myProds = STATE.products.filter(p => p.sellerId === STATE.user.id);
  const totalOffers = myProds.reduce((a, p) => a + (p.negotiations || []).length, 0);
  const totalVal = myProds.reduce((a, p) => a + p.price, 0);

  document.getElementById('seller-stats').innerHTML = `
    <div class="stat-card"><div class="sc-value">${myProds.length}</div><div class="sc-label">Active Listings</div></div>
    <div class="stat-card"><div class="sc-value">${myProds.reduce((a,p)=>a+p.demand,0)}</div><div class="sc-label">Total Interested</div></div>
    <div class="stat-card"><div class="sc-value">${totalOffers}</div><div class="sc-label">Buyer Offers</div><div class="sc-change ${totalOffers>0?'sc-up':''}">
      ${totalOffers > 0 ? '↑ Active' : 'Waiting'}
    </div></div>
    <div class="stat-card"><div class="sc-value">₹${(totalVal/1000).toFixed(1)}k</div><div class="sc-label">Listed Value</div></div>
  `;

  document.getElementById('listing-count').textContent = `${myProds.length} item${myProds.length !== 1 ? 's' : ''}`;

  const insights = document.getElementById('ai-insights');
  if (!myProds.length) {
    insights.innerHTML = `<div class="ai-insight-empty">
      <div style="font-size:28px;margin-bottom:8px">🤖</div>
      <p style="font-size:13px;color:var(--muted)">Add products to see AI pricing insights</p>
    </div>`;
  } else {
    const insightsList = myProds.map(p => {
      const negs = p.negotiations || [];
      if (negs.length) {
        const bestOffer = Math.max(...negs.map(n => n.finalPrice || n.currentAiOffer));
        return `<div class="ai-insight-item">
          <div class="ai-insight-icon">💰</div>
          <div class="ai-insight-content">
            <div class="ai-insight-title">${p.name}</div>
            <div class="ai-insight-text">Best buyer offer: ₹${bestOffer.toLocaleString()} (${negs.length} total)</div>
          </div>
        </div>`;
      } else {
        const suggestion = p.demand > 5 ? 'High demand — consider holding price' : p.demand < 2 ? 'Low interest — try reducing price by 10%' : 'Moderate interest — monitor for offers';
        return `<div class="ai-insight-item">
          <div class="ai-insight-icon">📊</div>
          <div class="ai-insight-content">
            <div class="ai-insight-title">${p.name}</div>
            <div class="ai-insight-text">${suggestion}</div>
          </div>
        </div>`;
      }
    }).join('');
    insights.innerHTML = insightsList;
  }

  const listEl = document.getElementById('seller-listings');
  if (!myProds.length) {
    listEl.innerHTML = `<div class="empty-state" style="padding:40px"><div class="es-icon">📦</div><h3>No listings yet</h3><p>Add your first product to start selling</p></div>`;
  } else {
    listEl.innerHTML = myProds.map(p => {
      const negs = p.negotiations || [];
      const isImg = p.img && (p.img.startsWith('http') || p.img.startsWith('data:'));
      return `<div class="seller-listing-row">
        <div class="slr-thumb">${isImg ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:9px">` : p.img}</div>
        <div class="slr-info">
          <div class="slr-name">${p.name}</div>
          <div class="slr-meta">₹${p.price.toLocaleString()} · ${p.category} · ${p.demand} interested${negs.length ? ` · <strong>${negs.length} offer${negs.length>1?'s':''}</strong>` : ''}</div>
        </div>
        <div class="slr-actions">
          ${negs.length
            ? `<button class="btn-primary" style="font-size:13px;padding:8px 14px" onclick="openOffersModal('${p.id}')">View Offers (${negs.length})</button>`
            : `<span class="status-chip sc-listed">No offers yet</span>`
          }
          <button class="btn-danger" style="font-size:13px;padding:8px 14px;margin-left:8px" onclick="deleteProduct('${p.id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  }
}

async function deleteProduct(pid) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await db.collection('products').doc(pid).delete();
    STATE.products = STATE.products.filter(p => p.id !== pid);
    delete STATE.negotiations[pid];
    renderGrid();
    renderSeller();
    alert('Product deleted successfully.');
  } catch (error) {
    console.error('Delete product failed', error);
    alert('Failed to delete product: ' + error.message);
  }
}

function openOffersModal(pid) {
  const p = STATE.products.find(x => x.id === pid);
  const negs = (p.negotiations || []).sort((a, b) => b.offer - a.offer); // Sort by offer amount descending
  const visitors = p.visitors || [];
  const best = negs[0];
  document.getElementById('offers-title').textContent = `Offers for: ${p.name.slice(0, 30)}`;
  document.getElementById('offers-body').innerHTML = `
    <div style="padding:0 24px 24px">
      ${visitors.length ? `
        <div class="visitors-section">
          <div class="section-head" style="margin-bottom:10px"><h4 class="section-title">Visitors (${visitors.length})</h4></div>
          <div class="visitors-list">
            ${visitors.slice(0, 5).map(v => `<span class="visitor-tag">${v.name}</span>`).join('')}
            ${visitors.length > 5 ? `<span class="visitor-tag">+${visitors.length - 5} more</span>` : ''}
          </div>
        </div>
      ` : ''}
      ${best ? `<div class="ai-rec-banner">
        <div class="arb-icon">🤖</div>
        <div>
          <div class="arb-title">AI Recommendation: Accept ${best.buyerName}'s offer</div>
          <div class="arb-sub">₹${best.offer.toLocaleString()} — best offer received. ${best.recommended ? 'Strong profit margin confirmed.' : 'Meets your minimum threshold.'}</div>
        </div>
      </div>` : ''}
      ${negs.map((n, i) => `
        <div class="buyer-offer-card ${i === 0 ? 'best' : ''}">
          <div class="boc-avatar" style="background:hsl(${(n.buyerName.charCodeAt(0)*7)%360},60%,85%)">${n.buyerName[0]}</div>
          <div class="boc-info">
            <div class="boc-name">${n.buyerName}</div>
            <div class="boc-offer">Offered <strong>₹${n.offer.toLocaleString()}</strong> · ${timeAgo(n.at)}</div>
            ${n.recommended ? '<div class="fairness-badge">⭐ Fair Price</div>' : ''}
          </div>
          <div class="boc-right">
            ${i === 0 ? `<span class="best-badge">⭐ AI Pick</span>` : ''}
            <button class="btn-primary" style="font-size:12px;padding:7px 12px" onclick="openSellerChat('${n.buyerName}',${n.offer},'${pid}')">Chat</button>
          </div>
        </div>
      `).join('')}
      ${negs.length === 0 ? '<div class="empty-state"><div class="es-icon">🤷</div><h3>No offers yet</h3></div>' : ''}
    </div>`;
  openMd('md-offers');
}

function openSellerChat(buyerName, offer, pid) {
  const p = STATE.products.find(x => x.id === pid);
  const buyer = p.negotiations.find(n => n.buyerName === buyerName && n.offer === offer);
  const buyerId = buyer.buyerId;
  const sellerId = p.sellerId;
  const chatId = `${pid}_${buyerId}_${sellerId}`;
  STATE.activeFinalKey = chatId;
  closeMd('md-offers');

  document.getElementById('fc-icon').textContent = p.img;
  document.getElementById('fc-title').textContent = `Chat with ${buyerName}`;
  document.getElementById('fc-deal-bar').textContent = `✅ Deal at ₹${offer.toLocaleString()} · Arrange pickup here`;

  const msgs = document.getElementById('fc-msgs');
  msgs.innerHTML = '';

  // Load chat from Firestore
  const chatRef = db.collection('chats').doc(chatId);
  chatRef.get().then(doc => {
    if (doc.exists) {
      const chatData = doc.data();
      STATE.finalChats[chatId] = chatData.messages || [];
    } else {
      // Initialize chat
      STATE.finalChats[chatId] = [];
      const initialMsg = `Hi ${buyerName}! I've agreed to your price of ₹${offer.toLocaleString()} for the ${p.name}. When and where can we meet?`;
      STATE.finalChats[chatId].push({ text: initialMsg, mine: true, sender: STATE.user.name, timestamp: Date.now() });
      // Save initial message
      chatRef.set({ messages: STATE.finalChats[chatId], productId: pid, buyerId, sellerId });
    }
    STATE.finalChats[chatId].forEach(m => addFinalBubble(m.text, m.mine, m.sender));
  }).catch(err => {
    console.error('Failed to load chat:', err);
    alert('Failed to load chat. Please try again.');
  });

  openMd('md-finalchat');
}

// ══════════════════════════════════════════
//  ACTIVITY VIEW
// ══════════════════════════════════════════
function renderActivity() {
  const div = document.getElementById('activity-content');
  const negs = Object.values(STATE.negotiations);
  if (!negs.length) {
    div.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><h3>No activity yet</h3><p>Browse products and start negotiating to see your activity here</p></div>`;
    return;
  }
  div.innerHTML = `<div class="activity-section">
    <div class="section-head"><h3 class="section-title">Your Negotiations</h3></div>
    ${negs.map(neg => {
      const p = STATE.products.find(x => x.id === neg.productId);
      if (!p) return '';
      const agreed = neg.status === 'agreed';
      return `<div class="activity-card">
        <div class="ac-thumb">${p.img}</div>
        <div class="ac-info">
          <div class="ac-name">${p.name}</div>
          <div class="ac-meta">${agreed ? `✅ Agreed at ₹${neg.finalPrice.toLocaleString()} · ${p.seller}` : `🔄 Negotiating — AI offer ₹${neg.currentAiOffer?.toLocaleString()}`}</div>
        </div>
        <div class="ac-actions">
          <span class="status-chip ${agreed ? 'sc-agreed' : 'sc-negotiating'}">${agreed ? 'Deal Done' : 'In Progress'}</span>
          ${agreed
            ? `<button class="btn-primary" style="font-size:13px;padding:8px 14px" onclick="openFinalChat('${p.id}','buyer')">💬 Chat</button>`
            : `<button class="btn-outline" style="font-size:13px;padding:8px 14px" onclick="openNegotiation('${p.id}')">Continue</button>`
          }
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ══════════════════════════════════════════
//  ADD PRODUCT
// ══════════════════════════════════════════
function openAddProduct() {
  openMd('md-addproduct');
}

function updateAiSuggestion() {
  const price = parseInt(document.getElementById('ap-price').value);
  const mrp = parseInt(document.getElementById('ap-mrp').value);
  const cat = document.getElementById('ap-cat').value;
  const panel = document.getElementById('ap-ai-content');

  if (!price || price < 10) { panel.innerHTML = '<div class="ai-empty-hint">Enter a price to see AI recommendations</div>'; return; }

  const cfg = AI_MARGIN[cat] || AI_MARGIN.default;
  const suggested = Math.round(price * (1 + (cfg.markup || 0.14)));
  const minP = Math.round(price * cfg.min);
  const profit = suggested - price;
  const disc = mrp > price ? Math.round((1 - price / mrp) * 100) : null;

  panel.innerHTML = `
    <div class="ai-suggestion-row">
      <div class="asr-label">Suggested List Price</div>
      <div class="asr-val">₹${suggested.toLocaleString()}</div>
      <div class="asr-sub">+${Math.round((cfg.markup||0.14)*100)}% above your base</div>
    </div>
    <div class="asr-range">
      <div class="asr-range-item">
        <div class="arr-label">Floor</div>
        <div class="arr-val red">₹${minP.toLocaleString()}</div>
      </div>
      <div class="asr-range-item">
        <div class="arr-label">Ceiling</div>
        <div class="arr-val green">₹${suggested.toLocaleString()}</div>
      </div>
    </div>
    <div class="ai-suggestion-row" style="margin-top:10px">
      <div class="asr-label">Estimated Profit</div>
      <div class="asr-val" style="color:var(--green)">₹${profit.toLocaleString()}</div>
    </div>
    ${disc ? `<div class="ai-suggestion-row"><div class="asr-label">vs MRP Discount</div><div class="asr-val">${disc}% off</div><div class="asr-sub">Attractive to buyers</div></div>` : ''}
  `;
}

function previewImage() {
  const file = document.getElementById('ap-img-file').files[0];
  const preview = document.getElementById('ap-img-preview');
  if (file) {
    const reader = new FileReader();
    reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 100px;">`;
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
  }
}

async function submitAddProduct() {
  console.log('submitAddProduct called');
  const name = document.getElementById('ap-name').value.trim();
  const price = parseInt(document.getElementById('ap-price').value);
  const mrp = parseInt(document.getElementById('ap-mrp').value) || price;
  const cat = document.getElementById('ap-cat').value;
  const desc = document.getElementById('ap-desc').value.trim();
  const imgInput = document.getElementById('ap-img').value.trim();
  const qty = parseInt(document.getElementById('ap-qty').value) || 1;
  const dur = parseInt(document.getElementById('ap-dur').value) || 3;
  const condition = document.getElementById('ap-condition').value;

  console.log('values', { name, price, mrp, cat, desc, imgInput, qty, dur, condition });
  if (!name || !price) {
    alert('Please fill in at least a name and price.');
    console.warn('submitAddProduct validation failed', { name, price });
    return;
  }

  let img = imgInput || '📦';
  const file = document.getElementById('ap-img-file').files[0];

  const newP = {
    name, category: cat, price, mrp, condition, qty, desc, img,
    seller: STATE.user?.name || 'Unknown Seller',
    sellerId: STATE.user?.id || 'unknown',
    demand: 0,
    createdAt: Date.now(),
    duration: dur,
    reviews: [],
    negotiations: [],
  };
  console.log('newP prepared', newP);

  if (file) {
    // Bypass Firebase Storage CORS in local dev (127.0.0.1:5500 is often blocked)
    // directly use DataURL so product is still saved/visible.
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(err => {
      console.warn('DataURL conversion failed:', err);
      return null;
    });

    if (dataUrl) {
      img = dataUrl;
      newP.img = img;
    } else if (imgInput) {
      img = imgInput;
      newP.img = img;
    } else {
      img = '📦';
      newP.img = img;
    }
  }

  // Save to Firestore
  try {
    const docRef = await db.collection('products').add(newP);
    console.log('Product written with ID:', docRef.id);
    // Force reload so seeded list + new entry display is accurate
    await loadProducts();
  } catch (error) {
    console.error('Failed to add product to Firestore:', error);
    alert('Failed to list product: ' + error.message);
    return;
  }

  closeMd('md-addproduct');
  // Reset form
  ['ap-name','ap-price','ap-mrp','ap-qty','ap-desc','ap-img'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('ap-img-file').value = '';
  document.getElementById('ap-img-preview').innerHTML = '';
  document.getElementById('ap-ai-content').innerHTML = '<div class="ai-empty-hint">Enter a price to see AI recommendations</div>';
}

// ══════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════
function openMd(id) { document.getElementById(id).classList.add('open'); }
function closeMd(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'md-finalchat' && STATE.chatUnsubscribe) {
    STATE.chatUnsubscribe();
    STATE.chatUnsubscribe = null;
  }
}

// ══════════════════════════════════════════
//  CHAT HELPERS
// ══════════════════════════════════════════
function addBubble(type, html) {
  const msgs = document.getElementById('chat-msgs');
  const d = document.createElement('div');
  if (type === 'ai') d.className = 'chat-bubble cb-ai';
  else if (type === 'user') d.className = 'chat-bubble cb-user';
  else if (type === 'system') d.className = 'chat-bubble cb-system';
  else d.className = 'chat-bubble cb-deal';
  d.innerHTML = html;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping(containerId) {
  const msgs = document.getElementById(containerId);
  const d = document.createElement('div');
  d.className = 'chat-bubble cb-ai';
  d.id = `typing_${containerId}`;
  d.innerHTML = '<div class="typing-dots"><div class="td"></div><div class="td"></div><div class="td"></div></div>';
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping(containerId) {
  const t = document.getElementById(`typing_${containerId}`);
  if (t) t.remove();
}

// ══════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
});