(function () {
  const view = UI.shell('challenges'); if (!view) return;
  const cats = ['All'].concat(Array.from(new Set(CG.data.challenges.map((c) => c.cat))));
  const f = { cat: 'All', diff: 'All', status: 'All', q: '' };
  const chOf = (id) => CG.chal(id);

  function card(c) {
    const solved = !!CG.state.chals[c.id]; const at = CG.state.attempts[c.id] || 0;
    return '<button class="card card-hover chal' + (solved ? ' solved' : '') + '" data-c="' + c.id + '" aria-label="Open challenge ' + UI.esc(c.title) + '"><div class="row between"><span class="label">' + c.cat.toUpperCase() + '</span>' + UI.diff(c.diff) + '</div>' +
      '<h3>' + UI.esc(c.title) + '</h3><p class="small clamp">' + UI.esc(c.desc) + '</p><div class="row between"><span class="row gap-s">' + UI.xpTag(c.pts) + UI.cubeTag(c.cubes) + '</span><span class="mono small ' + (solved ? 'acc' : 'mute') + '">' + (solved ? UI.icon('check', 14) + ' SOLVED' : at ? at + ' attempt' + (at > 1 ? 's' : '') : CG.fmt(c.solves) + ' solves') + '</span></div></button>';
  }
  function list() {
    const q = f.q.toLowerCase();
    const res = CG.data.challenges.filter((c) => (f.cat === 'All' || c.cat === f.cat) && (f.diff === 'All' || c.diff === f.diff) && (f.status === 'All' || (f.status === 'Solved') === !!CG.state.chals[c.id]) && (!q || (c.title + ' ' + c.desc + ' ' + c.cat).toLowerCase().includes(q)));
    UI.$('#chlist').innerHTML = res.length ? res.map(card).join('') : UI.empty({ icon: 'flag', title: 'No challenges match', text: 'Adjust the filters to see more.' });
    UI.$('#chcount').textContent = res.length + ' challenges';
    UI.$$('.chal').forEach((b) => (b.onclick = () => open(b.dataset.c)));
    const solved = Object.keys(CG.state.chals), pts = solved.reduce((a, k) => a + chOf(k).pts, 0);
    UI.$('#chstat').innerHTML = '<span class="label">SOLVED</span><b class="stat">' + solved.length + '/' + CG.data.challenges.length + '</b><small>' + CG.fmt(pts) + ' pts earned</small>';
  }

  function open(id) {
    const c = chOf(id); if (!c) return;
    const m = UI.modal({ title: UI.esc(c.title), cls: 'wide chal-modal', onClose: list, html: '<div id="cm"></div>' });
    const paint = () => {
      const s = CG.state; const solved = !!s.chals[id]; const shown = s.hintsUsed[id] || 0;
      UI.$('#cm', m.el).innerHTML = '<div class="row gap-s wrap" style="margin-bottom:12px"><span class="chip">' + c.cat + '</span>' + UI.diff(c.diff) + UI.xpTag(c.pts) + UI.cubeTag(c.cubes) + '<span class="chip mono">attempts: ' + (s.attempts[id] || 0) + '</span>' + (solved ? '<span class="chip got">SOLVED</span>' : '') + '</div>' +
        '<p class="body">' + UI.esc(c.desc) + '</p><div class="code"><div class="code-bar"><span class="mono">challenge data</span><button class="link" data-copy>Copy</button></div><pre tabindex="0"><code>' + UI.esc(c.artifact) + '</code></pre></div>' +
        '<div class="hint-box"><div class="row between"><b class="mono small">HINTS (' + shown + '/' + c.hints.length + ')</b>' + (shown < c.hints.length ? '<button class="btn btn-ghost btn-sm" id="hint">' + UI.icon('lightbulb', 14) + ' REVEAL HINT' + (solved ? '' : ' / ' + CG.HINT_COST + ' CUBES') + '</button>' : '') + '</div>' +
        '<ol class="hl">' + c.hints.slice(0, shown).map((h) => '<li>' + UI.esc(h) + '</li>').join('') + '</ol></div>' +
        (solved ? '<div class="done-box">' + UI.icon('check', 18) + '<span><b>CHALLENGE SOLVED</b><small>Flag accepted on attempt ' + s.chals[id].attempts + '.</small></span></div>' :
          '<form id="ff" novalidate><div class="field"><label for="fi">FLAG</label><div class="row gap flagrow"><input class="input mono" id="fi" placeholder="CG{...}" autocomplete="off" spellcheck="false"><button class="btn btn-primary" type="submit" id="fb">SUBMIT FLAG</button></div><span class="msg" id="fm" role="alert"></span></div></form>');
      const cp = UI.$('[data-copy]', m.el); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(c.artifact); cp.textContent = 'Copied'; } catch (e) { cp.textContent = 'Copy failed'; } setTimeout(() => (cp.textContent = 'Copy'), 1300); };
      const hb = UI.$('#hint', m.el); if (hb) hb.onclick = () => { const r = CG.revealHint(id); if (!r.ok && r.reason === 'cubes') UI.toast({ title: 'ACCESS DENIED', msg: 'Not enough Cubes for a hint. Earn more in lessons and labs.', kind: 'bad' }); paint(); };
      const ff = UI.$('#ff', m.el);
      if (ff) ff.onsubmit = (e) => {
        e.preventDefault(); const v = UI.$('#fi', m.el).value.trim(); const fm = UI.$('#fm', m.el); const fi = UI.$('#fi', m.el);
        if (!v) { fm.textContent = 'Enter a flag first.'; return; }
        UI.$('#fb', m.el).disabled = true;
        const r = CG.submitFlag(id, v);
        if (r.status === 'correct') success(c);
        else { paint(); const i2 = UI.$('#fi', m.el); if (i2) { i2.value = v; i2.classList.add('err', 'shake'); setTimeout(() => i2.classList.remove('err', 'shake'), 600); UI.$('#fm', m.el).textContent = 'ACCESS DENIED. That flag is not correct. Attempt ' + r.attempts + '.'; UI.$('#fb', m.el).disabled = true; setTimeout(() => { const b = UI.$('#fb', m.el); if (b) b.disabled = false; }, 700); } }
      };
    };
    const success = (ch) => {
      const next = CG.data.challenges.find((x) => !CG.state.chals[x.id] && x.cat === ch.cat) || CG.data.challenges.find((x) => !CG.state.chals[x.id]);
      UI.$('#cm', m.el).innerHTML = '<div class="win"><div class="ok-ring">' + UI.icon('check', 40) + '</div><span class="mono acc">ACCESS GRANTED</span><h2>FLAG ACCEPTED</h2><p>' + UI.esc(ch.title) + ' solved.</p><div class="row gap center-r">' + UI.xpTag(ch.pts) + UI.cubeTag(ch.cubes) + '</div><div class="row gap wrap center-r" style="margin-top:18px">' + (next ? '<button class="btn btn-primary" id="nx">NEXT: ' + UI.esc(next.title.toUpperCase()) + '</button>' : '') + '<button class="btn btn-ghost" data-close>BACK TO CHALLENGES</button></div></div>';
      const nx = UI.$('#nx', m.el); if (nx) nx.onclick = () => { m.close(); setTimeout(() => open(next.id), 260); };
    };
    paint();
  }

  function render(v) {
    v.innerHTML = '<div class="page-head"><div><span class="label">SOLVE</span><h1>Challenges</h1><p>' + CG.data.challenges.length + ' standalone puzzles across ' + (cats.length - 1) + ' categories. Read the data, find the flag, format CG{...}. Hints cost ' + CG.HINT_COST + ' Cubes each.</p></div><div class="card slim" id="chstat"></div></div>' +
      '<div class="filters"><div id="ctabs"></div><div class="row gap wrap fbar"><input class="input" id="cq" type="search" placeholder="Search challenges" aria-label="Search challenges"><select class="input" id="cd" aria-label="Difficulty"><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select><select class="input" id="cs" aria-label="Status"><option>All</option><option>Unsolved</option><option>Solved</option></select><span class="mono small mute" id="chcount"></span></div></div><div class="grid g3 courses" id="chlist"></div>';
    UI.tabs(UI.$('#ctabs'), cats.map((c) => [c, c]), f.cat, (t) => { f.cat = t; list(); });
    UI.$('#cq').oninput = (e) => { f.q = e.target.value; list(); }; UI.$('#cd').onchange = (e) => { f.diff = e.target.value; list(); }; UI.$('#cs').onchange = (e) => { f.status = e.target.value; list(); };
    list(); const deep = UI.param('c'); if (deep) open(deep);
  }
  UI.page(view, render, 6);
})();
