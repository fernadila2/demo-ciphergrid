/* CIPHERGRID — shared UI layer (shell, search, notifications, modals, effects). */
(function () {
  const UI = {};
  const ICONS = {
    home: 'M3 11l9-8 9 8v10H3zM9 21v-6h6v6', book: 'M4 4h11a4 4 0 014 4v12H8a4 4 0 01-4-4zM8 4v12', flask: 'M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M8 15h8',
    flag: 'M5 21V4M5 4h12l-2 4 2 4H5', trophy: 'M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 21h8', bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0', bell: 'M6 16v-5a6 6 0 0112 0v5l2 2H4zM10 21h4', search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
    cube: 'M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', flame: 'M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4 3-7 1 1 2 1 3-5z',
    lock: 'M6 11h12v10H6zM8 11V7a4 4 0 018 0v4', unlock: 'M6 11h12v10H6zM8 11V7a4 4 0 017.5-2', terminal: 'M3 5h18v14H3zM7 10l3 2-3 2M12 15h5', shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', key: 'M8 15a4 4 0 110-8 4 4 0 010 8zM11 12h10M18 12v3', code: 'M8 7l-5 5 5 5M16 7l5 5-5 5',
    network: 'M12 3v5M5 21v-5h14v5M12 8v8M3 8h18', globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', check: 'M5 12l5 5 9-10', x: 'M6 6l12 12M18 6L6 18',
    menu: 'M4 6h16M4 12h16M4 18h16', chev: 'M9 6l6 6-6 6', arrow: 'M5 12h14M13 6l6 6-6 6', play: 'M7 4l13 8-13 8z', clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 8a3 3 0 010 6M21 20a6 6 0 00-4-5', star: 'M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.2L12 17.2 6.5 20l1-6.2L3 9.5l6.3-.9z',
    moon: 'M20 14A8 8 0 1110 4a7 7 0 0010 10z', ghost: 'M5 21V10a7 7 0 0114 0v11l-3-2-2 2-2-2-2 2-2-2zM9 11h.01M15 11h.01', target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
    lightbulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z', refresh: 'M20 11a8 8 0 10-2 6M20 4v7h-7', cloud: 'M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 18z',
    database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3', cpu: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
    bug: 'M9 8a3 3 0 016 0v7a3 3 0 01-6 0zM3 12h4M17 12h4M5 6l3 3M19 6l-3 3M5 19l3-3M19 19l-3-3', siren: 'M6 18v-5a6 6 0 0112 0v5M4 18h16M12 2v2M3 6l2 1M21 6l-2 1',
    radar: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 12l6-6M12 16a4 4 0 100-8', file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6', grid: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5v.01', alert: 'M12 3l10 18H2zM12 10v5M12 18v.01', logout: 'M10 4H4v16h6M15 8l4 4-4 4M19 12H9', copy: 'M8 8h12v12H8zM4 16V4h12',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z', edit: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3', plus: 'M12 5v14M5 12h14', down: 'M6 9l6 6 6-6', up: 'M6 15l6-6 6 6', wallet: 'M3 7h16a2 2 0 012 2v10H5a2 2 0 01-2-2zM3 7V5a2 2 0 012-2h12M16 14h.01',
  };
  UI.icon = (n, s) => '<svg class="ic" width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICONS[n] || ICONS.info) + '"/></svg>';
  UI.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  UI.$ = $; UI.$$ = $$;

  /* ---------- small renderers ---------- */
  UI.diff = (d) => '<span class="diff diff-' + d.toLowerCase() + '">' + d + '</span>';
  UI.progress = (pct, cls) => '<div class="bar ' + (cls || '') + '" role="progressbar" aria-valuenow="' + Math.round(pct) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>';
  UI.cubeTag = (n) => '<span class="rw rw-cube">' + UI.icon('cube', 14) + CG.fmt(n) + '</span>';
  UI.xpTag = (n) => '<span class="rw rw-xp">' + UI.icon('bolt', 14) + CG.fmt(n) + ' XP</span>';
  UI.empty = (o) => '<div class="empty">' + UI.icon(o.icon || 'info', 34) + '<h3>' + o.title + '</h3><p>' + (o.text || '') + '</p>' + (o.cta ? '<a class="btn btn-primary" href="' + o.href + '">' + o.cta + '</a>' : '') + '</div>';
  UI.skeleton = (n) => '<div class="sk-wrap">' + '<div class="sk sk-h"></div>'.repeat(1) + '<div class="grid g3">' + '<div class="sk sk-card"></div>'.repeat(n || 3) + '</div></div>';
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  UI.avatarSvg = (seed, hue, px) => {
    const h = hash(seed || 'x'); let cells = '';
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      if ((h >> (y * 3 + x)) & 1) { cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; if (x < 2) cells += '<rect x="' + (4 - x) + '" y="' + y + '" width="1" height="1"/>'; }
    }
    return '<svg viewBox="-0.6 -0.6 6.2 6.2" width="' + px + '" height="' + px + '" fill="hsl(' + hue + ' 90% 62%)" aria-hidden="true"><rect x="-0.6" y="-0.6" width="6.2" height="6.2" fill="hsl(' + hue + ' 40% 10%)"/>' + cells + '</svg>';
  };
  UI.avatar = (p, px) => {
    px = px || 40; const av = p.avatar || { seed: p.name, hue: 150 };
    return '<span class="avatar frame-' + (p.frame || 'none') + '" style="width:' + px + 'px;height:' + px + 'px">' + UI.avatarSvg(av.seed, av.hue, px) + '</span>';
  };
  UI.userAvatar = (name, px) => UI.avatar({ name, avatar: { seed: name, hue: hash(name) % 360 } }, px);

  /* ---------- toasts ---------- */
  UI.toast = (o) => {
    let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + (o.kind || 'info');
    t.innerHTML = '<div class="toast-ic">' + UI.icon(o.icon || (o.kind === 'bad' ? 'alert' : o.kind === 'good' ? 'check' : 'info'), 18) + '</div><div><b>' + UI.esc(o.title || '') + '</b><p>' + UI.esc(o.msg || '') + '</p></div>';
    box.appendChild(t); requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, o.ms || 4200);
  };
  CG.on('toast', UI.toast);

  /* ---------- modals ---------- */
  let lastFocus = null;
  UI.modal = (o) => {
    lastFocus = document.activeElement;
    const wrap = document.createElement('div'); wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal ' + (o.cls || '') + '" role="dialog" aria-modal="true" aria-label="' + UI.esc(o.title || 'Dialog') + '" tabindex="-1">' +
      (o.title ? '<div class="modal-head"><h2>' + o.title + '</h2><button class="icon-btn" data-close aria-label="Close">' + UI.icon('x') + '</button></div>' : '') +
      '<div class="modal-body">' + (o.html || '') + '</div></div>';
    document.body.appendChild(wrap); document.body.classList.add('noscroll');
    const m = $('.modal', wrap);
    const close = () => { wrap.classList.remove('in'); document.body.classList.remove('noscroll'); setTimeout(() => wrap.remove(), 220); document.removeEventListener('keydown', esc); if (o.onClose) o.onClose(); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    const esc = (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') { const f = $$('button,a[href],input,select,textarea,[tabindex="0"]', m).filter((x) => !x.disabled); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } };
    document.addEventListener('keydown', esc);
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    requestAnimationFrame(() => { wrap.classList.add('in'); m.focus(); });
    return { el: m, close };
  };
  UI.confirm = (title, text, yes) => new Promise((res) => {
    const m = UI.modal({ title, html: '<p class="mute">' + text + '</p><div class="row end gap"><button class="btn btn-ghost" data-no>Cancel</button><button class="btn btn-primary" data-yes>' + (yes || 'Confirm') + '</button></div>', onClose: () => res(false) });
    m.el.querySelector('[data-yes]').onclick = () => { res(true); m.close(); };
    m.el.querySelector('[data-no]').onclick = () => m.close();
  });

  /* ---------- effects ---------- */
  UI.countUp = (el, to, ms) => {
    if (!el) return; const from = Number(String(el.textContent).replace(/[^\d-]/g, '')) || 0; const t0 = performance.now(); ms = ms || 700;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || from === to) { el.textContent = CG.fmt(to); return; }
    const step = (t) => { const p = Math.min(1, (t - t0) / ms); el.textContent = CG.fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  UI.type = (el, text, speed) => new Promise((res) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent += text; return res(); }
    let i = 0; const tick = () => { el.textContent += text[i++] || ''; if (i < text.length) setTimeout(tick, speed || 14); else res(); }; tick();
  });
  UI.fx = {
    float(text, cls) {
      const d = document.createElement('div'); d.className = 'float-pop ' + (cls || ''); d.textContent = text;
      document.body.appendChild(d); setTimeout(() => d.remove(), 1600);
    },
    cubes(n) {
      const target = $('#walletBtn'); if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const tr = target.getBoundingClientRect(); const burst = CG.state && CG.state.profile.fx === 'burst';
      const count = Math.min(burst ? 22 : 12, Math.max(4, Math.round(n / 12)));
      const sx = window.innerWidth / 2, sy = window.innerHeight * 0.55;
      for (let i = 0; i < count; i++) {
        const c = document.createElement('div'); c.className = 'fly-cube'; c.innerHTML = UI.icon('cube', 18);
        c.style.left = sx + 'px'; c.style.top = sy + 'px'; document.body.appendChild(c);
        const ox = (Math.random() - 0.5) * (burst ? 320 : 180), oy = (Math.random() - 0.5) * (burst ? 220 : 120);
        c.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 0 }, { transform: 'translate(' + ox + 'px,' + oy + 'px) scale(1)', opacity: 1, offset: 0.35 }, { transform: 'translate(' + (tr.left + tr.width / 2 - sx) + 'px,' + (tr.top + tr.height / 2 - sy) + 'px) scale(.5)', opacity: 0.2 }], { duration: 900 + i * 40, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).onfinish = () => c.remove();
      }
      setTimeout(() => { target.classList.add('bump'); setTimeout(() => target.classList.remove('bump'), 450); }, 900);
    },
  };
  CG.on('award', (a) => { if (a.xp) UI.fx.float('+' + a.xp + ' XP', 'xp'); if (a.cubes) { setTimeout(() => UI.fx.float('+' + a.cubes + ' CUBES', 'cube'), 180); UI.fx.cubes(a.cubes); } });
  let modalQ = Promise.resolve();
  CG.on('levelup', (d) => {
    modalQ = modalQ.then(() => new Promise((res) => setTimeout(() => {
      UI.modal({ cls: 'celebrate', html: '<div class="lvl-burst"><div class="ring r1"></div><div class="ring r2"></div><span class="mono mute">NEW SECTOR UNLOCKED</span><h2>LEVEL ' + d.level + '</h2><p>Rank: <b>' + d.rank + '</b></p><p class="mute">Reward: +' + d.bonus + ' Cubes</p><button class="btn btn-primary" data-close>CONTINUE</button></div>', onClose: res });
    }, 900)));
  });
  CG.on('achievement', (a) => {
    UI.toast({ title: 'ACHIEVEMENT UNLOCKED', msg: a.name + ' (+' + a.reward + ' Cubes)', kind: 'ach', icon: a.icon, ms: 5200 });
  });

  /* ---------- shell ---------- */
  const NAV = [['dashboard', 'Dashboard', 'grid', 'dashboard.html'], ['courses', 'Learn', 'book', 'courses.html'], ['labs', 'Labs', 'flask', 'labs.html'], ['challenges', 'Challenges', 'flag', 'challenges.html'], ['leaderboard', 'Leaderboard', 'trophy', 'leaderboard.html'], ['shop', 'Shop', 'bag', 'shop.html'], ['profile', 'Profile', 'user', 'profile.html']];
  UI.shell = (active) => {
    if (!CG.requireAuth()) return null;
    const s = CG.state;
    const nav = NAV.map((n) => '<a href="' + n[3] + '" class="nav-link' + (n[0] === active ? ' on' : '') + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + UI.icon(n[2], 18) + '<span>' + n[1] + '</span></a>').join('');
    const bottom = [NAV[0], NAV[1], NAV[2], NAV[3]].map((n) => '<a href="' + n[3] + '" class="' + (n[0] === active ? 'on' : '') + '">' + UI.icon(n[2], 20) + '<span>' + n[1] + '</span></a>').join('') + '<button id="moreBtn" aria-label="More navigation">' + UI.icon('menu', 20) + '<span>More</span></button>';
    document.body.insertAdjacentHTML('afterbegin',
      '<a class="skip" href="#view">Skip to content</a><div class="app"><aside class="side" id="side" aria-label="Primary"><div class="side-top"><a class="brand" href="dashboard.html">' + UI.logo() + '<b>CIPHERGRID</b></a><button class="icon-btn side-x" id="sideX" aria-label="Close menu">' + UI.icon('x') + '</button></div>' +
      '<nav class="nav">' + nav + '</nav><div class="side-foot"><div class="streak-mini" id="streakMini"></div><div class="sys"><i class="dot live"></i><span class="mono">SYSTEM STATUS: ONLINE</span></div><button class="nav-link" id="logoutBtn">' + UI.icon('logout', 18) + '<span>Sign out</span></button></div></aside><div class="scrim" id="scrim"></div>' +
      '<div class="main"><header class="top"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">' + UI.icon('menu') + '</button>' +
      '<div class="search" role="search"><span class="search-ic">' + UI.icon('search', 16) + '</span><input id="gsearch" type="search" placeholder="Search courses, labs, challenges, users" autocomplete="off" aria-label="Global search"><kbd>/</kbd><div class="search-res" id="sres" hidden></div></div>' +
      '<div class="top-r"><span class="lvl-chip mono" id="lvlChip"></span><button class="wallet" id="walletBtn" aria-label="Open Cube wallet">' + UI.icon('cube', 18) + '<b id="cubeBal">' + CG.fmt(s.cubes) + '</b></button>' +
      '<div class="dd-wrap"><button class="icon-btn" id="bellBtn" aria-label="Notifications" aria-expanded="false">' + UI.icon('bell') + '<i class="badge-n" id="bellN" hidden></i></button><div class="dd notif" id="notifDD" hidden></div></div>' +
      '<div class="dd-wrap"><button class="avatar-btn" id="avBtn" aria-label="Account menu" aria-expanded="false"></button><div class="dd acct" id="acctDD" hidden></div></div></div></header>' +
      '<main id="view" class="view" tabindex="-1"></main><footer class="foot mono">CIPHERGRID prototype. Demo data only. Cubes are virtual points with no cash value.</footer></div></div>' +
      '<nav class="bottom" aria-label="Quick navigation">' + bottom + '</nav>');
    UI.refreshChrome(); bindShell(); return $('#view');
  };
  UI.logo = () => '<svg class="logo" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M16 2l12 7v14l-12 7-12-7V9z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 2v14m0 0l12-7M16 16L4 9" stroke="currentColor" stroke-width="1.4" opacity=".6" fill="none"/><rect x="13" y="13" width="6" height="6" fill="currentColor"/></svg>';
  UI.refreshChrome = () => {
    if (!CG.state) return; const s = CG.state; const li = CG.levelInfo(s.xp);
    const bal = $('#cubeBal'); if (bal && String(bal.textContent).replace(/\D/g, '') !== String(s.cubes)) UI.countUp(bal, s.cubes, 800);
    const chip = $('#lvlChip'); if (chip) chip.innerHTML = 'LV ' + li.level + ' <i class="mini-bar"><i style="width:' + li.pct + '%"></i></i>';
    const av = $('#avBtn'); if (av) av.innerHTML = UI.avatar(s.profile, 34);
    const un = s.notifs.filter((n) => !n.read).length; const b = $('#bellN'); if (b) { b.hidden = !un; b.textContent = un > 9 ? '9+' : un; }
    const sm = $('#streakMini'); if (sm) { const st = CG.streakInfo(); sm.innerHTML = UI.icon('flame', 16) + '<b>' + st.current + '</b> day streak' + (st.activeToday ? '' : '<small>Keep it alive today</small>'); }
    const nd = $('#notifDD'); if (nd && !nd.hidden) renderNotifs();
  };
  CG.on('change', UI.refreshChrome); CG.on('notify', UI.refreshChrome);

  const NOTIF_IC = { level: 'bolt', reward: 'cube', achievement: 'trophy', unlock: 'unlock', board: 'users', streak: 'flame', shop: 'bag', info: 'info' };
  function renderNotifs() {
    const s = CG.state; const nd = $('#notifDD');
    nd.innerHTML = '<div class="dd-head"><b>Notifications</b><button class="link" id="readAll">Mark all as read</button></div><div class="dd-list">' +
      (s.notifs.length ? s.notifs.map((n) => '<button class="n-item' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '">' + UI.icon(NOTIF_IC[n.type] || 'info', 16) + '<span>' + UI.esc(n.text) + '<small>' + CG.ago(n.ts) + '</small></span>' + (n.read ? '' : '<i class="dot"></i>') + '</button>').join('') : '<p class="mute pad">No notifications yet. Complete a lesson to get started.</p>') + '</div>';
    $('#readAll', nd).onclick = () => { s.notifs.forEach((n) => (n.read = true)); CG.save(); UI.refreshChrome(); };
    $$('.n-item', nd).forEach((b) => (b.onclick = () => { const n = s.notifs.find((x) => x.id === b.dataset.id); if (n) n.read = true; CG.save(); UI.refreshChrome(); }));
  }
  function toggleDD(btn, dd, open, onOpen) {
    const show = open === undefined ? dd.hidden : open;
    $$('.dd').forEach((d) => { d.hidden = true; }); $$('[aria-expanded]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (show) { dd.hidden = false; btn.setAttribute('aria-expanded', 'true'); if (onOpen) onOpen(); }
  }
  UI.wallet = () => {
    const s = CG.state;
    const m = UI.modal({ title: 'Cube Wallet', cls: 'wide', html: '<div class="wallet-hero"><span class="mono mute">BALANCE</span><div class="big">' + UI.icon('cube', 34) + '<b>' + CG.fmt(s.cubes) + '</b> <small>CUBES</small></div><p class="mute">Virtual platform points. Earned by learning, spent on cosmetics and premium labs. No cash value.</p></div>' +
      '<div class="grid g2"><div><h3 class="h-sm">Recent transactions</h3><ul class="tx">' + (s.tx.length ? s.tx.slice(0, 8).map((t) => '<li><span class="' + (t.amt > 0 ? 'pos' : 'neg') + ' mono">' + (t.amt > 0 ? '+' : '') + CG.fmt(t.amt) + '</span><span>' + UI.esc(t.reason) + '</span><small>' + CG.ago(t.ts) + '</small></li>').join('') : '<li class="mute">No transactions yet.</li>') + '</ul></div>' +
      '<div><h3 class="h-sm">Ways to earn</h3><ul class="earn"><li><b>Lessons</b> +20 each</li><li><b>Labs</b> +90 to +600</li><li><b>Challenges</b> +50 to +300</li><li><b>Daily mission</b> +35 to +60</li><li><b>Streak bonuses</b> up to +1,000</li><li><b>Achievements</b> up to +1,000</li><li><b>Course completion</b> +200 to +750</li></ul><a class="btn btn-primary" href="shop.html">SPEND CUBES</a></div></div>' });
    return m;
  };
  function bindShell() {
    const side = $('#side'), scrim = $('#scrim');
    const openSide = (o) => { side.classList.toggle('open', o); scrim.classList.toggle('on', o); };
    $('#menuBtn').onclick = () => openSide(true); $('#sideX').onclick = () => openSide(false); scrim.onclick = () => openSide(false); $('#moreBtn').onclick = () => openSide(true);
    $('#logoutBtn').onclick = () => { CG.auth.logout(); location.href = 'index.html'; };
    $('#walletBtn').onclick = () => UI.wallet();
    $('#bellBtn').onclick = (e) => { e.stopPropagation(); toggleDD(e.currentTarget, $('#notifDD'), undefined, renderNotifs); };
    $('#avBtn').onclick = (e) => {
      e.stopPropagation(); const p = CG.state.profile;
      toggleDD(e.currentTarget, $('#acctDD'), undefined, () => {
        $('#acctDD').innerHTML = '<div class="dd-head col"><b>' + UI.esc(p.name) + '</b><small class="mute">' + UI.esc(p.email) + '</small></div><a class="dd-link" href="profile.html">' + UI.icon('user', 16) + 'Profile</a><a class="dd-link" href="shop.html">' + UI.icon('bag', 16) + 'Shop</a><button class="dd-link" id="resetBtn">' + UI.icon('refresh', 16) + 'Reset demo progress</button>';
        $('#resetBtn').onclick = async () => { if (await UI.confirm('Reset demo progress?', 'This clears XP, Cubes, lessons, labs and challenges for this account and reloads the demo data.', 'Reset')) { const e = CG.email; CG.auth.resetDemo(); if (e === 'operator@ciphergrid.dev') CG.auth.demo(); else { CG.auth.logout(); } location.reload(); } };
      });
    };
    document.addEventListener('click', (e) => { if (!e.target.closest('.dd-wrap')) { $$('.dd').forEach((d) => { d.hidden = true; }); } if (!e.target.closest('.search')) { const r = $('#sres'); if (r) r.hidden = true; } });
    initSearch();
    document.addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#gsearch').focus(); } });
  }

  /* ---------- global search ---------- */
  let index = null;
  function buildIndex() {
    index = [];
    CG.courses.forEach((c) => index.push({ type: 'Course', t: c.title, sub: c.cat + ' / ' + c.diff, href: 'course.html?id=' + c.id, ic: 'book', k: (c.title + ' ' + c.topic + ' ' + c.cat).toLowerCase() }));
    CG.allLessons().forEach(({ c, l }) => index.push({ type: 'Lesson', t: l.t, sub: c.title, href: 'course.html?id=' + c.id + '&l=' + l.id, ic: 'file', k: (l.t + ' ' + c.title).toLowerCase() }));
    CG.data.labs.forEach((l) => index.push({ type: 'Lab', t: l.name, sub: l.cat + ' / ' + l.diff, href: 'lab.html?id=' + l.id, ic: 'flask', k: (l.name + ' ' + l.cat + ' ' + l.diff).toLowerCase() }));
    CG.data.challenges.forEach((c) => index.push({ type: 'Challenge', t: c.title, sub: c.cat + ' / ' + c.diff, href: 'challenges.html?c=' + c.id, ic: 'flag', k: (c.title + ' ' + c.cat + ' ' + c.diff).toLowerCase() }));
    CG.data.users.forEach((u) => index.push({ type: 'User', t: u.name, sub: 'Level ' + CG.levelFor(u.xp), href: 'profile.html?u=' + encodeURIComponent(u.name), ic: 'user', k: u.name.toLowerCase() }));
  }
  function initSearch() {
    const input = $('#gsearch'), box = $('#sres'); let cur = -1;
    const run = () => {
      const q = input.value.trim().toLowerCase(); if (!q) { box.hidden = true; return; }
      if (!index) buildIndex();
      const res = index.filter((i) => i.k.includes(q)).sort((a, b) => (b.t.toLowerCase().startsWith(q) - a.t.toLowerCase().startsWith(q))).slice(0, 12);
      box.hidden = false; cur = -1;
      box.innerHTML = res.length ? res.map((r) => '<a href="' + r.href + '" class="sr">' + UI.icon(r.ic, 16) + '<span><b>' + UI.esc(r.t) + '</b><small>' + UI.esc(r.sub) + '</small></span><em>' + r.type + '</em></a>').join('') : '<p class="mute pad">No matches for "' + UI.esc(q) + '". Try a topic like "web" or "linux".</p>';
    };
    input.addEventListener('input', run); input.addEventListener('focus', run);
    input.addEventListener('keydown', (e) => {
      const items = $$('.sr', box);
      if (e.key === 'Escape') { box.hidden = true; input.blur(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % (items.length || 1); items.forEach((i, n) => i.classList.toggle('on', n === cur)); }
      if (e.key === 'Enter' && items.length) { items[Math.max(cur, 0)].click(); location.href = items[Math.max(cur, 0)].href; }
    });
  }

  /* ---------- page helper with skeleton ---------- */
  UI.page = (view, render, n) => {
    view.innerHTML = UI.skeleton(n);
    const go = () => { view.innerHTML = ''; try { render(view); } catch (e) { console.error(e); view.innerHTML = UI.empty({ icon: 'alert', title: 'ACCESS DENIED: something broke', text: 'This section failed to load. Reload the page to retry.' }); } view.classList.remove('page-in'); void view.offsetWidth; view.classList.add('page-in'); };
    setTimeout(go, 260);
  };
  UI.tabs = (host, tabs, active, on) => {
    host.innerHTML = tabs.map((t) => '<button role="tab" class="tab' + (t[0] === active ? ' on' : '') + '" data-t="' + t[0] + '" aria-selected="' + (t[0] === active) + '">' + t[1] + '</button>').join('');
    host.setAttribute('role', 'tablist'); host.classList.add('tabs');
    host.onclick = (e) => { const b = e.target.closest('.tab'); if (!b) return; $$('.tab', host).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); on(b.dataset.t); };
  };
  UI.param = (k) => new URLSearchParams(location.search).get(k);

  window.UI = UI;
})();
