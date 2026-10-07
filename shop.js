(function () {
  const view = UI.shell('shop'); if (!view) return;
  const types = [['all', 'All'], ['theme', 'Profile themes'], ['frame', 'Avatar frames'], ['skin', 'Dashboard skins'], ['badge', 'Badges'], ['title', 'Titles'], ['effect', 'Effects']];
  let tab = 'all';
  const accent = { violet: '#a78bfa', cyan: '#38d9ff', amber: '#ffb84d', crimson: '#ff4d6a' };

  function preview(it) {
    if (it.type === 'theme') return '<div class="pv pv-theme" style="--c:' + accent[it.val] + '"><i></i><i></i><i></i></div>';
    if (it.type === 'frame') return '<div class="pv">' + UI.avatar({ name: 'x', frame: it.val, avatar: { seed: 'preview', hue: 150 } }, 64) + '</div>';
    if (it.type === 'skin') return '<div class="pv pv-skin skin-' + it.val + '"></div>';
    if (it.type === 'badge') return '<div class="pv"><span class="b-ic big-b">' + UI.icon('star', 30) + '</span></div>';
    if (it.type === 'title') return '<div class="pv"><span class="title-pv mono">' + UI.esc(it.val) + '</span></div>';
    return '<div class="pv"><span class="b-ic big-b">' + UI.icon('bolt', 30) + '</span></div>';
  }
  function card(it) {
    const s = CG.state; const owned = s.owned.includes(it.id), eq = owned && CG.isEquipped(it); const afford = s.cubes >= it.price;
    return '<article class="card card-hover item' + (eq ? ' equipped' : '') + '">' + preview(it) + '<div class="row between"><span class="label">' + it.type.toUpperCase() + '</span>' + (eq ? '<span class="chip got">EQUIPPED</span>' : owned ? '<span class="chip">OWNED</span>' : '') + '</div><h3>' + it.name + '</h3><p class="small">' + it.desc + '</p>' +
      (owned ? '<button class="btn ' + (eq ? 'btn-ghost' : 'btn-primary') + ' btn-block" data-' + (eq ? 'un' : 'eq') + '="' + it.id + '">' + (eq ? 'UNEQUIP' : 'EQUIP') + '</button>' :
        '<button class="btn ' + (afford ? 'btn-primary' : 'btn-ghost') + ' btn-block" data-buy="' + it.id + '">' + UI.icon('cube', 15) + ' ' + CG.fmt(it.price) + (afford ? ' / BUY' : ' / NEED ' + CG.fmt(it.price - s.cubes) + ' MORE') + '</button>') + '</article>';
  }
  function list() {
    const items = CG.data.shop.filter((i) => tab === 'all' || i.type === tab);
    UI.$('#shopgrid').innerHTML = items.map(card).join('');
    UI.$$('[data-buy]').forEach((b) => (b.onclick = async () => {
      const it = CG.data.shop.find((i) => i.id === b.dataset.buy);
      if (CG.state.cubes < it.price) return UI.toast({ title: 'ACCESS DENIED', msg: 'You need ' + CG.fmt(it.price - CG.state.cubes) + ' more Cubes. Earn them in labs and challenges.', kind: 'bad' });
      if (!(await UI.confirm('Buy ' + it.name + '?', 'Spend ' + CG.fmt(it.price) + ' Cubes. Cubes are virtual points with no cash value.', 'BUY'))) return;
      const r = CG.buy(it.id); if (r.ok) { CG.equip(it.id); UI.toast({ title: 'PURCHASE COMPLETE', msg: it.name + ' is equipped.', kind: 'good' }); head(); list(); }
    }));
    UI.$$('[data-eq]').forEach((b) => (b.onclick = () => { CG.equip(b.dataset.eq); UI.toast({ title: 'EQUIPPED', msg: 'Cosmetic applied.', kind: 'good', ms: 2000 }); list(); }));
    UI.$$('[data-un]').forEach((b) => (b.onclick = () => { CG.unequip(CG.data.shop.find((i) => i.id === b.dataset.un).type); list(); }));
  }
  function head() { UI.$('#shopbal').innerHTML = '<span class="label">YOUR BALANCE</span><b class="stat cy">' + UI.icon('cube', 22) + ' ' + CG.fmt(CG.state.cubes) + '</b><small>' + CG.state.owned.length + ' items owned</small>'; }
  function render(v) {
    v.innerHTML = '<div class="page-head"><div><span class="label">UNLOCK</span><h1>Cube shop</h1><p>Spend Cubes on cosmetics that change how your profile and dashboard look. Cubes are virtual platform points and cannot be exchanged for money.</p></div><div class="card slim" id="shopbal"></div></div><div id="stabs"></div><div class="grid g4 shopg" id="shopgrid"></div>' +
      '<section class="card"><div class="card-t"><h2>Premium labs</h2><a class="link" href="labs.html">Open labs</a></div><p class="small">Some advanced labs unlock with Cubes: ' + CG.data.labs.filter((l) => l.cost).map((l) => l.name + ' (' + l.cost + ')').join(', ') + '.</p></section>';
    UI.tabs(UI.$('#stabs'), types, tab, (t) => { tab = t; list(); }); head(); list();
  }
  CG.on('change', () => { if (UI.$('#shopbal')) head(); });
  UI.page(view, render, 4);
})();
