/* Lab simulation. Everything here is scripted text output. No network request is ever made. */
(function () {
  const view = UI.shell('labs'); if (!view) return;
  const lab = CG.lab(UI.param('id'));
  if (!lab) { view.innerHTML = UI.empty({ icon: 'alert', title: 'LAB NOT FOUND', text: 'That lab does not exist.', cta: 'BROWSE LABS', href: 'labs.html' }); return; }
  if (!CG.labUnlocked(lab)) { view.innerHTML = UI.empty({ icon: 'lock', title: 'ACCESS DENIED: premium lab', text: lab.name + ' costs ' + CG.fmt(lab.cost) + ' Cubes to unlock. Unlock it from the Labs catalog.', cta: 'GO TO LABS', href: 'labs.html' }); return; }

  const OBJ = ['Discover the exposed service', 'Enumerate the service', 'Identify the weakness', 'Exploit the weakness (simulated)', 'Capture and submit the flag'];
  const FIND = {
    idor: 'Record ids are sequential and no ownership check is applied.', 'anon-sub': 'Broker allows anonymous subscriptions to maintenance topics.', 'writable-script': 'Script is world-writable and executed on a schedule as root.',
    sqli: 'Parameter is concatenated into a query. Database errors are reflected.', 'public-trace': 'Team page leaks staff names and a forgotten staging subdomain.', ssrf: 'The url parameter is fetched server-side without an allowlist.',
    'weak-segmentation': 'Jump host forwards between zones without filtering.', 'log-pivot': 'Relay logs list the next hop in cleartext.', xss: 'Comment body is reflected without output encoding.',
    bola: 'Object ids are accepted without checking the caller owns them.', 'nonce-reuse': 'The same nonce encrypts multiple beacon messages.', 'log-carving': 'Rotated log still holds the intruder session lines.',
    'suid-misuse': 'SUID helper calls a tool via a relative path.', 'overbroad-policy': 'Bucket policy grants read to any authenticated principal.', 'weak-delegation': 'Service account has unconstrained delegation configured.', 'patch-logic': 'License check compares against a static phrase after one branch.',
  };
  const key = lab.id; const s = CG.state;
  const prog = () => { if (!s.labProg[key] || !s.labProg[key].obj) s.labProg[key] = { obj: [false, false, false, false, false], hints: 0, shown: [] }; return s.labProg[key]; };
  const hintFor = (n) => [
    'Begin with reconnaissance. Run: recon ' + lab.host,
    'Enumerate what the service exposes. Run: enum ' + lab.host + ':' + lab.port,
    'One enumerated path stands out as interesting. Run: probe <that path>',
    'The probe report names a weakness keyword. Run: exploit <keyword>',
    'Recover the artifact with: loot, then submit the flag in the panel on the right.',
  ][n];
  const done = () => !!s.labs[key];

  const out = () => UI.$('#tOut'), inp = () => UI.$('#tIn');
  let busy = false; const hist = []; let hp = 0;
  const line = (t, cls) => { const d = document.createElement('div'); d.className = 'tl ' + (cls || ''); d.textContent = t; out().appendChild(d); out().scrollTop = out().scrollHeight; };
  async function print(lines, cls, delay) {
    busy = true; inp().disabled = true;
    for (const l of lines) { line(l, cls); await new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : delay || 90)); }
    busy = false; inp().disabled = false; inp().focus({ preventScroll: true });
  }
  function setObj(i) {
    const p = prog(); if (p.obj[i]) return; p.obj[i] = true; CG.save(); paintSide();
    UI.toast({ title: 'OBJECTIVE UPDATED', msg: OBJ[i], kind: 'good', ms: 2600 });
  }
  const need = (i, msg) => { if (!prog().obj[i]) { line(msg, 'warn'); return false; } return true; };

  const cmds = {
    help: () => ['Available commands:', '  recon <host>        scan a host for exposed services', '  enum <host>:<port>  enumerate a discovered service', '  probe <path>        inspect an enumerated path', '  exploit <keyword>   run a simulated exploit module', '  loot                collect the objective artifact', '  hint                get a nudge (counts as a hint used)', '  objectives | clear | history | whoami | pwd | ls | cat <file>'],
    whoami: () => ['operator'], pwd: () => ['/home/operator/' + lab.id],
    ls: () => ['notes.txt  scope.txt'],
    cat: (a) => a === 'scope.txt' ? ['IN SCOPE: ' + lab.host + ' (simulated)', 'OUT OF SCOPE: everything else. This lab never contacts real systems.'] : a === 'notes.txt' ? ['Mission: ' + lab.story] : a ? ['cat: ' + a + ': No such file'] : ['usage: cat <file>'],
    history: () => hist.map((h, i) => ' ' + (i + 1) + '  ' + h),
    objectives: () => OBJ.map((o, i) => (prog().obj[i] ? '[x] ' : '[ ] ') + o),
    recon(a) {
      if (a !== lab.host) return ['usage: recon <host>', 'Target in scope: ' + lab.host];
      setObj(0);
      return ['Starting simulated scan of ' + lab.host + ' ...', 'Host is up (0.012s latency).', 'PORT        STATE   SERVICE', '22/tcp      closed  ssh', lab.port + '/tcp'.padEnd(5) + '  open    ' + lab.svc, '[+] 1 exposed service found. Objective 1 complete.'];
    },
    enum(a, b) {
      if (!need(0, 'Run recon first to find a service.')) return null;
      let host = a, port = b; if (a && a.includes(':')) { [host, port] = a.split(':'); }
      if (host !== lab.host || String(port) !== String(lab.port)) return ['usage: enum <host>:<port>', 'Example: enum ' + lab.host + ':' + lab.port];
      setObj(1);
      const decoys = ['/index', '/static', '/health', '/robots.txt'];
      const rows = decoys.slice(0, 3).map((d, i) => '[' + [200, 403, 200][i] + '] ' + d); rows.splice(1, 0, '[200] ' + lab.path + '   <-- unusual'); rows.push('[404] /backup.zip');
      return ['Enumerating ' + lab.host + ':' + lab.port + ' ...'].concat(rows, ['[+] 1 notable path found. Objective 2 complete.']);
    },
    probe(a) {
      if (!need(1, 'Enumerate first. Run enum to list paths.')) return null;
      if (!a) return ['usage: probe <path>'];
      if (!a.startsWith(lab.path)) return ['404 Not Found: ' + a, 'Nothing interesting here. Check the enum results.'];
      setObj(2);
      return ['Probing ' + lab.path + ' ...', 'Status: 200 OK', 'Finding: ' + (FIND[lab.vuln] || 'Misconfiguration detected.'), 'Weakness keyword: ' + lab.vuln, '[+] Objective 3 complete. Try: exploit ' + lab.vuln];
    },
    exploit(a) {
      if (!need(2, 'Identify a weakness first. Run probe on the unusual path.')) return null;
      if (!a) return ['usage: exploit <keyword>'];
      if (a !== lab.vuln) return ['module "' + a + '" is not applicable to this target.', 'Use the keyword reported by probe.'];
      setObj(3);
      return ['Loading simulated module: ' + lab.vuln, 'Preparing request (sandboxed) ...', '[+] Simulated weakness confirmed.', '[+] Access to the protected artifact granted. Run: loot', 'Objective 4 complete.'];
    },
    loot() {
      if (!need(3, 'You have nothing to collect yet. Exploit the weakness first.')) return null;
      return ['Collecting artifact ...', 'FLAG: ' + lab.flag, 'Copy the flag into the submission panel to finish the lab.'];
    },
    hint() {
      const p = prog(); const k = p.obj.findIndex((x) => !x); if (k < 0) return ['No hint needed. Submit your flag.'];
      if (!p.shown.includes(k)) { p.shown.push(k); p.hints++; CG.save(); paintSide(); }
      return ['HINT: ' + hintFor(k)];
    },
  };

  async function run(raw) {
    const t = raw.trim(); if (!t) return;
    line('operator@grid:~$ ' + t, 'cmd'); hist.push(t); hp = hist.length;
    const [c, ...args] = t.split(/\s+/);
    if (c === 'clear') { out().innerHTML = ''; return; }
    const fn = cmds[c];
    if (!fn) return print(['command not found: ' + c, 'Type "help" for available commands.'], 'warn');
    const res = fn(args[0], args[1]);
    if (res === null || res === undefined) return;
    await print(res, /^(\[\+\]|FLAG)/.test(res[res.length - 1]) ? 'ok' : '', 110);
  }

  function paintSide() {
    const p = prog(); const n = p.obj.filter(Boolean).length; const isDone = done();
    UI.$('#objs').innerHTML = OBJ.map((o, i) => '<li class="' + (p.obj[i] || isDone ? 'ok' : '') + '">' + ((p.obj[i] || isDone) ? UI.icon('check', 15) : '<i class="les-dot"></i>') + '<span>' + o + '</span></li>').join('');
    const pct = isDone ? 100 : (n / OBJ.length) * 100;
    UI.$('#lp').innerHTML = UI.progress(pct) + '<span class="mono small mute">' + Math.round(pct) + '% / ' + (isDone ? 5 : n) + ' of 5 objectives</span>';
    UI.$('#hints').innerHTML = p.shown.length ? p.shown.map((k) => '<li>' + UI.icon('lightbulb', 14) + '<span>' + UI.esc(hintFor(k)) + '</span></li>').join('') : '<li class="mute">No hints used. Type <b>hint</b> in the terminal or press the button.</li>';
    UI.$('#hcount').textContent = p.hints;
    const fl = UI.$('#flagIn'), fb = UI.$('#flagBtn'); fl.disabled = fb.disabled = isDone;
    UI.$('#doneBox').hidden = !isDone;
  }
  async function submitFlag(e) {
    e.preventDefault(); const v = UI.$('#flagIn').value.trim(); const msg = UI.$('#flagMsg');
    if (!v) { msg.textContent = 'Enter a flag first.'; return; }
    if (v === lab.flag) {
      setObj(4); msg.textContent = '';
      if (CG.completeLab(lab.id)) {
        paintSide();
        const nxt = CG.data.labs.find((l) => !CG.state.labs[l.id] && CG.labUnlocked(l) && l.id !== lab.id);
        UI.modal({ cls: 'celebrate', html: '<div class="lvl-burst"><div class="ring r1"></div><span class="mono acc">ACCESS GRANTED</span><h2>MISSION COMPLETE</h2><p>' + lab.name + ' cleared' + (prog().hints === 0 ? ' without hints' : '') + '.</p><div class="row gap">' + UI.xpTag(lab.xp) + UI.cubeTag(lab.cubes) + '</div>' + (nxt ? '<a class="btn btn-primary" href="lab.html?id=' + nxt.id + '">NEXT: ' + nxt.name.toUpperCase() + '</a>' : '') + '<a class="btn btn-ghost" href="labs.html">BACK TO LABS</a></div>' });
      }
    } else { msg.textContent = 'ACCESS DENIED. That flag is not valid for this lab.'; const b = UI.$('#flagIn'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); b.classList.add('err'); setTimeout(() => b.classList.remove('err'), 700); }
  }
  async function reset() {
    if (!(await UI.confirm('Reset this lab?', 'Objectives, hints and terminal state are cleared. Rewards you already earned are kept.', 'RESET'))) return;
    s.labProg[key] = { obj: [false, false, false, false, false], hints: 0, shown: [] }; CG.save(); out().innerHTML = ''; hist.length = 0; boot(); paintSide();
    UI.toast({ title: 'LAB RESET', msg: 'Environment restored to its initial state.', kind: 'info' });
  }
  async function boot() {
    const n = prog().obj.filter(Boolean).length;
    await print(['CIPHERGRID sandbox v2.4  /  SIMULATED ENVIRONMENT', 'No real systems are contacted. All output is scripted.', n ? 'Session restored: ' + n + ' of 5 objectives complete.' : 'Target: ' + lab.host, 'Type "help" to list commands. Start with: recon ' + lab.host], 'dim', 120);
  }

  function render(v) {
    v.innerHTML = '<nav class="crumb mono small"><a href="labs.html">Labs</a> / <span>' + lab.name + '</span></nav>' +
      '<div class="lab-cols"><aside class="card lab-info"><div class="row between"><span class="label">' + lab.cat.toUpperCase() + '</span>' + UI.diff(lab.diff) + '</div><h1>' + lab.name + '</h1><p>' + lab.story + '</p>' +
      '<dl class="kv"><div><dt>Target</dt><dd class="mono">' + lab.host + '</dd></div><div><dt>Time</dt><dd>' + lab.time + ' min</dd></div><div><dt>Completed by</dt><dd>' + CG.fmt(lab.players) + '</dd></div></dl><div class="row gap-s wrap">' + UI.xpTag(lab.xp) + UI.cubeTag(lab.cubes) + '</div>' +
      '<div class="safe">' + UI.icon('shield', 16) + '<span>Safe simulation. Commands never leave your browser.</span></div><button class="btn btn-ghost btn-block" id="reset">' + UI.icon('refresh', 15) + ' RESET LAB</button></aside>' +
      '<section class="term lab-term" aria-label="Lab terminal"><div class="term-bar"><i></i><i></i><i></i><span class="mono">operator@grid: ' + lab.id + '</span><span class="mono live-t"><i class="dot live"></i> SESSION LIVE</span></div><div class="term-out" id="tOut" aria-live="polite"></div>' +
      '<label class="term-in"><span class="mono">operator@grid:~$</span><input id="tIn" class="mono" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input"></label></section>' +
      '<aside class="lab-side"><section class="card"><div class="card-t"><h3>Objectives</h3></div><div id="lp"></div><ol class="objs" id="objs"></ol></section>' +
      '<section class="card"><div class="card-t"><h3>Hints</h3><span class="mono small mute">used: <b id="hcount">0</b></span></div><ul class="hints" id="hints"></ul><button class="btn btn-ghost btn-sm" id="hintBtn">' + UI.icon('lightbulb', 14) + ' REVEAL HINT</button>' + ((lab.diff === 'Hard' || lab.diff === 'Insane') ? '<p class="small dim" style="margin-top:8px">Finish this lab with zero hints to earn the Ghost badge.</p>' : '') + '</section>' +
      '<section class="card"><div class="card-t"><h3>Submit flag</h3></div><form id="flagForm" novalidate><div class="field"><input class="input mono" id="flagIn" placeholder="CG{...}" autocomplete="off" aria-label="Flag"><span class="msg" id="flagMsg" role="alert"></span></div><button class="btn btn-primary btn-block" id="flagBtn" type="submit">SUBMIT FLAG</button></form>' +
      '<div class="done-box" id="doneBox" hidden>' + UI.icon('check', 18) + '<span><b>LAB COMPLETE</b><small>Rewards collected. You can replay for practice.</small></span></div></section></aside></div>';
    UI.$('#flagForm').onsubmit = submitFlag; UI.$('#reset').onclick = reset;
    UI.$('#hintBtn').onclick = () => { if (!busy) { inp().value = 'hint'; const v = inp().value; inp().value = ''; run(v); } };
    UI.$('.lab-term').onclick = (e) => { if (!window.getSelection().toString()) inp().focus({ preventScroll: true }); };
    inp().addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !busy) { const v = inp().value; inp().value = ''; run(v); }
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hp = Math.max(0, hp - 1); inp().value = hist[hp] || ''; }
      if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hp = Math.min(hist.length, hp + 1); inp().value = hist[hp] || ''; }
    });
    paintSide(); boot();
  }
  UI.page(view, render, 3);
})();
