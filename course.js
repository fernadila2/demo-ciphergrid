(function () {
  const view = UI.shell('courses'); if (!view) return;
  const course = CG.course(UI.param('id'));
  if (!course) { view.innerHTML = UI.empty({ icon: 'alert', title: 'COURSE NOT FOUND', text: 'That course does not exist. Return to the catalog.', cta: 'BROWSE COURSES', href: 'courses.html' }); return; }
  const flat = CG.courseLessons(course);
  let cur = flat.find((l) => l.id === UI.param('l')) || CG.nextLesson(course) || flat[0];

  const outline = () => course.modules.map((m, mi) => {
    const done = m.lessons.filter((l) => CG.state.lessons[l.id]).length;
    return '<details class="mod" open><summary><span class="mono acc">MODULE ' + String(mi + 1).padStart(2, '0') + '</span><b>' + UI.esc(m.title) + '</b><small>' + done + '/' + m.lessons.length + '</small></summary>' +
      m.lessons.map((l) => '<button class="les' + (l.id === cur.id ? ' on' : '') + (CG.state.lessons[l.id] ? ' done' : '') + '" data-l="' + l.id + '">' + (CG.state.lessons[l.id] ? UI.icon('check', 14) : '<i class="les-dot"></i>') + '<span>' + UI.esc(l.t) + '</span></button>').join('') + '</details>';
  }).join('');

  function diagram(idx) {
    return '<div class="flow" aria-label="Concept diagram">' + course.flow.map((n, i) => '<span class="node' + (i === idx % course.flow.length ? ' hot' : '') + '">' + UI.esc(n) + '</span>' + (i < course.flow.length - 1 ? '<i class="arrow">' + UI.icon('arrow', 16) + '</i>' : '')).join('') + '</div>';
  }
  function codeBlock(l) {
    if (!l.code) return '';
    const term = l.lang === 'term';
    return '<div class="code' + (term ? ' term' : '') + '"><div class="code-bar"><span class="mono">' + (term ? 'sandbox terminal' : l.lang) + '</span><button class="link" data-copy>Copy</button></div><pre id="codeEl" tabindex="0"><code>' + (term ? '' : UI.esc(l.code)) + '</code></pre></div>';
  }

  function paint() {
    const p = CG.courseProgress(course), i = flat.findIndex((l) => l.id === cur.id), mod = course.modules.find((m) => m.lessons.includes(cur));
    const doneL = !!CG.state.lessons[cur.id], q = CG.state.quizzes[cur.id]; const lab = CG.lab(course.lab), chal = CG.chal(course.chal);
    const prev = flat[i - 1], nxt = flat[i + 1];
    UI.$('#cside').innerHTML = '<details class="outline" ' + (innerWidth > 1024 ? 'open' : '') + '><summary class="outline-t">' + UI.icon('menu', 16) + ' Course outline <small>' + p.done + '/' + p.total + '</small></summary>' + outline() +
      '<div class="extra"><a class="ext" href="' + (CG.labUnlocked(lab) ? 'lab.html?id=' + lab.id : 'labs.html') + '">' + UI.icon('flask', 16) + '<span><b>Practical lab</b><small>' + lab.name + (CG.state.labs[lab.id] ? ' / done' : '') + '</small></span></a><a class="ext" href="challenges.html?c=' + chal.id + '">' + UI.icon('flag', 16) + '<span><b>Final challenge</b><small>' + chal.title + (CG.state.chals[chal.id] ? ' / solved' : '') + '</small></span></a></div></details>';
    UI.$$('.les', UI.$('#cside')).forEach((b) => (b.onclick = () => { cur = flat.find((l) => l.id === b.dataset.l); history.replaceState(null, '', 'course.html?id=' + course.id + '&l=' + cur.id); paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));

    UI.$('#chead').innerHTML = '<div class="row between wrap gap"><div><span class="label">' + course.cat.toUpperCase() + '</span><h1>' + course.title + '</h1><p>' + course.desc + '</p></div><div class="ch-stats"><div>' + UI.diff(course.diff) + '</div><div class="row gap-s">' + UI.xpTag(course.xp) + UI.cubeTag(course.cubes) + '</div><div class="mono small mute">' + course.hrs + 'h est.</div></div></div><div class="row gap" style="margin-top:14px"><div style="flex:1">' + UI.progress(p.pct, 'lg') + '</div><b class="mono acc">' + p.pct + '%</b></div>';

    const correct = q && q.ok;
    UI.$('#lesson').innerHTML = '<article class="card lesson"><span class="mono small mute">' + UI.esc(mod.title).toUpperCase() + ' / LESSON ' + (i + 1) + ' OF ' + flat.length + '</span><h2>' + UI.esc(cur.t) + '</h2><p class="body">' + UI.esc(cur.text) + '</p>' + diagram(i) + codeBlock(cur) +
      '<section class="quiz"><span class="label">KNOWLEDGE CHECK</span><h3>' + UI.esc(cur.q) + '</h3><div class="opts" role="radiogroup">' + cur.opts.map((o, n) => '<button class="opt' + (correct && n === cur.a ? ' right' : '') + '" role="radio" aria-checked="false" data-n="' + n + '"' + (correct ? ' disabled' : '') + '>' + UI.esc(o) + '</button>').join('') + '</div><p class="qfb small" id="qfb" aria-live="polite">' + (correct ? 'ACCESS GRANTED. Correct answer.' : '') + '</p></section>' +
      '<div class="row gap wrap actions">' + (doneL ? '<span class="chip got">' + UI.icon('check', 14) + ' LESSON COMPLETE</span>' : '<button class="btn btn-primary" id="mark">MARK AS COMPLETE (+40 XP, +20 Cubes)</button>') +
      '<a class="btn btn-ghost" href="' + (CG.labUnlocked(lab) ? 'lab.html?id=' + lab.id : 'labs.html') + '">' + UI.icon('flask', 16) + ' START LAB</a></div></article>' +
      '<div class="pn"><button class="btn btn-ghost" id="prev" ' + (prev ? '' : 'disabled') + '>' + UI.icon('chev', 16).replace('class="ic"', 'class="ic flip"') + ' PREVIOUS LESSON</button>' +
      (nxt ? '<button class="btn btn-primary" id="next">NEXT LESSON ' + UI.icon('chev', 16) + '</button>' : '<a class="btn btn-primary" href="challenges.html?c=' + chal.id + '">FINAL CHALLENGE ' + UI.icon('chev', 16) + '</a>') + '</div>';

    UI.$$('.opt').forEach((b) => (b.onclick = () => {
      const n = Number(b.dataset.n), ok = CG.answerQuiz(cur.id, n);
      UI.$$('.opt').forEach((x) => x.classList.remove('wrong'));
      if (ok) { b.classList.add('right'); UI.$$('.opt').forEach((x) => (x.disabled = true)); UI.$('#qfb').textContent = 'ACCESS GRANTED. Correct answer.'; }
      else { b.classList.add('wrong'); UI.$('#qfb').textContent = 'ACCESS DENIED. Review the lesson and try again.'; }
    }));
    const mk = UI.$('#mark'); if (mk) mk.onclick = () => { CG.completeLesson(cur.id); paint(); };
    const go = (l) => { cur = l; history.replaceState(null, '', 'course.html?id=' + course.id + '&l=' + cur.id); paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    if (prev) UI.$('#prev').onclick = () => go(prev); if (nxt) UI.$('#next').onclick = () => go(nxt);
    const cp = UI.$('[data-copy]'); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(cur.code); cp.textContent = 'Copied'; } catch (e) { cp.textContent = 'Copy failed'; } setTimeout(() => (cp.textContent = 'Copy'), 1400); };
    const ce = UI.$('#codeEl code'); if (ce && cur.lang === 'term') UI.type(ce, cur.code, 10);
  }
  function render(v) {
    v.innerHTML = '<nav class="crumb mono small"><a href="courses.html">Learn</a> / <span>' + course.title + '</span></nav><section class="card glow" id="chead"></section><div class="course-cols"><aside id="cside" class="cside"></aside><div id="lesson"></div></div>';
    paint();
  }
  UI.page(view, render, 3);
})();
