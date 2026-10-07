/* CIPHERGRID — state store (LocalStorage demo backend).
 * All persistence goes through CG.save() and the auth helpers so a real API can replace this layer:
 *   CG.auth.*  -> POST /auth/*        CG.award/spend -> POST /progress/*
 * Passwords here are only hashed for demo purposes. Never ship this to production. */
(function () {
  const D = window.CG_DATA;
  const COURSES = window.CG_COURSES;
  const KEY_USERS = 'cg_users', KEY_SESSION = 'cg_session', KEY_STATE = 'cg_state:';
  const handlers = {};
  const CG = { data: D, courses: COURSES, state: null, email: null };
  CG.on = (e, fn) => { (handlers[e] = handlers[e] || []).push(fn); };
  CG.emit = (e, d) => (handlers[e] || []).forEach((fn) => { try { fn(d); } catch (err) { console.error(err); } });

  /* ---------- time helpers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dstr(new Date());
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dstr(d); };
  CG.today = today; CG.daysAgo = daysAgo;
  CG.ago = (ts) => {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 86400 * 30) return Math.floor(s / 86400) + 'd ago';
    return new Date(ts).toLocaleDateString();
  };
  CG.fmt = (n) => Number(n).toLocaleString('en-US');

  /* ---------- level system ---------- */
  // L1 0, L2 500, L3 1200, L4 2000, L5 3000, then each level costs 250 more than the last (L6 4250, L7 5750 ...)
  const T = [0, 0, 500, 1200, 2000, 3000];
  for (let l = 6; l <= 80; l++) T[l] = T[l - 1] + 1000 + (l - 5) * 250;
  CG.levelFor = (xp) => { let l = 1; while (l < 80 && xp >= T[l + 1]) l++; return l; };
  CG.levelInfo = (xp) => {
    const level = CG.levelFor(xp), cur = T[level], next = T[level + 1];
    return { level, cur, next, into: xp - cur, need: next - cur, pct: Math.min(100, ((xp - cur) / (next - cur)) * 100), reward: 50 * (level + 1) };
  };
  CG.levelStart = (l) => T[l];
  CG.rankFor = (level) => { let r = D.ranks[0][1]; D.ranks.forEach(([l, n]) => { if (level >= l) r = n; }); return r; };

  /* ---------- lookups ---------- */
  CG.course = (id) => COURSES.find((c) => c.id === id);
  CG.lab = (id) => D.labs.find((l) => l.id === id);
  CG.chal = (id) => D.challenges.find((c) => c.id === id);
  CG.allLessons = () => { const out = []; COURSES.forEach((c) => c.modules.forEach((m) => m.lessons.forEach((l) => out.push({ c, m, l })))); return out; };
  CG.lessonOf = (id) => CG.allLessons().find((x) => x.l.id === id);
  CG.courseLessons = (c) => c.modules.flatMap((m) => m.lessons);
  CG.courseProgress = (c) => {
    const ls = CG.courseLessons(c); const s = CG.state;
    const done = ls.filter((l) => s.lessons[l.id]).length;
    return { done, total: ls.length, pct: Math.round((done / ls.length) * 100) };
  };

  /* ---------- persistence ---------- */
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { console.warn('storage unavailable', e); return false; } };
  CG.save = () => { if (CG.email && CG.state) store(KEY_STATE + CG.email, CG.state); };

  const blank = (name, email) => ({
    v: 1,
    profile: { name, email, avatar: { seed: name, hue: 150 }, bio: 'New operator. Learning the grid.', title: 'Initiate', theme: 'green', frame: '', skin: '', fx: '', badge: '', joined: Date.now() },
    xp: 0, cubes: 0, totalEarned: 0,
    lessons: {}, quizzes: {}, quizFirst: 0, courses: {},
    labs: {}, labProg: {}, unlockedLabs: [], chals: {}, attempts: {}, hintsUsed: {},
    ach: {}, flags: {}, days: [], bestStreak: 0, streakClaimed: [],
    notifs: [], tx: [], activity: [], owned: [], daily: { date: '', progress: 0, done: false }, dailyDone: 0,
    xpByDate: {}, lastLesson: null, welcomed: false,
  });

  /* ---------- notifications / activity / tx ---------- */
  const uid = () => Math.random().toString(36).slice(2, 9);
  CG.notify = (text, type) => {
    const s = CG.state; s.notifs.unshift({ id: uid(), text, type: type || 'info', ts: Date.now(), read: false });
    s.notifs = s.notifs.slice(0, 40); CG.emit('notify', s.notifs[0]);
  };
  CG.logActivity = (type, text, icon) => {
    const s = CG.state; s.activity.unshift({ id: uid(), type, text, icon: icon || 'bolt', ts: Date.now() }); s.activity = s.activity.slice(0, 60);
  };
  const addTx = (amt, reason) => { const s = CG.state; s.tx.unshift({ id: uid(), amt, reason, ts: Date.now() }); s.tx = s.tx.slice(0, 80); };

  /* ---------- streak ---------- */
  CG.streakInfo = () => {
    const days = new Set(CG.state.days);
    let cur = 0, i = days.has(today()) ? 0 : 1;
    while (days.has(daysAgo(i))) { cur++; i++; }
    return { current: cur, best: Math.max(CG.state.bestStreak, cur), activeToday: days.has(today()) };
  };
  const markDay = () => {
    const s = CG.state, t = today();
    if (!s.days.includes(t)) s.days.push(t);
    s.days = s.days.slice(-120);
    const info = CG.streakInfo(); s.bestStreak = Math.max(s.bestStreak, info.current);
    D.streakMilestones.forEach((m) => {
      if (info.current >= m.d && !s.streakClaimed.includes(m.d)) {
        s.streakClaimed.push(m.d);
        CG.award({ cubes: m.cubes, reason: m.d + ' day streak bonus', type: 'streak', icon: 'flame', quiet: false });
        CG.notify('Streak milestone: ' + m.d + ' days. +' + m.cubes + ' Cubes.', 'streak');
      }
    });
  };

  /* ---------- core economy ---------- */
  CG.award = ({ xp = 0, cubes = 0, reason = '', type = 'xp', icon = 'bolt', activity = true, quiet = false }) => {
    const s = CG.state;
    const before = CG.levelFor(s.xp);
    s.xp += xp; s.cubes += cubes; s.totalEarned += cubes;
    if (xp) s.xpByDate[today()] = (s.xpByDate[today()] || 0) + xp;
    if (cubes) addTx(cubes, reason);
    if (activity && reason) CG.logActivity(type, reason + (xp ? ' (+' + xp + ' XP)' : '') + (cubes ? ' (+' + cubes + ' Cubes)' : ''), icon);
    if (xp) markDay();
    const after = CG.levelFor(s.xp);
    CG.save();
    if (!quiet) CG.emit('award', { xp, cubes, reason });
    for (let l = before + 1; l <= after; l++) {
      const bonus = 50 * l;
      s.cubes += bonus; s.totalEarned += bonus; addTx(bonus, 'Level ' + l + ' reward');
      CG.notify('You reached Level ' + l + '. +' + bonus + ' Cubes.', 'level');
      CG.logActivity('level', 'Reached Level ' + l + ' (' + CG.rankFor(l) + ')', 'bolt');
      CG.emit('levelup', { level: l, bonus, rank: CG.rankFor(l) });
    }
    if (xp || cubes) CG.notify('You earned ' + (cubes ? cubes + ' Cubes' : '') + (xp && cubes ? ' and ' : '') + (xp ? xp + ' XP' : '') + '.', 'reward');
    CG.save();
    CG.checkAch();
    CG.emit('change');
  };
  CG.spend = (n, reason) => {
    const s = CG.state;
    if (s.cubes < n) return false;
    s.cubes -= n; addTx(-n, reason); CG.logActivity('spend', reason + ' (-' + n + ' Cubes)', 'cube');
    CG.save(); CG.emit('change'); return true;
  };

  /* ---------- daily mission ---------- */
  CG.mission = () => {
    const d = new Date(); const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const m = D.missions[doy % D.missions.length];
    const s = CG.state;
    if (s.daily.date !== today()) s.daily = { date: today(), progress: 0, done: false };
    return Object.assign({}, m, { progress: s.daily.progress, done: s.daily.done });
  };
  CG.bump = (kind) => {
    const m = CG.mission(); const s = CG.state;
    const match = m.kind === kind || (m.kind === 'lab' && kind === 'lab-web');
    if (!match || s.daily.done) return;
    s.daily.progress++;
    if (s.daily.progress >= m.target) {
      s.daily.done = true; s.dailyDone++;
      CG.award({ xp: m.xp, cubes: m.cubes, reason: 'Daily mission: ' + m.text, type: 'mission', icon: 'target' });
      CG.emit('toast', { title: 'MISSION COMPLETE', msg: 'Daily mission cleared. +' + m.xp + ' XP, +' + m.cubes + ' Cubes.', kind: 'good' });
    }
    CG.save();
  };

  /* ---------- achievements ---------- */
  CG.context = () => {
    const s = CG.state;
    const labsDone = Object.keys(s.labs), chalsDone = Object.keys(s.chals);
    const level = CG.levelFor(s.xp);
    return {
      lessons: Object.keys(s.lessons).length, labs: labsDone.length, chals: chalsDone.length,
      webLabs: labsDone.filter((id) => (CG.lab(id) || {}).cat === 'Web').length,
      chalCats: new Set(chalsDone.map((id) => (CG.chal(id) || {}).cat)).size,
      courseDone: Object.keys(s.courses), totalEarned: s.totalEarned, bestStreak: Math.max(s.bestStreak, CG.streakInfo().current),
      level, owned: s.owned.length, quizFirst: s.quizFirst, dailyDone: s.dailyDone, flags: s.flags,
    };
  };
  CG.checkAch = (silent) => {
    const s = CG.state; const ctx = CG.context(); let any = false;
    D.achievements.forEach((a) => {
      if (!s.ach[a.id] && a.test(ctx)) {
        s.ach[a.id] = Date.now(); any = true;
        s.cubes += a.reward; s.totalEarned += a.reward; addTx(a.reward, 'Achievement: ' + a.name);
        if (!silent) {
          CG.notify('Achievement unlocked: ' + a.name + '.', 'achievement');
          CG.logActivity('badge', 'Badge unlocked: ' + a.name + ' (+' + a.reward + ' Cubes)', a.icon);
          CG.emit('achievement', a);
        }
      }
    });
    if (any) { CG.save(); CG.emit('change'); if (!silent) CG.checkAch(); }
  };

  /* ---------- learning actions ---------- */
  CG.completeLesson = (lessonId) => {
    const s = CG.state; const found = CG.lessonOf(lessonId);
    if (!found || s.lessons[lessonId]) return false;
    s.lessons[lessonId] = Date.now(); s.lastLesson = lessonId;
    CG.award({ xp: 40, cubes: 20, reason: 'Completed lesson: ' + found.l.t, type: 'lesson', icon: 'book' });
    CG.bump('lesson');
    const p = CG.courseProgress(found.c);
    if (p.done === p.total && !s.courses[found.c.id]) {
      s.courses[found.c.id] = Date.now();
      CG.award({ xp: found.c.xp, cubes: found.c.cubes, reason: 'Completed course: ' + found.c.title, type: 'course', icon: 'check' });
      CG.emit('toast', { title: 'COURSE COMPLETE', msg: found.c.title + ' cleared. Bonus +' + found.c.xp + ' XP, +' + found.c.cubes + ' Cubes.', kind: 'good' });
      CG.notify('New sector unlocked: related labs are ready for ' + found.c.title + '.', 'unlock');
    }
    CG.save(); return true;
  };
  CG.answerQuiz = (lessonId, idx) => {
    const s = CG.state; const f = CG.lessonOf(lessonId); if (!f) return null;
    const ok = idx === f.l.a; const q = s.quizzes[lessonId] || { ok: false, tries: 0 };
    q.tries++;
    if (ok && !q.ok) {
      q.ok = true;
      if (q.tries === 1) s.quizFirst++;
      s.quizzes[lessonId] = q;
      CG.award({ xp: 15, cubes: 5, reason: 'Knowledge check passed', type: 'quiz', icon: 'lightbulb', activity: false });
      CG.bump('quiz');
    } else s.quizzes[lessonId] = q;
    CG.save(); CG.checkAch(); return ok;
  };

  CG.labUnlocked = (lab) => lab.cost === 0 || CG.state.unlockedLabs.includes(lab.id);
  CG.unlockLab = (id) => {
    const lab = CG.lab(id); const s = CG.state;
    if (CG.labUnlocked(lab)) return true;
    if (!CG.spend(lab.cost, 'Premium Lab Access: ' + lab.name)) return false;
    s.unlockedLabs.push(id); CG.save(); CG.notify('New sector unlocked: ' + lab.name + '.', 'unlock'); return true;
  };
  CG.completeLab = (id) => {
    const s = CG.state; const lab = CG.lab(id); if (!lab || s.labs[id]) return false;
    const prog = s.labProg[id] || { hints: 0 };
    s.labs[id] = { ts: Date.now(), hints: prog.hints };
    if (new Date().getHours() < 5) s.flags.night = true;
    if (prog.hints === 0 && (lab.diff === 'Hard' || lab.diff === 'Insane')) s.flags.ghost = true;
    CG.award({ xp: lab.xp, cubes: lab.cubes, reason: 'Completed lab: ' + lab.name, type: 'lab', icon: 'flask' });
    CG.bump('lab'); if (lab.cat === 'Web') CG.bump('lab-web');
    CG.save(); CG.checkAch(); return true;
  };

  CG.HINT_COST = 20;
  CG.revealHint = (id) => {
    const s = CG.state; const c = CG.chal(id); const n = s.hintsUsed[id] || 0;
    if (n >= c.hints.length) return { ok: false, reason: 'none' };
    if (!s.chals[id] && !CG.spend(CG.HINT_COST, 'Hint: ' + c.title)) return { ok: false, reason: 'cubes' };
    s.hintsUsed[id] = n + 1; CG.save(); return { ok: true, text: c.hints[n] };
  };
  CG.submitFlag = (id, input) => {
    const s = CG.state; const c = CG.chal(id);
    if (s.chals[id]) return { status: 'already' };
    s.attempts[id] = (s.attempts[id] || 0) + 1;
    if (String(input).trim() === c.flag) {
      s.chals[id] = { ts: Date.now(), attempts: s.attempts[id] };
      if (c.diff === 'Hard' || c.diff === 'Insane') s.flags.hardChal = true;
      CG.award({ xp: c.pts, cubes: c.cubes, reason: 'Solved challenge: ' + c.title, type: 'challenge', icon: 'flag' });
      CG.bump('challenge'); CG.save(); CG.checkAch();
      return { status: 'correct', c };
    }
    CG.save(); return { status: 'wrong', attempts: s.attempts[id] };
  };

  /* ---------- shop ---------- */
  CG.buy = (id) => {
    const it = D.shop.find((i) => i.id === id); const s = CG.state;
    if (!it || s.owned.includes(id)) return { ok: false, reason: 'owned' };
    if (!CG.spend(it.price, 'Shop: ' + it.name)) return { ok: false, reason: 'cubes' };
    s.owned.push(id); CG.notify('Purchased ' + it.name + '. Equip it from the Shop or your profile.', 'shop'); CG.save(); CG.checkAch(); return { ok: true, it };
  };
  const slot = { theme: 'theme', frame: 'frame', skin: 'skin', effect: 'fx', badge: 'badge', title: 'title' };
  CG.equip = (id) => {
    const it = D.shop.find((i) => i.id === id); const p = CG.state.profile;
    if (!it || !CG.state.owned.includes(id)) return false;
    p[slot[it.type]] = it.val; CG.save(); CG.applyCosmetics(); CG.emit('change'); return true;
  };
  CG.unequip = (type) => { const p = CG.state.profile; p[slot[type]] = type === 'theme' ? 'green' : type === 'title' ? 'Initiate' : ''; CG.save(); CG.applyCosmetics(); CG.emit('change'); };
  CG.isEquipped = (it) => CG.state.profile[slot[it.type]] === it.val;
  CG.applyCosmetics = () => {
    const p = CG.state && CG.state.profile; const root = document.documentElement;
    root.dataset.accent = (p && p.theme) || 'green';
    root.dataset.skin = (p && p.skin) || ''; root.dataset.fx = (p && p.fx) || '';
  };

  /* ---------- demo seed ---------- */
  const seedDemo = () => {
    const s = blank('n0va', 'operator@ciphergrid.dev');
    s.profile.bio = 'Blue-team curious, red-team stubborn. Chasing the weekly board.';
    s.profile.title = 'Packet Hunter'; s.profile.avatar = { seed: 'n0va', hue: 150 };
    s.xp = 3420; s.cubes = 12480; s.totalEarned = 15820;
    ['net', 'linux', 'cli'].forEach((id, ci) => {
      const ls = CG.courseLessons(CG.course(id));
      ls.slice(0, ci === 0 ? 4 : ci === 1 ? 3 : 1).forEach((l, i) => { s.lessons[l.id] = Date.now() - (9 - ci * 2 - i) * 864e5; });
    });
    s.courses.net = Date.now() - 5 * 864e5; s.lastLesson = 'linux-m1-l2';
    ['lantern-drift', 'packet-forge', 'neon-vault'].forEach((id, i) => { s.labs[id] = { ts: Date.now() - (i + 2) * 864e5, hints: i === 0 ? 0 : 1 }; });
    ['C1', 'C2', 'W1', 'W2', 'P1'].forEach((id, i) => { s.chals[id] = { ts: Date.now() - (i + 1) * 864e5, attempts: 1 + (i % 3) }; s.attempts[id] = 1 + (i % 3); });
    s.quizFirst = 6; s.dailyDone = 2;
    [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 18, 19, 20, 21, 22].forEach((n) => s.days.push(daysAgo(n)));
    s.bestStreak = 7; s.streakClaimed = [3, 7];
    const vals = [320, 180, 0, 240, 410, 150, 260, 300, 90, 0, 210, 330, 120, 280];
    vals.forEach((v, i) => { if (v) s.xpByDate[daysAgo(i)] = v; });
    s.owned = ['fr-hex', 'ti-packetpoet']; s.profile.frame = 'hex';
    s.tx = [
      { id: uid(), amt: 100, reason: 'Completed Linux Fundamentals lesson', ts: Date.now() - 36e5 * 3 },
      { id: uid(), amt: 250, reason: 'Solved Web Challenge', ts: Date.now() - 36e5 * 20 },
      { id: uid(), amt: 50, reason: 'Daily Mission', ts: Date.now() - 36e5 * 30 },
      { id: uid(), amt: -500, reason: 'Premium Lab Access', ts: Date.now() - 36e5 * 52 },
      { id: uid(), amt: 150, reason: '7 day streak bonus', ts: Date.now() - 36e5 * 70 },
    ];
    s.activity = [
      { id: uid(), type: 'lesson', icon: 'book', text: 'Completed lesson: Processes and Signals (+40 XP) (+20 Cubes)', ts: Date.now() - 36e5 * 3 },
      { id: uid(), type: 'challenge', icon: 'flag', text: 'Solved challenge: Cookie Jar (+100 XP) (+50 Cubes)', ts: Date.now() - 36e5 * 20 },
      { id: uid(), type: 'badge', icon: 'flame', text: 'Badge unlocked: Week of Fire (+150 Cubes)', ts: Date.now() - 36e5 * 28 },
      { id: uid(), type: 'lab', icon: 'flask', text: 'Completed lab: Neon Vault (+250 XP) (+100 Cubes)', ts: Date.now() - 36e5 * 52 },
      { id: uid(), type: 'level', icon: 'bolt', text: 'Reached Level 5 (Operator)', ts: Date.now() - 36e5 * 75 },
    ];
    s.notifs = [
      { id: uid(), type: 'unlock', text: 'New lab unlocked: Silent Proxy is ready.', ts: Date.now() - 36e5, read: false },
      { id: uid(), type: 'reward', text: 'You earned 250 Cubes.', ts: Date.now() - 36e5 * 5, read: false },
      { id: uid(), type: 'board', text: 'Weekly leaderboard updated. You moved up 2 places.', ts: Date.now() - 36e5 * 12, read: false },
      { id: uid(), type: 'achievement', text: 'Achievement unlocked: Week of Fire.', ts: Date.now() - 36e5 * 28, read: true },
      { id: uid(), type: 'level', text: 'You reached Level 5.', ts: Date.now() - 36e5 * 75, read: true },
    ];
    s.welcomed = true;
    return s;
  };

  /* ---------- auth ---------- */
  const hash = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); };
  const users = () => load(KEY_USERS, {});
  const attach = (email) => {
    CG.email = email;
    CG.state = load(KEY_STATE + email, null);
    if (!CG.state) { CG.state = blank(email.split('@')[0], email); }
    CG.checkAch(true); CG.mission(); CG.applyCosmetics(); CG.save();
  };
  CG.auth = {
    session: () => load(KEY_SESSION, null),
    register({ name, email, pass }) {
      const u = users(); email = email.trim().toLowerCase();
      if (u[email]) return { ok: false, error: 'That email is already registered. Try signing in.' };
      if (Object.values(u).some((x) => x.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: 'That username is taken.' };
      u[email] = { name, email, pass: hash(pass), created: Date.now(), verified: false };
      store(KEY_USERS, u);
      const s = blank(name, email);
      s.cubes = 500; s.totalEarned = 500;
      s.tx.push({ id: uid(), amt: 500, reason: 'Welcome bonus', ts: Date.now() });
      s.notifs.push({ id: uid(), type: 'info', text: 'Welcome to CIPHERGRID. Start with a Foundations course.', ts: Date.now(), read: false });
      store(KEY_STATE + email, s);
      return { ok: true };
    },
    verify(email) { const u = users(); if (u[email]) { u[email].verified = true; store(KEY_USERS, u); } },
    login({ email, pass }) {
      const u = users(); email = email.trim().toLowerCase();
      if (!u[email] || u[email].pass !== hash(pass)) return { ok: false, error: 'ACCESS DENIED. Email or password is incorrect.' };
      store(KEY_SESSION, email); attach(email); return { ok: true };
    },
    demo() {
      const email = 'operator@ciphergrid.dev';
      const u = users();
      if (!u[email]) { u[email] = { name: 'n0va', email, pass: hash('demo'), created: Date.now(), verified: true }; store(KEY_USERS, u); }
      if (!load(KEY_STATE + email, null)) { CG.email = email; store(KEY_STATE + email, seedDemo()); }
      store(KEY_SESSION, email); attach(email);
      if (!CG.state.demoFixed) { CG.state.cubes = 12480; CG.state.totalEarned = 15820; CG.state.demoFixed = true; CG.save(); }
      return { ok: true };
    },
    exists: (email) => !!users()[email.trim().toLowerCase()],
    reset(email, pass) { const u = users(); email = email.trim().toLowerCase(); if (!u[email]) return false; u[email].pass = hash(pass); store(KEY_USERS, u); return true; },
    nameOf: (email) => (users()[email.trim().toLowerCase()] || {}).name,
    logout() { localStorage.removeItem(KEY_SESSION); CG.state = null; CG.email = null; },
    resetDemo() { if (CG.email) { localStorage.removeItem(KEY_STATE + CG.email); } },
  };

  /* ---------- leaderboard ---------- */
  CG.sumXp = (days) => { const s = CG.state; let t = 0; for (let i = 0; i < days; i++) t += s.xpByDate[daysAgo(i)] || 0; return t; };
  CG.board = (tab) => {
    const s = CG.state; const key = { global: 'xp', weekly: 'wxp', monthly: 'mxp', friends: 'xp' }[tab];
    const me = { name: s.profile.name, xp: s.xp, wxp: CG.sumXp(7), mxp: CG.sumXp(30), cubes: s.cubes, labs: Object.keys(s.labs).length, chals: Object.keys(s.chals).length, delta: 0, me: true, friend: true, streak: CG.streakInfo().current };
    let rows = D.users.map((u) => Object.assign({}, u)).concat([me]);
    if (tab === 'friends') rows = rows.filter((r) => r.friend);
    rows.sort((a, b) => b[key] - a[key]);
    rows.forEach((r, i) => { r.rank = i + 1; r.score = r[key]; r.level = CG.levelFor(r.xp); });
    return rows;
  };

  /* ---------- skills (radar) ---------- */
  const SKILLS = {
    Networking: { courses: ['net', 'recon'], labCats: ['Network'], chalCats: ['Networking'] },
    Linux: { courses: ['linux', 'cli'], labCats: ['Linux'], chalCats: ['Linux'] },
    'Web Security': { courses: ['http', 'auth', 'sqli', 'xss', 'acl'], labCats: ['Web'], chalCats: ['Web'] },
    Python: { courses: ['py', 'git'], labCats: [], chalCats: ['Programming'] },
    Cryptography: { courses: ['crypto'], labCats: ['Crypto'], chalCats: ['Crypto'] },
    OSINT: { courses: ['win'], labCats: ['OSINT'], chalCats: ['OSINT'] },
    'Privilege Escalation': { courses: ['privesc', 'vuln'], labCats: ['Linux', 'Active Directory'], chalCats: ['Reverse'] },
  };
  CG.skills = (state) => {
    const s = state || CG.state;
    return Object.keys(SKILLS).map((name) => {
      const k = SKILLS[name];
      let ls = 0, tot = 0;
      k.courses.forEach((id) => { const c = CG.course(id); const all = CG.courseLessons(c); tot += all.length; ls += all.filter((l) => s.lessons[l.id]).length; });
      const labs = Object.keys(s.labs).filter((id) => k.labCats.includes((CG.lab(id) || {}).cat)).length;
      const chs = Object.keys(s.chals).filter((id) => k.chalCats.includes((CG.chal(id) || {}).cat)).length;
      return { name, value: Math.min(100, Math.round((ls / tot) * 55 + labs * 14 + chs * 8)) };
    });
  };
  CG.nextLesson = (c) => { const ls = CG.courseLessons(c); return ls.find((l) => !CG.state.lessons[l.id]) || null; };
  CG.continueCourse = () => {
    const s = CG.state; const last = s.lastLesson && CG.lessonOf(s.lastLesson);
    if (last && CG.nextLesson(last.c)) return last.c;
    const part = COURSES.find((c) => { const p = CG.courseProgress(c); return p.done > 0 && p.done < p.total; });
    return part || COURSES.find((c) => !s.courses[c.id]) || COURSES[0];
  };

  /* ---------- guard ---------- */
  CG.requireAuth = () => {
    const email = CG.auth.session();
    if (!email || !users()[email]) { location.replace('auth.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return false; }
    if (!CG.state) attach(email);
    return true;
  };
  window.CG = CG;
})();
