(function () {
  const view = UI.shell('dashboard'); if (!view) return;
  const S = () => CG.state;

  function radar(skills) {
    const cx = 130, cy = 130, R = 92, n = skills.length;
    const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
    const rings = [0.25, 0.5, 0.75, 1].map((f) => '<polygon points="' + skills.map((_, i) => pt(i, R * f).join(',')).join(' ') + '" fill="none" stroke="var(--line2)" stroke-width="1"/>').join('');
    const axes = skills.map((_, i) => '<line x1="' + cx + '" y1="' + cy + '" x2="' + pt(i, R)[0] + '" y2="' + pt(i, R)[1] + '" stroke="var(--line)"/>').join('');
    const poly = skills.map((s, i) => pt(i, Math.max(4, (R * s.value) / 100)).join(',')).join(' ');
    const dots = skills.map((s, i) => { const p = pt(i, Math.max(4, (R * s.value) / 100)); return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="var(--acc)"/>'; }).join('');
    const labels = skills.map((s, i) => { const p = pt(i, R + 20); const a = p[0] < cx - 6 ? 'end' : p[0] > cx + 6 ? 'start' : 'middle'; return '<text x="' + p[0] + '" y="' + (p[1] + 3) + '" text-anchor="' + a + '" fill="var(--mute)" font-size="9.5" font-family="var(--f-mono)">' + s.name + '</text>'; }).join('');
    return '<svg viewBox="-20 0 300 262" class="radar" role="img" aria-label="Skill radar">' + rings + axes + '<polygon class="rad-poly" points="' + poly + '" fill="rgba(var(--acc-rgb),.18)" stroke="var(--acc)" stroke-width="2"/>' + dots + labels + '</svg>';
  }
  function weekly() {
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ k: CG.daysAgo(i), l: d.toLocaleDateString('en', { weekday: 'short' }), v: S().xpByDate[CG.daysAgo(i)] || 0 }); }
    const max = Math.max(100, ...days.map((d) => d.v)); const total = days.reduce((a, d) => a + d.v, 0);
    return { total, html: '<div class="wk">' + days.map((d, i) => '<div class="wk-c' + (i === 6 ? ' today' : '') + '"><span class="mono">' + (d.v || '') + '</span><i style="height:' + Math.max(3, (d.v / max) * 100) + '%"></i><small>' + d.l + '</small></div>').join('') + '</div>' };
  }
  function calendar() {
    const set = new Set(S().days); let cells = '';
    const start = new Date(); start.setDate(start.getDate() - 27); const pad = (start.getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) cells += '<i class="cal-c void"></i>';
    for (let i = 27; i >= 0; i--) { const k = CG.daysAgo(i); const d = new Date(); d.setDate(d.getDate() - i); cells += '<i class="cal-c ' + (set.has(k) ? 'on' : i === 0 ? 'now' : 'miss') + '" title="' + k + (set.has(k) ? ': active' : ': missed') + '"><span>' + d.getDate() + '</span></i>'; }
    return '<div class="cal"><div class="cal-h mono">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => '<span>' + d + '</span>').join('') + '</div><div class="cal-g">' + cells + '</div></div>';
  }

  function render(v) {
    const s = S(), li = CG.levelInfo(s.xp), st = CG.streakInfo(), cc = CG.continueCourse(), cp = CG.courseProgress(cc), nl = CG.nextLesson(cc);
    const mis = CG.mission(), wk = weekly(), skills = CG.skills();
    const myRank = CG.board('global').find((r) => r.me).rank;
    const inProg = CG.courses.map((c) => ({ c, p: CG.courseProgress(c) })).filter((x) => x.p.done > 0).sort((a, b) => b.p.pct - a.p.pct).slice(0, 5);
    const nextLab = CG.data.labs.find((l) => !s.labs[l.id] && CG.labUnlocked(l));
    const nextChal = CG.data.challenges.find((c) => !s.chals[c.id]);
    const weak = skills.slice().sort((a, b) => a.value - b.value)[0];

    v.innerHTML =
      '<section class="card glow welcome"><div class="wl-main">' + UI.avatar(s.profile, 72) + '<div><span class="label">SYSTEM STATUS: ONLINE</span><h1>Welcome back, Operator.</h1><p><b class="text">' + UI.esc(s.profile.name) + '</b> / ' + UI.esc(s.profile.title) + ' / Rank <b class="acc">' + CG.rankFor(li.level) + '</b></p></div></div>' +
      '<div class="wl-xp"><div class="row between"><span class="mono">LEVEL <b class="acc" style="font-size:1.4rem">' + li.level + '</b></span><span class="mono mute small">' + CG.fmt(s.xp) + ' / ' + CG.fmt(li.next) + ' XP</span></div>' + UI.progress(li.pct, 'lg') +
      '<p class="small">' + CG.fmt(li.next - s.xp) + ' XP to Level ' + (li.level + 1) + '. Next level reward: <b class="cy">+' + li.reward + ' Cubes</b></p></div></section>' +

      '<section class="grid g4 tiles">' +
      tile('cube', 'CUBES', CG.fmt(s.cubes), 'Open wallet', 'wallet') + tile('flame', 'STREAK', st.current + ' days', 'Best: ' + st.best) + tile('flask', 'LABS DONE', Object.keys(s.labs).length + '/' + CG.data.labs.length, 'Global rank #' + myRank) + tile('flag', 'CHALLENGES', Object.keys(s.chals).length + '/' + CG.data.challenges.length, CG.fmt(Object.keys(s.chals).reduce((a, k) => a + CG.chal(k).pts, 0)) + ' pts') + '</section>' +

      '<div class="dash-cols"><div class="dash-main">' +
      '<section class="card"><div class="card-t"><h2>Continue learning</h2><a class="link" href="courses.html">All courses</a></div>' +
      (nl ? '<div class="cont"><div class="cont-ic">' + UI.icon(cc.icon, 28) + '</div><div class="cont-b"><h3>' + cc.title + '</h3><p class="small">Up next: ' + UI.esc(nl.t) + '</p>' + UI.progress(cp.pct) + '<span class="mono small mute">' + cp.pct + '% / ' + cp.done + ' of ' + cp.total + ' lessons</span></div><a class="btn btn-primary" href="course.html?id=' + cc.id + '&l=' + nl.id + '">' + (cp.done ? 'CONTINUE' : 'INITIALIZE TRAINING') + '</a></div>' : UI.empty({ icon: 'check', title: 'Every course cleared', text: 'Take your skills to the labs.', cta: 'ENTER LABS', href: 'labs.html' })) + '</section>' +

      '<div class="grid g2"><section class="card"><div class="card-t"><h2>Weekly XP</h2><span class="mono acc">+' + CG.fmt(wk.total) + '</span></div>' + wk.html + '</section>' +
      '<section class="card"><div class="card-t"><h2>Course completion</h2></div>' + (inProg.length ? '<div class="stack">' + inProg.map((x) => '<a class="cp-row" href="course.html?id=' + x.c.id + '"><span>' + x.c.title + '</span><span class="mono small mute">' + x.p.pct + '%</span>' + UI.progress(x.p.pct) + '</a>').join('') + '</div>' : UI.empty({ icon: 'book', title: 'No courses started', text: 'Pick a Foundations course to begin.', cta: 'BROWSE COURSES', href: 'courses.html' })) + '</section></div>' +

      '<section class="card"><div class="card-t"><h2>Recent activity</h2><span class="dot live"></span></div>' + (s.activity.length ? '<ul class="feed">' + s.activity.slice(0, 7).map((a) => '<li class="act-' + a.type + '">' + UI.icon(a.icon, 16) + '<span>' + UI.esc(a.text) + '</span><small>' + CG.ago(a.ts) + '</small></li>').join('') + '</ul>' : UI.empty({ icon: 'terminal', title: 'No activity yet', text: 'Complete a lesson, lab or challenge and it appears here.', cta: 'START LEARNING', href: 'courses.html' })) + '</section>' +
      '</div>' +

      '<aside class="dash-side">' +
      '<section class="card glow"><div class="card-t"><h2>Daily mission</h2><span class="chip">' + (mis.done ? 'CLEARED' : 'ACTIVE') + '</span></div><h3 class="mis-t">' + mis.text + '</h3>' + UI.progress((Math.min(mis.progress, mis.target) / mis.target) * 100, mis.done ? '' : 'am') +
      '<div class="row between wrap" style="margin:10px 0 14px"><span class="mono small mute">' + Math.min(mis.progress, mis.target) + '/' + mis.target + '</span><span class="row gap-s">' + UI.xpTag(mis.xp) + UI.cubeTag(mis.cubes) + '</span></div>' +
      (mis.done ? '<p class="small acc">MISSION COMPLETE. A new mission arrives tomorrow.</p>' : '<a class="btn btn-primary btn-block" href="' + mis.href + '">START MISSION</a>') + '</section>' +

      '<section class="card"><div class="card-t"><h2>Streak</h2><span class="mono am">' + UI.icon('flame', 16) + ' ' + st.current + ' DAY STREAK</span></div>' + calendar() +
      '<div class="ms">' + CG.data.streakMilestones.map((m) => '<span class="chip ' + (s.streakClaimed.includes(m.d) ? 'got' : '') + '">' + m.d + 'd +' + m.cubes + '</span>').join('') + '</div></section>' +

      '<section class="card"><div class="card-t"><h2>Skill radar</h2></div>' + radar(skills) + '<p class="small">Weakest: <b class="text">' + weak.name + '</b>. A lab or challenge in this area raises your radar fastest.</p></section>' +

      '<section class="card"><div class="card-t"><h2>Recommended next</h2></div><div class="stack">' +
      (nextLab ? '<a class="rec" href="lab.html?id=' + nextLab.id + '">' + UI.icon('flask', 18) + '<span><b>' + nextLab.name + '</b><small>' + nextLab.cat + ' lab / +' + nextLab.xp + ' XP</small></span>' + UI.icon('chev', 16) + '</a>' : '') +
      (nextChal ? '<a class="rec" href="challenges.html?c=' + nextChal.id + '">' + UI.icon('flag', 18) + '<span><b>' + nextChal.title + '</b><small>' + nextChal.cat + ' / ' + nextChal.pts + ' pts</small></span>' + UI.icon('chev', 16) + '</a>' : '') +
      '<a class="rec" href="leaderboard.html">' + UI.icon('trophy', 18) + '<span><b>Climb the board</b><small>You are #' + myRank + ' globally</small></span>' + UI.icon('chev', 16) + '</a></div></section>' +
      '</aside></div>';

    const w = UI.$('[data-wallet]', v); if (w) w.onclick = () => UI.wallet();
  }
  function tile(ic, label, val, sub, act) {
    return '<div class="card tile ' + (act ? 'card-hover' : '') + '"' + (act ? ' data-wallet role="button" tabindex="0"' : '') + '><span class="tile-ic">' + UI.icon(ic, 20) + '</span><span class="label">' + label + '</span><b class="stat">' + val + '</b><small>' + sub + '</small></div>';
  }
  UI.page(view, render, 4);
  CG.on('change', () => { /* keep dashboard in sync after background awards */ });
})();
