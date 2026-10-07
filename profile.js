(function () {
  const view = UI.shell('profile'); if (!view) return;
  const who = UI.param('u');
  const hashN = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

  /* Build a read-only "state-like" object for another (fictional) user */
  function fakeState(u) {
    const h = hashN(u.name); const s = { lessons: {}, labs: {}, chals: {}, ach: {}, courses: {}, profile: { name: u.name, title: 'Operator', avatar: { seed: u.name, hue: h % 360 }, bio: 'Fictional demo user on the CIPHERGRID leaderboard.', frame: '' }, xp: u.xp, cubes: u.cubes, owned: [], days: [], activity: [], attempts: {} };
    CG.data.labs.slice(0, u.labs).forEach((l, i) => (s.labs[l.id] = { ts: Date.now() - (i + 1) * 864e5 * 3 }));
    CG.data.challenges.slice(0, u.chals).forEach((c, i) => (s.chals[c.id] = { ts: Date.now() - (i + 1) * 864e5 * 2, attempts: 1 }));
    const lv = CG.levelFor(u.xp); CG.data.achievements.slice(0, Math.min(CG.data.achievements.length, Math.round(lv * 1.3))).forEach((a, i) => (s.ach[a.id] = Date.now() - (i + 2) * 864e5 * 5));
    CG.courses.slice(0, Math.min(CG.courses.length, Math.round(lv / 2))).forEach((c, i) => { s.courses[c.id] = Date.now() - i * 864e5 * 9; CG.courseLessons(c).forEach((l) => (s.lessons[l.id] = 1)); });
    return s;
  }
  const other = who && who !== CG.state.profile.name ? CG.data.users.find((u) => u.name === who) : null;
  if (who && !other && who !== CG.state.profile.name) { view.innerHTML = UI.empty({ icon: 'user', title: 'USER NOT FOUND', text: 'No operator with that name exists on the grid.', cta: 'VIEW LEADERBOARD', href: 'leaderboard.html' }); return; }
  const s = other ? fakeState(other) : CG.state; const mine = !other;

  function stats() {
    const byCat = {}; CG.data.challenges.forEach((c) => { byCat[c.cat] = byCat[c.cat] || { t: 0, d: 0 }; byCat[c.cat].t++; if (s.chals[c.id]) byCat[c.cat].d++; });
    return Object.keys(byCat).map((k) => '<div class="cs-row"><span>' + k + '</span><span class="mono small mute">' + byCat[k].d + '/' + byCat[k].t + '</span>' + UI.progress((byCat[k].d / byCat[k].t) * 100) + '</div>').join('');
  }
  function badges() {
    return CG.data.achievements.map((a) => {
      const ts = s.ach[a.id];
      return '<div class="badge tier-' + a.tier + (ts ? ' on' : '') + '" title="' + UI.esc(a.desc) + '"><span class="b-ic">' + UI.icon(ts ? a.icon : 'lock', 24) + '</span><b>' + UI.esc(a.name) + '</b><small>' + UI.esc(a.desc) + '</small><em class="mono">' + (ts ? 'Unlocked ' + new Date(ts).toLocaleDateString() : 'Locked / +' + a.reward + ' Cubes') + '</em></div>';
    }).join('');
  }
  function render(v) {
    const li = CG.levelInfo(s.xp); const p = s.profile; const labsDone = Object.keys(s.labs), courseDone = Object.keys(s.courses), nAch = Object.keys(s.ach).length;
    const skills = CG.skills(s); const rank = other ? CG.board('global').find((r) => r.name === other.name).rank : CG.board('global').find((r) => r.me).rank;
    const ownedBadge = mine && p.badge ? CG.data.shop.find((i) => i.val === p.badge && i.type === 'badge') : null;
    v.innerHTML = '<section class="card glow prof-head">' + UI.avatar(p, 96) + '<div class="ph-main"><span class="label">' + (mine ? 'YOUR PROFILE' : 'OPERATOR PROFILE') + '</span><h1>' + UI.esc(p.name) + '</h1><p class="mono acc">' + UI.esc(p.title || 'Initiate') + ' / ' + CG.rankFor(li.level) + (ownedBadge ? ' / ' + ownedBadge.name : '') + '</p><p class="bio">' + UI.esc(p.bio || '') + '</p>' +
      '<div class="row gap-s wrap"><span class="chip">LEVEL ' + li.level + '</span><span class="chip">' + CG.fmt(s.xp) + ' XP</span><span class="chip cy">' + UI.icon('cube', 13) + CG.fmt(s.cubes) + '</span><span class="chip">Global #' + rank + '</span></div>' + UI.progress(li.pct) + '</div>' +
      (mine ? '<div class="ph-act"><button class="btn btn-primary" id="edit">' + UI.icon('edit', 15) + ' EDIT PROFILE</button><a class="btn btn-ghost" href="shop.html">' + UI.icon('bag', 15) + ' SHOP</a></div>' : '<div class="ph-act"><a class="btn btn-ghost" href="leaderboard.html">BACK TO BOARD</a></div>') + '</section>' +
      '<div class="grid g4 tiles"><div class="card tile"><span class="label">COMPLETED LABS</span><b class="stat">' + labsDone.length + '</b></div><div class="card tile"><span class="label">CHALLENGES</span><b class="stat">' + Object.keys(s.chals).length + '</b></div><div class="card tile"><span class="label">COURSES</span><b class="stat">' + courseDone.length + '</b></div><div class="card tile"><span class="label">BADGES</span><b class="stat">' + nAch + '/' + CG.data.achievements.length + '</b></div></div>' +
      '<div class="grid g2"><section class="card"><div class="card-t"><h2>Skills</h2></div><div class="stack">' + skills.map((k) => '<div class="cs-row"><span>' + k.name + '</span><span class="mono small mute">' + k.value + '</span>' + UI.progress(k.value) + '</div>').join('') + '</div></section>' +
      '<section class="card"><div class="card-t"><h2>Challenge statistics</h2></div><div class="stack">' + stats() + '</div></section></div>' +
      '<section class="card"><div class="card-t"><h2>Achievements</h2><span class="mono small mute">' + nAch + ' unlocked</span></div><div class="badges">' + badges() + '</div></section>' +
      '<div class="grid g2"><section class="card"><div class="card-t"><h2>Completed labs</h2></div>' + (labsDone.length ? '<ul class="plain">' + labsDone.map((id) => { const l = CG.lab(id); return '<li>' + UI.icon('flask', 15) + '<span>' + l.name + '</span>' + UI.diff(l.diff) + '</li>'; }).join('') + '</ul>' : UI.empty({ icon: 'flask', title: 'No labs completed', text: 'Finish a lab to list it here.', cta: 'START A LAB', href: 'labs.html' })) + '</section>' +
      '<section class="card"><div class="card-t"><h2>Completed courses</h2></div>' + (courseDone.length ? '<ul class="plain">' + courseDone.map((id) => '<li>' + UI.icon('book', 15) + '<span>' + CG.course(id).title + '</span><span class="chip got">DONE</span></li>').join('') + '</ul>' : UI.empty({ icon: 'book', title: 'No courses completed', text: 'Complete every lesson in a course to finish it.', cta: 'BROWSE COURSES', href: 'courses.html' })) + '</section></div>' +
      (mine ? '<section class="card"><div class="card-t"><h2>Activity history</h2></div>' + (s.activity.length ? '<ul class="feed">' + s.activity.slice(0, 15).map((a) => '<li class="act-' + a.type + '">' + UI.icon(a.icon, 16) + '<span>' + UI.esc(a.text) + '</span><small>' + CG.ago(a.ts) + '</small></li>').join('') + '</ul>' : UI.empty({ icon: 'terminal', title: 'No activity yet', text: 'Your actions will appear here.' })) + '</section>' : '');
    if (mine) UI.$('#edit').onclick = editor;
  }

  function editor() {
    const p = CG.state.profile; let seed = p.avatar.seed, hue = p.avatar.hue;
    const seeds = [CG.state.profile.name, 'vector', 'halo', 'ember', 'prism', 'static', 'orbit', 'nova9', 'cipher', 'ghost', 'kite', 'flux'];
    const themes = [['green', 'Electric Green']].concat(CG.data.shop.filter((i) => i.type === 'theme' && CG.state.owned.includes(i.id)).map((i) => [i.val, i.name]));
    const titles = CG.data.titles.concat(CG.data.shop.filter((i) => i.type === 'title' && CG.state.owned.includes(i.id)).map((i) => i.val));
    const m = UI.modal({ title: 'Edit profile', cls: 'wide', html: '<form id="pf" novalidate><div class="field"><label>AVATAR</label><div class="seeds" id="seeds"></div><label for="hue" style="margin-top:8px">COLOR</label><input type="range" id="hue" min="0" max="359" value="' + hue + '" aria-label="Avatar hue"></div>' +
      '<div class="grid g2"><div class="field"><label for="pt">DISPLAY TITLE</label><select class="input" id="pt">' + titles.map((t) => '<option' + (t === p.title ? ' selected' : '') + '>' + UI.esc(t) + '</option>').join('') + '</select></div><div class="field"><label for="pth">PROFILE THEME</label><select class="input" id="pth">' + themes.map((t) => '<option value="' + t[0] + '"' + (t[0] === p.theme ? ' selected' : '') + '>' + t[1] + '</option>').join('') + '</select></div></div>' +
      '<div class="field"><label for="pb">BIO</label><textarea class="input" id="pb" maxlength="160">' + UI.esc(p.bio) + '</textarea><span class="mono small dim" id="bc"></span></div><div class="row end gap"><button class="btn btn-ghost" type="button" data-close>CANCEL</button><button class="btn btn-primary" type="submit">SAVE CHANGES</button></div></form>' });
    const paintSeeds = () => { UI.$('#seeds', m.el).innerHTML = seeds.map((sd) => '<button type="button" class="seed' + (sd === seed ? ' on' : '') + '" data-s="' + UI.esc(sd) + '" aria-label="Avatar ' + UI.esc(sd) + '">' + UI.avatarSvg(sd, hue, 52) + '</button>').join(''); UI.$$('.seed', m.el).forEach((b) => (b.onclick = () => { seed = b.dataset.s; paintSeeds(); })); };
    paintSeeds(); const bio = UI.$('#pb', m.el), bc = UI.$('#bc', m.el); const cnt = () => (bc.textContent = bio.value.length + '/160'); bio.oninput = cnt; cnt();
    UI.$('#hue', m.el).oninput = (e) => { hue = Number(e.target.value); paintSeeds(); };
    UI.$('#pf', m.el).onsubmit = (e) => {
      e.preventDefault(); p.avatar = { seed, hue }; p.title = UI.$('#pt', m.el).value; p.theme = UI.$('#pth', m.el).value; p.bio = bio.value.trim() || 'No bio yet.';
      CG.save(); CG.applyCosmetics(); CG.emit('change'); m.close(); UI.toast({ title: 'PROFILE UPDATED', msg: 'Your changes are live.', kind: 'good' }); UI.page(view, render, 3);
    };
  }
  UI.page(view, render, 4);
})();
