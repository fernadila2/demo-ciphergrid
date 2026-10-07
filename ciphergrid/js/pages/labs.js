(function () {
  const view = UI.shell('labs'); if (!view) return;
  const f = { diff: 'All', cat: UI.param('cat') || 'All', status: 'All', reward: 'All', sort: 'popular', q: '' };
  const cats = ['All'].concat(Array.from(new Set(CG.data.labs.map((l) => l.cat))));

  const status = (l) => CG.state.labs[l.id] ? 'Completed' : !CG.labUnlocked(l) ? 'Locked' : (CG.state.labProg[l.id] && CG.state.labProg[l.id].obj && CG.state.labProg[l.id].obj.some(Boolean)) ? 'In progress' : 'Available';
  function card(l) {
    const st = status(l);
    const cta = st === 'Locked' ? '<button class="btn btn-ghost btn-block" data-unlock="' + l.id + '">' + UI.icon('lock', 15) + ' UNLOCK / ' + CG.fmt(l.cost) + ' CUBES</button>' : '<a class="btn ' + (st === 'Completed' ? 'btn-ghost' : 'btn-primary') + ' btn-block" href="lab.html?id=' + l.id + '">' + (st === 'Completed' ? 'REPLAY LAB' : st === 'In progress' ? 'RESUME LAB' : 'START LAB') + '</a>';
    return '<article class="card card-hover lab-card' + (st === 'Locked' ? ' locked' : '') + '"><div class="row between"><span class="label">' + l.cat.toUpperCase() + '</span>' + UI.diff(l.diff) + '</div><h3>' + l.name + '</h3><p class="small clamp">' + l.story + '</p>' +
      '<div class="meta"><span>' + UI.icon('clock', 14) + l.time + ' min</span><span>' + UI.icon('users', 14) + CG.fmt(l.players) + ' completed</span></div>' +
      '<div class="row between"><span class="row gap-s">' + UI.xpTag(l.xp) + UI.cubeTag(l.cubes) + '</span><span class="st st-' + st.replace(' ', '').toLowerCase() + '">' + st.toUpperCase() + '</span></div>' + cta + '</article>';
  }
  function list() {
    const q = f.q.toLowerCase();
    let res = CG.data.labs.filter((l) => (f.diff === 'All' || l.diff === f.diff) && (f.cat === 'All' || l.cat === f.cat) && (f.status === 'All' || status(l) === f.status) &&
      (f.reward === 'All' || (f.reward === 'High (400+ XP)' ? l.xp >= 400 : l.xp < 400)) && (!q || (l.name + ' ' + l.cat).toLowerCase().includes(q)));
    res = res.sort((a, b) => (f.sort === 'newest' ? a.added - b.added : f.sort === 'reward' ? b.xp - a.xp : b.players - a.players));
    UI.$('#llist').innerHTML = res.length ? res.map(card).join('') : UI.empty({ icon: 'flask', title: 'No labs match', text: 'Try a different difficulty, category or status.' });
    UI.$('#lcount').textContent = res.length + ' labs';
    UI.$$('[data-unlock]').forEach((b) => (b.onclick = async () => {
      const l = CG.lab(b.dataset.unlock);
      if (CG.state.cubes < l.cost) return UI.toast({ title: 'ACCESS DENIED', msg: 'You need ' + CG.fmt(l.cost - CG.state.cubes) + ' more Cubes to unlock ' + l.name + '.', kind: 'bad' });
      if (await UI.confirm('Unlock ' + l.name + '?', 'Spend ' + CG.fmt(l.cost) + ' Cubes for permanent access to this premium lab.', 'UNLOCK')) { CG.unlockLab(l.id); UI.toast({ title: 'NEW SECTOR UNLOCKED', msg: l.name + ' is ready.', kind: 'good' }); list(); }
    }));
  }
  function render(v) {
    const done = Object.keys(CG.state.labs).length;
    v.innerHTML = '<div class="page-head"><div><span class="label">PRACTICE</span><h1>Labs</h1><p>Safe, simulated environments. Every command runs locally in a sandbox and never touches a real system.</p></div><div class="card slim"><span class="label">COMPLETED</span><b class="stat">' + done + '/' + CG.data.labs.length + '</b><small>labs cleared</small></div></div>' +
      '<div class="filters"><div id="ltabs"></div><div class="row gap wrap fbar"><input class="input" id="lq" type="search" placeholder="Search labs" aria-label="Search labs">' +
      sel('ld', 'Difficulty', ['All', 'Easy', 'Medium', 'Hard', 'Insane']) + sel('ls', 'Status', ['All', 'Available', 'In progress', 'Completed', 'Locked']) + sel('lr', 'Reward', ['All', 'High (400+ XP)', 'Standard']) +
      '<select class="input" id="lo" aria-label="Sort"><option value="popular">Popular</option><option value="newest">Newest</option><option value="reward">Top reward</option></select><span class="mono small mute" id="lcount"></span></div></div><div class="grid g3 courses" id="llist"></div>';
    UI.tabs(UI.$('#ltabs'), cats.map((c) => [c, c]), f.cat, (t) => { f.cat = t; list(); });
    UI.$('#lq').oninput = (e) => { f.q = e.target.value; list(); };
    UI.$('#ld').onchange = (e) => { f.diff = e.target.value; list(); }; UI.$('#ls').onchange = (e) => { f.status = e.target.value; list(); }; UI.$('#lr').onchange = (e) => { f.reward = e.target.value; list(); }; UI.$('#lo').onchange = (e) => { f.sort = e.target.value; list(); };
    list();
  }
  const sel = (id, label, opts) => '<select class="input" id="' + id + '" aria-label="' + label + '">' + opts.map((o) => '<option>' + o + '</option>').join('') + '</select>';
  UI.page(view, render, 6);
})();
