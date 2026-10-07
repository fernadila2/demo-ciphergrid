(function () {
  const view = UI.shell('courses'); if (!view) return;
  const cats = ['All', 'Foundations', 'Web Security', 'Offensive Security', 'Defensive Security', 'Advanced'];
  const f = { cat: UI.param('cat') || 'All', diff: 'All', status: 'All', q: '' };

  function card(c) {
    const p = CG.courseProgress(c); const lessons = p.total;
    const lab = CG.lab(c.lab), ch = CG.chal(c.chal); const done = !!CG.state.courses[c.id];
    return '<article class="card card-hover course-card"><div class="cc-top"><span class="cc-ic">' + UI.icon(c.icon, 24) + '</span><div class="row gap-s wrap">' + UI.diff(c.diff) + (done ? '<span class="chip got">COMPLETE</span>' : p.done ? '<span class="chip">IN PROGRESS</span>' : '') + '</div></div>' +
      '<span class="label">' + c.cat.toUpperCase() + '</span><h3>' + c.title + '</h3><p class="small clamp">' + c.desc + '</p>' +
      '<div class="meta"><span>' + UI.icon('clock', 14) + c.hrs + 'h</span><span>' + UI.icon('book', 14) + c.modules.length + ' modules / ' + lessons + ' lessons</span><span>' + UI.icon('flask', 14) + (lab ? lab.name : 'Lab') + '</span></div>' +
      '<div class="row between"><span class="row gap-s">' + UI.xpTag(c.xp) + UI.cubeTag(c.cubes) + '</span><span class="mono small mute">' + p.pct + '%</span></div>' + UI.progress(p.pct) +
      '<a class="btn ' + (done ? 'btn-ghost' : 'btn-primary') + ' btn-block stretch" href="course.html?id=' + c.id + '">' + (done ? 'REVIEW COURSE' : p.done ? 'CONTINUE' : 'INITIALIZE TRAINING') + '</a></article>';
  }
  function list() {
    const q = f.q.toLowerCase();
    const res = CG.courses.filter((c) => {
      const p = CG.courseProgress(c);
      return (f.cat === 'All' || c.cat === f.cat) && (f.diff === 'All' || c.diff === f.diff) &&
        (f.status === 'All' || (f.status === 'Not started' && p.done === 0) || (f.status === 'In progress' && p.done > 0 && p.done < p.total) || (f.status === 'Completed' && p.done === p.total)) &&
        (!q || (c.title + ' ' + c.topic + ' ' + c.desc).toLowerCase().includes(q));
    });
    UI.$('#clist').innerHTML = res.length ? res.map(card).join('') : UI.empty({ icon: 'search', title: 'No courses match', text: 'Clear a filter or search for another topic.' });
    UI.$('#ccount').textContent = res.length + ' of ' + CG.courses.length + ' courses';
  }
  function render(v) {
    const total = CG.courses.reduce((a, c) => a + CG.courseLessons(c).length, 0), done = Object.keys(CG.state.lessons).length;
    const mods = CG.courses.reduce((a, c) => a + c.modules.length, 0);
    v.innerHTML = '<div class="page-head"><div><span class="label">DISCOVER / LEARN</span><h1>Learning catalog</h1><p>' + CG.courses.length + ' courses, ' + mods + ' modules and ' + total + ' lessons. Every lesson ends with a knowledge check and every course links to a lab and a final challenge.</p></div>' +
      '<div class="card slim"><span class="label">YOUR PROGRESS</span><b class="stat">' + done + '/' + total + '</b><small>lessons complete</small></div></div>' +
      '<div class="filters"><div id="ctabs"></div><div class="row gap wrap fbar"><input class="input" id="cq" type="search" placeholder="Search topics, e.g. injection" aria-label="Search courses"><select class="input" id="cd" aria-label="Difficulty"><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Insane</option></select><select class="input" id="cs" aria-label="Status"><option>All</option><option>Not started</option><option>In progress</option><option>Completed</option></select><span class="mono small mute" id="ccount"></span></div></div>' +
      '<div class="grid g3 courses" id="clist"></div>';
    UI.tabs(UI.$('#ctabs'), cats.map((c) => [c, c]), f.cat, (t) => { f.cat = t; list(); });
    UI.$('#cq').oninput = (e) => { f.q = e.target.value; list(); };
    UI.$('#cd').onchange = (e) => { f.diff = e.target.value; list(); }; UI.$('#cs').onchange = (e) => { f.status = e.target.value; list(); };
    list();
  }
  UI.page(view, render, 6);
})();
