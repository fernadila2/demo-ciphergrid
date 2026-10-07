(function () {
  const view = UI.shell('leaderboard'); if (!view) return;
  let tab = 'global', q = '';
  const label = { global: 'Total XP', weekly: 'XP this week', monthly: 'XP this month', friends: 'Total XP' };
  const arrow = (d) => d > 0 ? '<span class="up mono">' + UI.icon('up', 12) + d + '</span>' : d < 0 ? '<span class="dn mono">' + UI.icon('down', 12) + Math.abs(d) + '</span>' : '<span class="mute mono">-</span>';
  const prof = (r) => r.me ? 'profile.html' : 'profile.html?u=' + encodeURIComponent(r.name);
  const av = (r, px) => r.me ? UI.avatar(CG.state.profile, px || 36) : UI.userAvatar(r.name, px || 36);

  function paint() {
    const s = CG.state; s.lastRank = s.lastRank || {};
    const rows = CG.board(tab); const me = rows.find((r) => r.me);
    const prev = s.lastRank[tab]; me.delta = prev ? prev - me.rank : 0;
    if (!prev || prev !== me.rank) { s.lastRank[tab] = me.rank; CG.save(); }
    const top = rows.slice(0, 3);
    const order = [top[1], top[0], top[2]].filter(Boolean);
    UI.$('#podium').innerHTML = order.map((r) => '<a class="pod pod-' + r.rank + '" href="' + prof(r) + '"><span class="pod-rank mono">#' + r.rank + '</span>' + av(r, r.rank === 1 ? 64 : 52) + '<b>' + UI.esc(r.name) + (r.me ? ' (you)' : '') + '</b><small class="mono">LV ' + r.level + '</small><span class="pod-xp mono">' + CG.fmt(r.score) + '</span><div class="pod-base"></div></a>').join('');
    UI.$('#myrank').innerHTML = '<div><span class="label">YOUR RANK</span><b class="stat">#' + me.rank + '</b></div><div><span class="label">' + label[tab].toUpperCase() + '</span><b class="stat">' + CG.fmt(me.score) + '</b></div><div><span class="label">CHANGE</span>' + (me.delta ? arrow(me.delta) : '<span class="mute mono">no change</span>') + '</div>' +
      (me.rank > 1 ? '<div class="grow"><span class="label">NEXT TARGET</span><p class="small"><b class="text">' + UI.esc(rows[me.rank - 2].name) + '</b> is ' + CG.fmt(rows[me.rank - 2].score - me.score + 1) + ' XP ahead. A lab or two closes the gap.</p></div>' : '<div class="grow"><p class="small acc">You hold the top spot. Defend it.</p></div>');
    const ql = q.toLowerCase(); const list = rows.filter((r) => !ql || r.name.toLowerCase().includes(ql));
    UI.$('#lbody').innerHTML = list.length ? list.map((r) => '<tr class="' + (r.me ? 'me' : '') + '"><td class="mono">' + r.rank + '</td><td><a class="who" href="' + prof(r) + '">' + av(r) + '<span>' + UI.esc(r.name) + (r.me ? ' <em>YOU</em>' : '') + '</span></a></td><td class="mono">' + r.level + '</td><td class="mono acc">' + CG.fmt(r.score) + '</td><td class="mono cy">' + CG.fmt(r.cubes) + '</td><td class="mono">' + r.labs + '</td><td class="mono">' + r.chals + '</td><td>' + arrow(r.me ? me.delta : r.delta) + '</td></tr>').join('') : '<tr><td colspan="8">' + UI.empty({ icon: 'users', title: 'No users found', text: 'Try another name, or switch tabs. Friends only lists people you follow.' }) + '</td></tr>';
    UI.$('#xph').textContent = label[tab];
  }
  function render(v) {
    v.innerHTML = '<div class="page-head"><div><span class="label">COMPETE</span><h1>Leaderboard</h1><p>Rankings refresh as you earn XP. Weekly and monthly boards reward consistency, not just history.</p></div><div class="search-s"><input class="input" id="lq" type="search" placeholder="Search users" aria-label="Search users"></div></div>' +
      '<div id="lt"></div><section class="podium" id="podium" aria-label="Top three"></section><section class="card myrank" id="myrank"></section>' +
      '<section class="card pad0"><div class="scroll-x"><table class="tbl lb"><thead><tr><th>RANK</th><th>USERNAME</th><th>LEVEL</th><th id="xph">XP</th><th>CUBES</th><th>LABS</th><th>CHALLENGES</th><th>CHANGE</th></tr></thead><tbody id="lbody"></tbody></table></div></section>';
    UI.tabs(UI.$('#lt'), [['global', 'Global'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['friends', 'Friends']], tab, (t) => { tab = t; paint(); });
    UI.$('#lq').oninput = (e) => { q = e.target.value; paint(); };
    paint();
  }
  UI.page(view, render, 3);
})();
