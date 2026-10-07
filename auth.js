/* Auth screens (LocalStorage simulation). Swap CG.auth.* for real API calls later. */
(function () {
  const main = UI.$('#authMain');
  const next = () => { const n = UI.param('next'); return n && /^[\w\-.]+\.html/.test(n) ? n : 'dashboard.html'; };
  let pending = null; // {name,email,pass,code}

  /* terminal on the side panel */
  (function () {
    const el = UI.$('#authTerm'); if (!el) return;
    const lines = ['$ grid connect --secure', 'handshake ........ ok', 'identity .......... awaiting', '$ status', 'SYSTEM STATUS: ONLINE', 'labs: 16 sandboxed  challenges: 32', '$ _'];
    let i = 0; const tick = () => { if (i >= lines.length) return; el.textContent += lines[i++] + '\n'; setTimeout(tick, 420); }; tick();
  })();

  const strength = (p) => {
    let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^\w\s]/.test(p)) s++;
    return Math.min(4, Math.max(p ? 1 : 0, s - (p.length < 8 ? 1 : 0)));
  };
  const tabsHtml = (on) => '<div class="auth-tabs" role="tablist"><a role="tab" href="#login" class="' + (on === 'login' ? 'on' : '') + '">Sign in</a><a role="tab" href="#register" class="' + (on === 'register' ? 'on' : '') + '">Sign up</a></div>';
  const field = (id, label, type, ph, extra) => '<div class="field"><label for="' + id + '">' + label + '</label><input class="input" id="' + id + '" type="' + type + '" placeholder="' + (ph || '') + '" ' + (extra || '') + '><span class="msg" id="' + id + 'Msg" role="alert"></span></div>';
  const err = (id, m) => { const i = UI.$('#' + id), s = UI.$('#' + id + 'Msg'); if (i) i.classList.toggle('err', !!m); if (s) s.textContent = m || ''; return !m; };
  const social = () => '<div class="or"><span>or continue with</span></div><div class="row gap soc"><button class="btn btn-ghost btn-block" type="button" data-soc="GitHub">GitHub</button><button class="btn btn-ghost btn-block" type="button" data-soc="Google">Google</button></div>';
  const bindSocial = () => UI.$$('[data-soc]').forEach((b) => (b.onclick = () => UI.toast({ title: 'SOCIAL LOGIN OFFLINE', msg: b.dataset.soc + ' sign-in is a placeholder in this prototype. Use email or the demo account.', kind: 'info' })));
  const pwToggle = (id) => '<button type="button" class="pw-t" data-pw="' + id + '" aria-label="Show password">' + UI.icon('eye', 16) + '</button>';
  const bindPw = () => UI.$$('[data-pw]').forEach((b) => (b.onclick = () => { const i = UI.$('#' + b.dataset.pw); i.type = i.type === 'password' ? 'text' : 'password'; }));
  const go = (h) => { location.hash = h; };

  let storageOk = true; try { localStorage.setItem('cg_t', '1'); localStorage.removeItem('cg_t'); } catch (e) { storageOk = false; }
  const warn = () => storageOk ? '' : '<p class="msg" style="color:var(--am)">Your browser is blocking local storage, so accounts cannot be saved. Open this site through a local server (for example: python3 -m http.server) or allow storage for this page.</p>';
  const views = {
    login() {
      main.innerHTML = '<div class="auth-card">' + tabsHtml('login') + '<span class="mono acc small">SECURE ACCESS</span><h2>Enter the Grid</h2><p>Sign in to continue your progression.</p>' +
        '<form id="f" novalidate>' + field('email', 'EMAIL', 'email', 'operator@ciphergrid.dev', 'autocomplete="email"') +
        '<div class="field"><label for="pass">PASSWORD</label><div class="pw"><input class="input" id="pass" type="password" autocomplete="current-password" placeholder="Your password">' + pwToggle('pass') + '</div><span class="msg" id="passMsg" role="alert"></span></div>' +
        '<div class="row between"><label class="check"><input type="checkbox" checked> Keep me signed in</label><a class="link" href="#forgot">Forgot password?</a></div>' +
        '<button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:18px">ENTER THE GRID</button></form>' +
        '<button class="btn btn-ghost btn-block" id="demo" style="margin-top:10px">' + UI.icon('play', 14) + ' TRY THE DEMO ACCOUNT</button>' + social() +
        '<p class="switch">New here? <a class="link" href="#register">Sign up for free</a></p></div>';
      bindPw(); bindSocial();
      UI.$('#demo').onclick = () => { CG.auth.demo(); location.href = next(); };
      UI.$('#f').onsubmit = (e) => {
        e.preventDefault(); const email = UI.$('#email').value, pass = UI.$('#pass').value;
        const a = err('email', /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter a valid email address.'); const b = err('pass', pass ? '' : 'Enter your password.');
        if (!a || !b) return;
        const r = CG.auth.login({ email, pass });
        if (!r.ok) { err('pass', r.error); UI.$('.auth-card').classList.remove('shake'); void UI.$('.auth-card').offsetWidth; UI.$('.auth-card').classList.add('shake'); return; }
        location.href = next();
      };
    },
    register() {
      main.innerHTML = '<div class="auth-card">' + tabsHtml('register') + '<span class="mono acc small">NEW OPERATOR</span><h2>Create your account</h2><p>Start with 500 welcome Cubes.</p>' + warn() + '<form id="f" novalidate>' +
        field('name', 'USERNAME', 'text', '3 to 20 letters, numbers or _', 'autocomplete="username" maxlength="20"') + field('email', 'EMAIL', 'email', 'you@example.com', 'autocomplete="email"') +
        '<div class="field"><label for="pass">PASSWORD</label><div class="pw"><input class="input" id="pass" type="password" autocomplete="new-password" placeholder="At least 8 characters">' + pwToggle('pass') + '</div><div class="meter" id="meter" aria-live="polite"><i></i><i></i><i></i><i></i><span id="mtxt" class="mono">STRENGTH: NONE</span></div><span class="msg" id="passMsg" role="alert"></span></div>' +
        '<label class="check"><input type="checkbox" id="terms"> <span>I accept the Terms of Use and understand Cubes are virtual points with no cash value.</span></label><span class="msg" id="termsMsg" role="alert"></span>' +
        '<button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:16px">INITIALIZE TRAINING</button></form>' + social() +
        '<p class="switch">Already registered? <a class="link" href="#login">Sign in</a></p></div>';
      bindPw(); bindSocial();
      UI.$('#pass').oninput = (e) => { const s = strength(e.target.value); const m = UI.$('#meter'); m.dataset.s = s; UI.$('#mtxt').textContent = 'STRENGTH: ' + ['NONE', 'WEAK', 'FAIR', 'GOOD', 'STRONG'][s]; };
      UI.$('#f').onsubmit = (e) => {
        e.preventDefault(); const name = UI.$('#name').value.trim(), email = UI.$('#email').value.trim(), pass = UI.$('#pass').value;
        const ok = [err('name', /^\w{3,20}$/.test(name) ? '' : 'Use 3 to 20 letters, numbers or underscores.'), err('email', /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter a valid email address.'), err('pass', pass.length >= 8 ? '' : 'Use at least 8 characters. Mixing letters, numbers and symbols makes it stronger.'), (() => { const t = UI.$('#terms').checked; UI.$('#termsMsg').textContent = t ? '' : 'Accept the terms to continue.'; return t; })()];
        if (ok.includes(false)) return;
        const r = CG.auth.register({ name, email, pass });
        if (!r.ok) { err(/username/i.test(r.error) ? 'name' : 'email', r.error); return; }
        pending = { name, email, pass, code: String(Math.floor(100000 + Math.random() * 900000)) }; sessionStorage.setItem('cg_pending', JSON.stringify(pending)); go('verify');
      };
    },
    verify() {
      pending = pending || JSON.parse(sessionStorage.getItem('cg_pending') || 'null');
      if (!pending) return go('login');
      main.innerHTML = '<div class="auth-card"><span class="mono acc small">EMAIL VERIFICATION</span><h2>Check your inbox</h2><p>We sent a 6-digit code to <b class="text">' + UI.esc(pending.email) + '</b>.</p>' +
        '<div class="inbox"><span class="mono dim small">DEMO INBOX (no real email is sent)</span><b class="mono" id="code">' + pending.code + '</b></div><form id="f" novalidate>' + field('otp', 'VERIFICATION CODE', 'text', '000000', 'inputmode="numeric" maxlength="6" autocomplete="one-time-code"') +
        '<button class="btn btn-primary btn-block btn-lg" type="submit">VERIFY</button></form><p class="switch">Didn\'t get it? <button class="link" id="resend" type="button">Send a new code</button></p></div>';
      UI.$('#resend').onclick = () => { pending.code = String(Math.floor(100000 + Math.random() * 900000)); sessionStorage.setItem('cg_pending', JSON.stringify(pending)); UI.$('#code').textContent = pending.code; UI.toast({ title: 'CODE SENT', msg: 'A new demo code is shown in the inbox box.', kind: 'good' }); };
      UI.$('#f').onsubmit = (e) => { e.preventDefault(); const v = UI.$('#otp').value.trim(); if (v !== pending.code) return err('otp', 'ACCESS DENIED. That code does not match.'); CG.auth.verify(pending.email); go('success'); };
    },
    success() {
      pending = pending || JSON.parse(sessionStorage.getItem('cg_pending') || 'null'); if (!pending) return go('login');
      main.innerHTML = '<div class="auth-card center"><div class="ok-ring">' + UI.icon('check', 38) + '</div><span class="mono acc small">ACCESS GRANTED</span><h2>Account created</h2><p>Welcome, <b class="text">' + UI.esc(pending.name) + '</b>. Your 500 welcome Cubes are waiting.</p><button class="btn btn-primary btn-block btn-lg" id="enter">ENTER THE GRID</button></div>';
      UI.$('#enter').onclick = () => { const r = CG.auth.login({ email: pending.email, pass: pending.pass }); sessionStorage.removeItem('cg_pending'); location.href = r.ok ? 'courses.html' : 'auth.html#login'; };
    },
    forgot() {
      main.innerHTML = '<div class="auth-card"><span class="mono acc small">RECOVERY</span><h2>Reset your password</h2><p>Enter your account email. We will send a reset link.</p><form id="f" novalidate>' + field('email', 'EMAIL', 'email', 'you@example.com') + '<button class="btn btn-primary btn-block btn-lg" type="submit">SEND RESET LINK</button></form><p class="switch"><a class="link" href="#login">Back to sign in</a></p></div>';
      UI.$('#f').onsubmit = (e) => {
        e.preventDefault(); const email = UI.$('#email').value.trim(); if (!err('email', /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter a valid email address.')) return;
        const exists = CG.auth.exists(email);
        main.innerHTML = '<div class="auth-card"><span class="mono acc small">LINK SENT</span><h2>Check your email</h2><p>If an account exists for <b class="text">' + UI.esc(email) + '</b>, a reset link is on its way.</p>' +
          (exists ? '<div class="inbox"><span class="mono dim small">DEMO INBOX</span><button class="btn btn-ghost btn-sm" id="open">OPEN RESET LINK</button></div>' : '') + '<p class="switch"><a class="link" href="#login">Back to sign in</a></p></div>';
        if (exists) UI.$('#open').onclick = () => { sessionStorage.setItem('cg_reset', email); go('reset'); };
      };
    },
    reset() {
      const email = sessionStorage.getItem('cg_reset'); if (!email) return go('forgot');
      main.innerHTML = '<div class="auth-card"><span class="mono acc small">NEW PASSWORD</span><h2>Choose a new password</h2><form id="f" novalidate>' + field('pass', 'NEW PASSWORD', 'password', 'At least 8 characters', 'autocomplete="new-password"') + '<button class="btn btn-primary btn-block btn-lg" type="submit">UPDATE PASSWORD</button></form></div>';
      UI.$('#f').onsubmit = (e) => { e.preventDefault(); const p = UI.$('#pass').value; if (!err('pass', p.length >= 8 ? '' : 'Use at least 8 characters.')) return; CG.auth.reset(email, p); sessionStorage.removeItem('cg_reset'); UI.toast({ title: 'PASSWORD UPDATED', msg: 'Sign in with your new password.', kind: 'good' }); go('login'); };
    },
  };
  const route = () => { const v = (location.hash || '#login').slice(1); (views[v] || views.login)(); main.focus({ preventScroll: true }); };
  window.addEventListener('hashchange', route);
  if (CG.auth.session() && !location.hash) { /* already signed in */ }
  route();
})();
