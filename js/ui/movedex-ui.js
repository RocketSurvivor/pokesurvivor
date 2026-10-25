/* ============ movedex-ui.js — Movedex: todos los ataques del juego ============
 * Botón arriba a la izquierda en los menús. Para cada ataque: tipo, categoría,
 * forma de atacar, daño, recarga, daño por segundo aproximado, área, número de
 * proyectiles, efectos, qué Pokémon lo aprenden y cómo evoluciona.
 * Los números son los de nivel 1, sin mejoras (las cartas y las Mejoras los suben).
 */
G.MovedexUI = (() => {
  const $ = G.UI.$;
  const KIND = {
    projectile: 'Disparo', melee: 'Golpe en arco', beam: 'Rayo', orbit: 'Órbita', nova: 'Anillo de disparos',
    aura: 'Aura', buff: 'Potenciador', boomerang: 'Bumerán', chain: 'Cadena', mine: 'Minas', meteor: 'Meteoros',
    turret: 'Torreta', dash: 'Embestida', trail: 'Rastro', cone: 'Abanico', homing: 'Teledirigido', bounce: 'Rebote',
    charge: 'Rayo cargado', spin: 'Giro', quake: 'Onda por el suelo', vortex: 'Remolino', shove: 'Empujón', stun: 'Aturdir'
  };
  const STAT = { patk: 'Ataque', satk: 'Ataque Especial', spd: 'Velocidad', def: 'Defensa', regen: 'Regeneración', atk: 'Ataque' };
  const SORTS = [['type', 'Tipo'], ['name', 'Nombre'], ['dps', 'Daño/s'], ['dmg', 'Daño'], ['cd', 'Recarga']];
  let q = '', type = '', sort = 'type', unused = false;

  /** Daño por segundo aproximado a un solo enemigo (nivel 1, sin mejoras). */
  function dps(m) {
    if (!m.dmg) return 0;
    const hits = m.kind === 'spin' || m.kind === 'quake' || m.kind === 'meteor' || m.kind === 'mine' ? 1
               : m.kind === 'orbit' ? (m.count || 1) * 1.5 : m.kind === 'bounce' ? 1 : (m.count || 1);
    const cd = m.kind === 'charge' ? m.cd + (m.charge || 0) : m.cd;
    return m.dmg * Math.min(hits, m.kind === 'nova' || m.kind === 'cone' ? 3 : hits) / Math.max(0.1, cd);
  }

  function effects(m) {
    const out = [];
    if (m.burn) out.push(G.T('Quema'));
    if (m.poison) out.push(G.T('Envenena'));
    if (m.slow) out.push(G.T('Frena'));
    if (m.stun) out.push(G.T('Aturde'));
    if (m.knock >= 200) out.push(G.T('Empuja'));
    if (m.pull) out.push(G.T('Atrae'));
    if (m.homing) out.push(G.T('Persigue'));
    if (m.pierce) out.push(G.I18n.f('Atraviesa {x}', m.pierce));
    if (m.bounce) out.push(G.I18n.f('Rebota {x}', m.bounce));
    return out;
  }

  function who(m) {
    if (m.sig) return G.I18n.f('Exclusivo de {x}', m.who.map(d => G.T(G.DEX_BY[d] ? G.DEX_BY[d].name : '')).join(', '));
    if (m.type !== 'normal') return G.I18n.f('Pokémon de tipo {x}', G.T(G.U.TYPE_NAME[m.type]));
    return m.kind === 'buff' ? G.T('Todos los Pokémon') : G.T('Pokémon de tipo Normal, y cualquiera con su MT');
  }

  function init() {
    $('btn-movedex').onclick = open;
    const sel = $('mdx-type');
    sel.innerHTML = `<option value="">${G.T('Todos los tipos')}</option>` +
      Object.keys(G.U.TYPE_NAME).map(t => `<option value="${t}">${G.T(G.U.TYPE_NAME[t])}</option>`).join('');
    sel.onchange = () => { type = sel.value; render(); };
    $('mdx-q').oninput = e => { q = e.target.value.trim().toLowerCase(); render(); };
    const sb = $('mdx-sort');
    sb.innerHTML = '';
    SORTS.forEach(([k, label]) => {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'chip';
      c.dataset.k = k;
      c.textContent = G.T(label);
      c.onclick = () => { sort = k; render(); };
      sb.appendChild(c);
    });
    // Filtro: sólo los que aún no has usado nunca.
    const u = document.createElement('button');
    u.type = 'button'; u.className = 'chip'; u.id = 'mdx-unused';
    u.textContent = G.T('Sin usar');
    u.onclick = () => { unused = !unused; render(); };
    sb.appendChild(u);
  }

  function open() {
    G.UI.show('scr-movedex', true);
    render();
  }

  function render() {
    document.querySelectorAll('#mdx-sort .chip').forEach(c => c.classList.toggle('on', c.dataset.k === sort));
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const order = Object.keys(G.U.TYPE_NAME);
    const sv = G.DB.save || {}, used = sv.mvUsed || {}, evolved = sv.evoMoves || {};
    const uc = document.getElementById('mdx-unused');
    if (uc) uc.classList.toggle('on', unused);
    let list = G.Moves.ALL.concat(G.Moves.SIG || []).filter(m => (!unused || !used[m.id]) && (!type || m.type === type) &&
      (!q || [m.name, G.T(m.name, 'move')].some(n => norm(n).includes(norm(q)))));
    const by = {
      type: (a, b) => order.indexOf(a.type) - order.indexOf(b.type) || G.T(a.name, 'move').localeCompare(G.T(b.name, 'move'), G.I18n.locale),
      name: (a, b) => G.T(a.name, 'move').localeCompare(G.T(b.name, 'move'), G.I18n.locale),
      dps: (a, b) => dps(b) - dps(a), dmg: (a, b) => (b.dmg || 0) - (a.dmg || 0), cd: (a, b) => a.cd - b.cd
    }[sort];
    list = list.slice().sort(by);
    const nUsed = G.Moves.ALL.filter(m => used[m.id]).length, evoAll = Object.keys(G.Moves.EVO);
    $('mdx-count').textContent = G.I18n.f('{x} ataques', list.length) + ' · ' + G.I18n.f('usados {x}/{x}', nUsed, G.Moves.ALL.length)
      + ' · ' + G.I18n.f('evolucionados {x}/{x}', evoAll.filter(id => evolved[id]).length, evoAll.length);
    const grid = $('mdx-grid');
    grid.innerHTML = '';
    for (const m of list) {
      const evo = G.Moves.EVO[m.id];
      const ef = effects(m);
      const cat = m.cat ? G.Stats.NAME[m.cat] : '';
      const rows = [];
      const num = v => (Math.round(v * 100) / 100).toLocaleString(G.I18n.locale);
      if (m.kind === 'buff') {
        const amt = m.stat === 'regen' ? `+${num(m.amount)}/s` : `+${Math.round(m.amount * 100)} %`;
        rows.push([G.T('Sube'), `${G.T(STAT[m.stat] || m.stat)} ${amt} ×${m.stacks}`]);
        rows.push([G.T('Duración'), num(m.dur) + ' s']);
      } else {
        rows.push([G.T('Daño'), num(m.dmg) + (m.count > 1 && m.kind !== 'spin' && m.kind !== 'quake' ? ` ×${m.count}` : '')]);
        rows.push([G.T('Daño/s'), '≈ ' + Math.round(dps(m))]);
      }
      rows.push([G.T('Recarga'), num(m.cd) + ' s' + (m.charge ? ` (+${num(m.charge)} s ${G.T('carga')})` : '')]);
      if (m.radius) rows.push([m.kind === 'beam' || m.kind === 'charge' || m.kind === 'dash' || m.kind === 'boomerang' ? G.T('Alcance') : G.T('Área'), Math.round(m.radius)]);
      if (m.width) rows.push([G.T('Grosor'), Math.round(m.width)]);
      if (m.kind === 'spin' || m.kind === 'quake') rows.push([G.T('Golpes'), m.count]);
      if (m.dur && m.kind !== 'buff') rows.push([G.T('Duración'), num(m.dur) + ' s']);
      if (m.also) rows.push([G.T('Segundo golpe'), G.T(KIND[m.also.kind] || m.also.kind) + ' · ' + Math.round(m.dmg * m.also.dmgK)]);
      const c = document.createElement('div');
      c.className = 'mdx-card' + (used[m.id] ? '' : ' unused') + (m.sig ? ' sig' : '');
      c.innerHTML = `
        <div class="mdx-head">${G.Icons.html('move:' + m.id, 28)}
          <div><b>${G.T(m.name, 'move')}</b>${evolved[m.id] ? ` <span class="mdx-badge evo" title="${G.T('Evolucionado')}">★</span>` : used[m.id] ? ` <span class="mdx-badge" title="${G.T('Usado')}">✓</span>` : ''}
          <div class="mdx-tags"><span class="tag-chip" style="background:${G.U.TYPE_COLOR[m.type]}">${G.T(G.U.TYPE_NAME[m.type])}</span>${cat ? `<span class="tag-chip cat">${cat}</span>` : ''}<span class="tag-chip kind">${G.T(KIND[m.kind] || m.kind)}</span>${m.sig ? `<span class="tag-chip sig">${G.T('Exclusivo')}</span>` : ''}</div></div></div>
        <p class="mdx-desc">${G.T(m.desc)}</p>
        <div class="mdx-stats">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
        ${ef.length ? `<p class="mdx-ef">${ef.join(' · ')}</p>` : ''}
        <p class="mdx-foot">${who(m)}${evo ? ' · ' + G.I18n.f('Evoluciona al máximo con {x}', G.T(G.Moves.NEED_NAME[evo])) : ''}</p>`;
      grid.appendChild(c);
    }
  }

  return { init, open };
})();
