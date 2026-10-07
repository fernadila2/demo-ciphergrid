(function () {
  const $ = UI.$; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const signed = !!CG.auth.session();

  /* nav state */
  if (signed) { $('#signin').textContent = 'DASHBOARD'; $('#signin').href = 'dashboard.html'; $('#startnav').textContent = 'CONTINUE';  UI.$$('.l-auth-m').forEach((a) => a.remove()); $('#startnav').href = 'courses.html'; }
  const nav = $('#lnav'); const onScroll = () => nav.classList.toggle('solid', scrollY > 20); onScroll(); addEventListener('scroll', onScroll, { passive: true });
  $('#burger').onclick = (e) => { const o = $('#llinks').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  UI.$$('#llinks a').forEach((a) => (a.onclick = () => $('#llinks').classList.remove('open')));
  const demo = (e) => { e.preventDefault(); CG.auth.demo(); location.href = 'dashboard.html'; };
  $('#demoLink').onclick = demo; $('#demoLink2').onclick = demo;

  /* count-up stats on view */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, to = Number(el.dataset.n), suf = (el.dataset.suf || '') + '+';
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now(); const step = (t) => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : ''); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  }), { threshold: 0.5 }) : null;
  UI.$$('[data-n]').forEach((el) => (io ? io.observe(el) : (el.textContent = el.dataset.n + (el.dataset.suf || '') + '+')));

  /* featured courses & labs */
  const fc = ['net', 'sqli', 'recon', 'ir'].map((id) => CG.course(id));
  $('#fcourses').innerHTML = fc.map((c) => '<article class="card card-hover course-card"><div class="cc-top"><span class="cc-ic">' + UI.icon(c.icon, 24) + '</span>' + UI.diff(c.diff) + '</div><span class="label">' + c.cat.toUpperCase() + '</span><h3>' + c.title + '</h3><p class="small clamp">' + c.desc + '</p><div class="row between"><span class="row gap-s">' + UI.xpTag(c.xp) + UI.cubeTag(c.cubes) + '</span><span class="mono small mute">' + c.hrs + 'h</span></div><a class="btn btn-ghost btn-block stretch" href="course.html?id=' + c.id + '">VIEW COURSE</a></article>').join('');
  const fl = ['neon-vault', 'black-circuit', 'silent-proxy', 'obsidian-node'].map((id) => CG.lab(id));
  $('#flabs').innerHTML = fl.map((l) => '<article class="card card-hover lab-card"><div class="row between"><span class="label">' + l.cat.toUpperCase() + '</span>' + UI.diff(l.diff) + '</div><h3>' + l.name + '</h3><p class="small clamp">' + l.story + '</p><div class="row between"><span class="row gap-s">' + UI.xpTag(l.xp) + UI.cubeTag(l.cubes) + '</span><span class="mono small mute">' + l.time + ' min</span></div><a class="btn btn-primary btn-block stretch" href="lab.html?id=' + l.id + '">START LAB</a></article>').join('');

  /* loop */
  const steps = [['Discover', 'Browse courses, labs and challenges tagged by difficulty.', 'search'], ['Learn', 'Short lessons with code, terminal examples and a knowledge check.', 'book'], ['Practice', 'Run simulated labs with objectives and optional hints.', 'flask'], ['Solve', 'Capture flags in CTF-style challenges.', 'flag'], ['Earn', 'Collect XP and Cubes for every action.', 'cube'], ['Level up', 'Raise your rank, unlock labs and cosmetics.', 'bolt'], ['Compete', 'Climb weekly boards and return tomorrow for your streak.', 'trophy']];
  $('#loop').innerHTML = steps.map((s, i) => '<li class="loop-i"><span class="loop-n mono">' + String(i + 1).padStart(2, '0') + '</span><span class="loop-ic">' + UI.icon(s[2], 22) + '</span><h3>' + s[0] + '</h3><p class="small">' + s[1] + '</p></li>').join('');

  /* leaderboard preview */
  $('#lbprev').innerHTML = CG.data.users.slice(0, 5).map((u, i) => '<tr><td class="mono">' + (i + 1) + '</td><td><span class="who">' + UI.userAvatar(u.name, 32) + '<span>' + UI.esc(u.name) + '</span></span></td><td class="mono">' + CG.levelFor(u.xp) + '</td><td class="mono acc">' + CG.fmt(u.xp) + '</td></tr>').join('');
  $('#tests').innerHTML = CG.data.testimonials.map((t) => '<figure class="card quote"><blockquote>' + UI.esc(t.q) + '</blockquote><figcaption><b>' + UI.esc(t.n) + '</b><small>' + UI.esc(t.r) + '</small></figcaption></figure>').join('');
  $('#faqs').innerHTML = CG.data.faq.map((f, i) => '<details class="faq"' + (i === 0 ? ' open' : '') + '><summary>' + UI.esc(f[0]) + '</summary><p>' + UI.esc(f[1]) + '</p></details>').join('');

  /* live activity feed */
  const feed = $('#feed'); const names = CG.data.users.map((u) => u.name);
  const pool = () => {
    const n = names[Math.floor(Math.random() * names.length)], c = CG.data.challenges[Math.floor(Math.random() * CG.data.challenges.length)], l = CG.data.labs[Math.floor(Math.random() * CG.data.labs.length)], k = CG.courses[Math.floor(Math.random() * CG.courses.length)];
    return [['[SOLVE]', n + ' captured the flag in ' + c.title + ' +' + c.pts + ' XP'], ['[LAB]', n + ' cleared ' + l.name + ' +' + l.cubes + ' cubes'], ['[LEARN]', n + ' finished ' + k.title], ['[LEVEL]', n + ' reached level ' + (5 + Math.floor(Math.random() * 20))], ['[STREAK]', n + ' extended a ' + (3 + Math.floor(Math.random() * 40)) + ' day streak']][Math.floor(Math.random() * 5)];
  };
  const addFeed = () => { const [t, m] = pool(); const d = document.createElement('div'); d.className = 'tl'; d.innerHTML = '<span class="acc">' + t + '</span> ' + UI.esc(m); feed.appendChild(d); while (feed.children.length > 8) feed.firstChild.remove(); };
  for (let i = 0; i < 5; i++) addFeed(); if (!reduce) setInterval(() => { if (!document.hidden) addFeed(); }, 2600);

  /* demo terminal typing when visible */
  const demoLines = ['$ recon vault.neon.lab', 'Starting simulated scan ...', 'Host is up (0.012s latency).', '8080/tcp  open  http-alt (Neon Admin 2.1)', '[+] 1 exposed service found. Objective 1 complete.', '$ enum vault.neon.lab:8080', '[200] /admin-legacy   <-- unusual', '$ probe /admin-legacy', 'Finding: record ids are sequential, no ownership check.', '[+] OBJECTIVE UPDATED'];
  const dt = $('#demoTerm'); let started = false;
  const typeDemo = async () => { if (started) return; started = true; for (const l of demoLines) { dt.textContent += l + '\n'; if (!reduce) await new Promise((r) => setTimeout(r, l.startsWith('$') ? 650 : 280)); } dt.textContent += '$ _'; };
  if ('IntersectionObserver' in window && !reduce) new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { typeDemo(); ob.disconnect(); } }, { threshold: 0.3 }).observe(dt); else { demoLines.forEach((l) => (dt.textContent += l + '\n')); }

  /* particles */
  const cv = $('#particles'), ctx = cv.getContext('2d'); let W, H, pts = [], raf;
  const size = () => { const r = cv.parentElement.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = r.width * dpr; H = cv.height = r.height * dpr; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; const n = Math.round(Math.min(70, r.width / 18)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr, r: (Math.random() * 1.4 + 0.6) * dpr })); };
  const css = getComputedStyle(document.documentElement);
  const draw = () => {
    ctx.clearRect(0, 0, W, H); const rgb = css.getPropertyValue('--acc-rgb') || '45,255,143';
    pts.forEach((p, i) => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; ctx.fillStyle = 'rgba(' + rgb + ',.7)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) { const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y), lim = 130 * (devicePixelRatio || 1); if (d < lim) { ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16 * (1 - d / lim)) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); } } });
    raf = requestAnimationFrame(draw);
  };
  size(); if (reduce) { draw(); cancelAnimationFrame(raf); } else draw();
  addEventListener('resize', () => { size(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) draw(); });
})();
