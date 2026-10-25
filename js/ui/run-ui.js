/* ============ run-ui.js — cartas de nivel, pausa y fin de run ============ */
G.RunUI = (() => {
  const $ = G.UI.$;
  let offers = null, offerCb = null, coopMode = false;

  /*
   * Al aparecer unas cartas (nivel, vínculo, objeto) no se pueden elegir
   * durante GUARD s y se ven apagadas: en plena pelea se pulsa 1-4 (o se toca
   * la pantalla) para cambiar de ataque y se elegía una carta sin querer.
   * Cambiar las cartas o el 2.º paso del vínculo no lo vuelven a poner: ahí ya
   * estás eligiendo a propósito.
   */
  const GUARD = 0.6;
  let guardUntil = 0, guardT = 0;
  function guard(box) {
    guardUntil = performance.now() + GUARD * 1000;
    box.classList.add('guard');
    clearTimeout(guardT);
    guardT = setTimeout(() => document.querySelectorAll('.cards.guard').forEach(b => b.classList.remove('guard')), GUARD * 1000);
  }
  const guarded = () => performance.now() < guardUntil;

  /** @param coop  en grupo: tras elegir, se queda esperando a los demás */
  function showLevelUp(level, list, cb, coop = false) {
    offerCb = cb; coopMode = coop;
    $('lvl-num').textContent = level;
    $('lvl-wait').textContent = '';
    $('lvl-wait').classList.toggle('hidden', !coop);
    $('cards').classList.remove('done');
    renderCards(list);
    $('lvl-reroll').onclick = reroll;
    G.UI.show('scr-levelup');
    guard($('cards'));
    if (autoOn()) {
      $('lvl-wait').classList.remove('hidden');
      $('lvl-wait').textContent = G.T('Mejora automática…');
      autoPick();
    }
  }

  /* ---- Mejora automática ----
   * Si está activada (menú de pausa), las cartas de nivel se eligen solas en
   * cuanto pasa la protección: primero lo que pongas arriba en la lista.
   *   Evoluciones: evolucionar un ataque (o la estadística que lo evoluciona).
   *   Mejorar ataques / Ataques nuevos: por el orden de ataques que pongas
   *     (si no has puesto ninguno: el que usas, los de tu lado físico/especial y los que más pegan).
   *   Estadísticas: por el orden de estadísticas que pongas; con poca vida, la Baya Zidra.
   * Las cartas de objeto y de vínculo se siguen eligiendo a mano.
   */
  const CATS = { evo: 'Evoluciones', up: 'Mejorar ataques', new: 'Ataques nuevos', stat: 'Estadísticas' };
  const STAT_ORDER = ['atk', 'cd', 'hp', 'def', 'spd', 'rgn', 'mag', 'xp'];
  function autoCfg() {
    const c = Object.assign({}, G.Settings.DEF.autoPick, G.Settings.get('autoPick') || {});
    // Orden de estadísticas (antes sólo había una preferida, `stat`: va la primera).
    if (!Array.isArray(c.stats) || c.stats.length !== STAT_ORDER.length || STAT_ORDER.some(x => !c.stats.includes(x))) {
      c.stats = [...new Set([c.stat, ...STAT_ORDER].filter(x => STAT_ORDER.includes(x)))];
    }
    if (!Array.isArray(c.moves)) c.moves = [];
    return c;
  }
  const autoOn = () => !!autoCfg().on;
  let autoT = 0;

  /** Lo que vale un ataque sin orden puesto (el activo, de tu lado, que haga daño). */
  function moveGuess(id, pl) {
    const d = G.Moves.BY_ID[id];
    if (!d) return 0;
    const act = pl && pl.activeMove && pl.activeMove();
    return (act && act.id === id ? 60 : 0) + (d.kind === 'buff' ? 0 : 50) + (pl && d.cat && G.Stats.fit(pl.mon, d.cat) >= 0.999 ? 30 : 0)
         + (d.dmg ? Math.min(19, d.dmg / Math.max(0.2, d.cd) / 10) : 0);
  }
  /** Puntos de un ataque: los que has ordenado van por su puesto, por encima del resto. */
  function moveScore(id, cfg, pl) {
    const i = cfg.moves.indexOf(id);
    return i >= 0 ? 1000 - i : moveGuess(id, pl);
  }

  function bestCard(list) {
    const cfg = autoCfg(), pl = G.Game.player;
    const rank = c => {
      const cat = c.type === 'stat' && c.color === '#ffd23f' ? 'evo' : c.type;
      const i = cfg.order.indexOf(cat);
      return i < 0 ? 9 : i;
    };
    const score = c => {
      const id = c.key.split(':')[1];
      if (c.type === 'up' || c.type === 'new' || c.type === 'evo') return moveScore(id, cfg, pl);
      if (c.type === 'stat') {
        if (c.color === '#ffd23f') return 2000;
        const low = pl && pl.hp < pl.maxHp * 0.35;
        if (id === 'heal') return low ? 3000 : -50;
        const i = cfg.stats.indexOf(id);
        return i < 0 ? 0 : 100 - i;
      }
      return 0;
    };
    let best = 0;
    list.forEach((c, i) => {
      const b = list[best];
      if (rank(c) < rank(b) || (rank(c) === rank(b) && score(c) > score(b))) best = i;
    });
    return best;
  }

  function autoPick() {
    clearTimeout(autoT);
    const tryPick = () => {
      if (!offers || !autoOn() || !G.UI.isOpen('scr-levelup')) return;
      if (guarded()) { autoT = setTimeout(tryPick, 60); return; }
      const i = bestCard(offers);
      const el = $('cards').children[i];
      if (el) el.classList.add('picked');
      autoT = setTimeout(() => { if (offers) pick(i); }, 180);
    };
    autoT = setTimeout(tryPick, GUARD * 1000 + 40);
  }

  /** Ataques que puede aprender el Pokémon de esta partida, por el orden de la mejora automática. */
  function autoMoves(cfg) {
    const pl = G.Game.player;
    if (!pl) return [];
    const ids = [...new Set(pl.moves.map(m => m.id).concat(G.Moves.poolFor(pl.mon)))].filter(id => G.Moves.BY_ID[id]);
    return ids.sort((a, b) => moveScore(b, cfg, pl) - moveScore(a, cfg, pl));
  }

  /** Controles de la mejora automática en el menú de pausa. */
  const autoOpen = { stats: false, moves: false };
  // Para ordenar: tocas uno (se marca) y luego otro de la misma lista, y se cambian de sitio.
  let autoSel = null;            // { g: 'cat' | 'stat' | 'move', i }
  function renderAuto() {
    const box = $('pause-auto'), cfg = autoCfg();
    const save = v => { G.Settings.set('autoPick', Object.assign({}, cfg, v)); renderAuto(); };
    const STATS = Object.fromEntries(G.LevelUp.STATS.map(s => [s.id, s]));
    const item = (grp, i, html) => `<li class="auto-it${autoSel && autoSel.g === grp && autoSel.i === i ? ' sel' : ''}" data-g="${grp}" data-i="${i}">
          <b class="auto-n">${i + 1}</b><span>${html}</span></li>`;
    const moves = autoMoves(cfg);
    box.innerHTML = `
      <div class="auto-row"><b>${G.T('Mejora automática')}</b>
        <button type="button" class="btn small ${cfg.on ? 'gold' : 'ghost'}" id="auto-on">${cfg.on ? G.T('Activada') : G.T('Desactivada')}</button></div>
      <div class="${cfg.on ? '' : 'hidden'}">
        <p class="sub" style="margin:4px 0 0;font-size:12px">${G.T('Elige sola las cartas al subir de nivel. Prioridad (lo de arriba primero):')}</p>
        <p class="sub auto-hint">${G.T('Para cambiar el orden, toca uno y luego otro: se intercambian.')}</p>
        <ol class="auto-list">${cfg.order.map((k, i) => item('cat', i, G.T(CATS[k]))).join('')}</ol>
        <details id="auto-d-stats" ${autoOpen.stats ? 'open' : ''}><summary>${G.T('Orden de las estadísticas')}</summary>
          <ol class="auto-list">${cfg.stats.map((id, i) => item('stat', i, `${G.Icons.html(STATS[id].icon, 14)} ${G.T(STATS[id].title)}`)).join('')}</ol>
          <p class="sub" style="margin:0;font-size:11px">${G.T('Con poca vida coge antes la Baya Zidra.')}</p>
        </details>
        <details id="auto-d-moves" ${autoOpen.moves ? 'open' : ''}><summary>${G.T('Orden de los ataques')}</summary>
          ${moves.length ? `<p class="sub" style="margin:4px 0 0;font-size:11px">${G.T('Para mejorar y para aprender, los de arriba primero. Se guarda para cualquier Pokémon.')}</p>
          <ol class="auto-list auto-moves">${moves.map((id, i) => item('move', i, `${G.Icons.html('move:' + id, 14)} ${G.T(G.Moves.BY_ID[id].name, 'move')}`)).join('')}</ol>
          ${cfg.moves.length ? `<button type="button" class="btn small ghost" id="auto-mreset">${G.T('Volver al orden automático')}</button>` : ''}`
          : `<p class="sub" style="margin:4px 0;font-size:12px">${G.T('Empieza una partida para ordenar sus ataques.')}</p>`}
        </details>
      </div>`;
    box.querySelector('#auto-on').onclick = () => save({ on: !cfg.on });
    box.querySelector('#auto-d-stats').ontoggle = e => { autoOpen.stats = e.target.open; };
    box.querySelector('#auto-d-moves').ontoggle = e => { autoOpen.moves = e.target.open; };
    const reset = box.querySelector('#auto-mreset');
    if (reset) reset.onclick = () => save({ moves: [] });
    const swap = (grp, i, j) => {
      if (grp === 'cat') { const o = cfg.order.slice(); [o[i], o[j]] = [o[j], o[i]]; save({ order: o }); }
      else if (grp === 'stat') { const o = cfg.stats.slice(); [o[i], o[j]] = [o[j], o[i]]; save({ stats: o }); }
      else {
        // Los de esta partida, en su orden nuevo, delante; los de otros Pokémon, detrás como estaban.
        const o = moves.slice(); [o[i], o[j]] = [o[j], o[i]];
        save({ moves: o.concat(cfg.moves.filter(id => !o.includes(id))).slice(0, 300) });
      }
    };
    // La lista de ataques se desplaza sola: se guarda dónde estaba para que no salte al redibujar.
    const ml = box.querySelector('.auto-moves');
    if (ml) { ml.scrollTop = autoOpen.scroll || 0; ml.onscroll = () => { autoOpen.scroll = ml.scrollTop; }; }
    box.querySelectorAll('.auto-it').forEach(li => li.onclick = () => {
      const g = li.dataset.g, i = +li.dataset.i;
      G.Audio.sfx('select');
      if (!autoSel || autoSel.g !== g) { autoSel = { g, i }; renderAuto(); return; }
      const j = autoSel.i;
      autoSel = null;
      if (i === j) { renderAuto(); return; }
      swap(g, i, j);
    });
  }

  /* ---- Menú de administrador (pausa) ----
   * Sólo para las cuentas de administrador (G.Admin.isMe) y en partidas de uno:
   * subir niveles y adelantar minutos para probar. Esas partidas no cuentan para
   * el ranking (el juego las marca como de prueba).
   */
  function renderAdmin() {
    const box = $('pause-admin');
    const on = G.Admin.isMe() && !G.Coop.active && !!G.Game.player;
    box.classList.toggle('hidden', !on);
    if (!on) { box.innerHTML = ''; return; }
    const t = Math.floor(G.Game.st.time || 0);
    box.innerHTML = `
      <div class="auto-row"><b class="admin-name">${G.T('Administrador')}</b><small class="sub">${G.I18n.f('Nivel {x} · minuto {x}', G.Game.player.level, G.U.mmss(t))}</small></div>
      <div class="admin-btns">
        <button type="button" class="btn small" data-lv="1">+1 ${G.T('nivel')}</button>
        <button type="button" class="btn small" data-lv="5">+5 ${G.T('niveles')}</button>
        <button type="button" class="btn small" data-lv="10">+10 ${G.T('niveles')}</button>
      </div>
      <div class="admin-btns">
        <button type="button" class="btn small" data-min="1">+1 min</button>
        <button type="button" class="btn small" data-min="5">+5 min</button>
        <button type="button" class="btn small" data-min="10">+10 min</button>
        <span class="admin-go"><input id="admin-min" type="number" min="0" max="120" step="1" value="${Math.floor(t / 60)}"><button type="button" class="btn small gold" id="admin-go">${G.T('Ir al minuto')}</button></span>
      </div>
      <p class="sub" style="margin:4px 0 0;font-size:11px">${G.T('Las partidas con estos cambios no cuentan para el ranking.')}</p>`;
    box.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => {
      for (let i = 0; i < +b.dataset.lv; i++) G.Game.debugLevelUp();
      G.Audio.sfx('select'); renderAdmin();
    });
    const go = sec => { G.Game.debugTime(Math.max(0, Math.min(7200, sec))); G.Audio.sfx('select'); renderAdmin(); };
    box.querySelectorAll('[data-min]').forEach(b => b.onclick = () => go((G.Game.st.time || 0) + 60 * +b.dataset.min));
    box.querySelector('#admin-go').onclick = () => go(60 * (+box.querySelector('#admin-min').value || 0));
  }

  /**
   * Cambiar las cartas: 1 vez gratis por partida y 1 más por cada jefe
   * derrotado (en grupo cuentan los jefes del equipo; cada uno tiene los suyos).
   */
  function rerollsLeft() {
    const p = G.Game.player;
    // 1 gratis + los comprados en Mejoras (antes, 1 más por cada jefe).
    return p ? Math.max(0, 1 + (p.rerollBonus || 0) - (p.rerolls || 0)) : 0;
  }

  function reroll() {
    if (!offers || rerollsLeft() <= 0) return;
    const p = G.Game.player;
    p.rerolls = (p.rerolls || 0) + 1;
    G.Audio.sfx('select');
    renderCards(G.LevelUp.offer(p));
  }

  function renderCards(list) {
    offers = list;
    const left = rerollsLeft();
    $('lvl-rr-n').textContent = left;
    $('lvl-reroll').classList.toggle('hidden', left <= 0);
    const box = $('cards');
    box.innerHTML = '';
    list.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'card';
      const tag = c.type === 'new'
        ? `<span class="tag-chip" style="background:${c.color}">Nuevo · ${c.tag}</span>${c.cat ? `<span class="tag-chip cat">${c.cat}</span>` : ''}`
        : c.type === 'up' || c.type === 'evo'
          ? `<span class="tag-chip" style="background:${c.color}">${c.tag}</span>`
          : `<span class="tag-chip" style="background:${c.color === '#ffd23f' ? '#ffd23f' : '#9fb1c9'}">${c.tag}</span>`;
      if (c.type === 'evo') el.classList.add('evo');
      el.innerHTML =
        `<div class="ico" style="background:${c.color}33">${G.Icons.html(c.icon, 32)}</div>
         <div class="txt"><div class="nm">${c.title} ${tag}</div><div class="ds">${c.desc}</div></div>
         <div class="key">${i + 1}</div>`;
      el.dataset.sfx = 'none';             // el juego pone su propio sonido al elegir
      el.onclick = () => pick(i);
      box.appendChild(el);
    });
  }

  function pick(i) {
    if (!offers || !offers[i] || guarded()) return;
    const c = offers[i], cb = offerCb;
    offers = null; offerCb = null;
    $('lvl-reroll').classList.add('hidden');
    if (coopMode) {
      // Se queda la carta elegida a la vista mientras eligen los demás.
      $('cards').querySelectorAll('.card').forEach((el, j) => el.classList.toggle('picked', j === i));
      $('cards').classList.add('done');
    } else G.UI.hide('scr-levelup');
    cb(c);
  }

  /** Cooperativo: quién falta por elegir. */
  function setWaiting(names) {
    const me = G.Social.me ? G.Social.me.name : '';
    const others = names.filter(n => n !== me);
    const list = a => new Intl.ListFormat(G.I18n.locale, { style: 'long', type: 'conjunction' }).format(a);
    $('lvl-wait').setAttribute('translate', 'no');
    $('lvl-wait').textContent = !names.length ? ''
      : !others.length ? G.T('Elige tu carta')
      : names.includes(me) ? G.I18n.f('Faltan por elegir: {x}', list([...others, G.T('tú')]))
      : G.I18n.f('Esperando a {x}…', list(others));
  }

  function closeLevelUp() {
    clearTimeout(autoT);
    offers = null; offerCb = null;
    $('cards').classList.remove('done');
    G.UI.hide('scr-levelup');
  }

  /**
   * Mensaje de apoyo (Ko-fi) al acabar: tras un récord o cada 10 partidas,
   * nunca en la primera y como mucho una vez al día. Se cierra con la X.
   */
  function askSupport(r) {
    if (!G.Funding || !G.Funding.url) return false;
    const runs = (G.DB.save && G.DB.save.stats && G.DB.save.stats.runs) || 0;
    if (runs < 2 || !(r.record || runs % 10 === 0)) return false;
    const today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem('ps.ask') === today) return false; localStorage.setItem('ps.ask', today); } catch (e) { return false; }
    return true;
  }

  function showOver(r, onBack) {
    $('over-title').textContent = r.dead ? 'Has caído…' : 'Run terminada';
    $('over-stats').innerHTML = `
      <div><span>Tiempo</span><b>${G.U.mmss(r.time)}</b></div>
      <div><span>Nivel</span><b>${r.level}</b></div>
      <div><span>Derrotados</span><b>${r.kills}</b></div>
      <div><span>Jefes</span><b>${r.bosses}</b></div>
      ${r.judge ? `<div style="grid-column:1/-1"><span>Ante Arceus</span><b class="gold">${G.U.mmss(r.judge.time)} · ${r.judge.bosses} ${r.judge.bosses === 1 ? 'legendario' : 'legendarios'}</b></div>
        <div style="grid-column:1/-1"><span>Daño a Arceus</span><b class="gold">${(r.judge.dmg || 0).toLocaleString(G.I18n.locale)}</b></div>` : ''}
      <div style="grid-column:1/-1"><span>Pokémonedas ganadas</span>
        <b class="gold"><span class="coin"></span> +${r.coins}</b>
        <div style="font-size:12px;color:var(--muted)">${r.breakdown}</div></div>
      ${r.t1 || r.t10 || r.ts ? `<div style="grid-column:1/-1"><span>Tickets del gacha</span><b>
        ${r.t1 ? G.Icons.html('ticket', 22) + ' +' + r.t1 + ' ' : ''}${r.t10 ? G.Icons.html('ticket10', 22) + ' +' + r.t10 + ' ×10 ' : ''}${r.ts ? G.Icons.html('ticketS', 22) + ' +' + r.ts + ' shiny' : ''}</b></div>` : ''}
      <div style="grid-column:1/-1"><span>Movimientos</span><b style="font-size:15px">
        ${r.moves.map(m => `${G.Icons.html('move:' + m.id, 16)} ${G.T(m.name, 'move')} Nv.${m.lvl}`).join(' · ') || '—'}</b></div>
      ${r.caught && r.caught.length ? `<div style="grid-column:1/-1" class="caught"><span>${G.Icons.html('shiny', 12)} Shinies conseguidos</span>
        <div class="caught-row" id="over-caught"></div></div>` : ''}
      ${r.fall ? `<div style="grid-column:1/-1"><span>Marca para el ranking (primera caída)</span><b>${G.U.mmss(r.fall.time)} · ${(r.fall.dmg || 0).toLocaleString(G.I18n.locale)}</b></div>` : ''}
      ${r.record ? '<div style="grid-column:1/-1;text-align:center" class="gold">¡Nuevo récord de tiempo!</div>' : ''}
      ${askSupport(r) ? `<div class="support-ask" id="over-ask" style="grid-column:1/-1">
        <button class="x" type="button" aria-label="Cerrar">×</button>
        <p>¿Te está gustando PokéSurvivor? Lo hago yo solo y los servidores cuestan dinero. Si quieres, puedes ayudarme a mantenerlo en línea.</p>
        <a class="btn small gold" href="${G.Funding.url}" target="_blank" rel="noopener">${G.Icons.html('heart', 14)} Apoyar en Ko-fi</a>
      </div>` : ''}`;
    const ask = $('over-ask');
    if (ask) ask.querySelector('.x').onclick = () => ask.remove();
    $('btn-again').onclick = onBack;
    if (r.caught && r.caught.length) {
      const row = $('over-caught');
      for (const c of r.caught) {
        const w = document.createElement('div');
        w.appendChild(G.UI.spriteCanvas(c.dex, 90, 72, { shiny: true, lively: true, scale: 2 }));
        w.insertAdjacentHTML('beforeend', `<small>${G.DEX_BY[c.dex].name}${c.isNew ? ' · ¡nuevo!' : ''}</small>`);
        row.appendChild(w);
      }
    }
    G.UI.show('scr-over');
  }

  /** Has encontrado un objeto llevando ya otro: ¿con cuál te quedas? */
  function showItemChoice(cur, next, cb) {
    const box = $('item-cards');
    box.innerHTML = '';
    [[cur, 'Quedarme con'], [next, 'Cambiar a']].forEach(([id, verb], i) => {
      const it = G.Items.BY[id];
      const el = document.createElement('div');
      el.className = 'card' + (i === 1 ? ' evo' : '');
      el.innerHTML = `<div class="ico">${G.Icons.html(id, 36)}</div>
        <div class="txt"><div class="nm">${verb} ${it.name}</div><div class="ds">${it.desc}</div></div>
        <div class="key">${i + 1}</div>`;
      el.onclick = () => { if (guarded()) return; G.UI.hide('scr-item'); cb(id); };
      box.appendChild(el);
    });
    G.UI.show('scr-item');
    guard(box);
  }

  // ---------------- vínculo: qué movimientos se fusionan ----------------

  let bond = null;          // { opt, cb, first, list }

  /**
   * @param opt  pl.bondOptions(): 'add' (uno suelto al grupo) o 'pair' (dos sueltos, en dos pasos)
   * @param cb   recibe la lista de movimientos que se juntan
   */
  function showBond(opt, cb) {
    bond = { opt, cb, first: null, list: [] };
    $('bond-back').onclick = bondBack;
    renderBond();
    G.UI.show('scr-bond');
    guard($('bond-cards'));
  }

  function renderBond() {
    const { opt, first } = bond;
    const names = ms => ms.map(m => G.T(m.name, 'move')).join(' + ');
    const step2 = opt.mode === 'pair' && first;
    $('bond-sub').textContent = opt.mode === 'add' ? 'Elige qué movimiento se une a ' + names(opt.group)
      : step2 ? '¿Con cuál unes ' + G.T(first.name, 'move') + '?' : 'Elige el primer movimiento que vas a unir';
    $('bond-back').classList.toggle('hidden', !step2);
    bond.list = step2 ? opt.loose.filter(m => m !== first) : opt.loose;
    const box = $('bond-cards');
    box.innerHTML = '';
    bond.list.forEach((m, i) => {
      const col = G.U.TYPE_COLOR[m.type];
      const desc = opt.mode === 'add' ? 'Se lanzará a la vez que ' + names(opt.group) + '.'
        : step2 ? 'Se lanzará a la vez que ' + G.T(first.name, 'move') + '. Queda un hueco libre.'
        : m.desc || '';
      const el = document.createElement('div');
      el.className = 'card' + (opt.mode === 'add' || step2 ? ' bond' : '');
      el.innerHTML =
        `<div class="ico" style="background:${col}33">${G.Icons.html('move:' + m.id, 32)}</div>
         <div class="txt"><div class="nm">${G.T(m.name, 'move')} <span class="tag-chip" style="background:${col}">Nv.${m.lvl}</span></div><div class="ds">${desc}</div></div>
         <div class="key">${i + 1}</div>`;
      el.dataset.sfx = 'none';
      el.onclick = () => pickBond(i);
      box.appendChild(el);
    });
  }

  function pickBond(i) {
    if (!bond || !bond.list[i] || guarded()) return;
    const m = bond.list[i];
    if (bond.opt.mode === 'pair' && !bond.first) {
      bond.first = m;
      G.Audio.sfx('select');
      renderBond();
      return;
    }
    const picked = bond.opt.mode === 'add' ? [m] : [bond.first, m];
    const cb = bond.cb;
    bond = null;
    G.UI.hide('scr-bond');
    cb(picked);
  }

  function bondBack() {
    if (!bond) return;
    bond.first = null;
    renderBond();
  }

  /*
   * Resumen de la partida en la pausa: tus ataques (categoría, daño hecho y
   * daño por segundo), tus estadísticas con todo lo subido y el objeto y las
   * cartas de mejora que llevas.
   */
  function pauseSummary() {
    const pl = G.Game.player;
    if (!pl) return '';
    const t = G.Game.st.time, n = v => Math.round(v).toLocaleString('es');
    const k2 = v => '×' + v.toFixed(2).replace('.', ',');
    const pct = v => Math.round(v * 100) + ' %';
    const moves = pl.moves.map(m => {
      const secs = Math.max(5, t - (m.since || 0)), col = G.U.TYPE_COLOR[m.type];
      const cat = m.cat ? `<span class="tag-chip" style="background:${col}">${G.Stats.NAME[m.cat]}</span>` : '<span class="sub">Mejora</span>';
      return `<tr><td>${G.Icons.html('move:' + m.id, 18)} ${G.T(m.name, 'move')} <small>Nv.${m.lvl}</small></td><td>${cat}</td>
        <td class="num">${m.cat ? n(m.dealt || 0) : '—'}</td><td class="num">${m.cat ? n((m.dealt || 0) / secs) + '/s' : '—'}</td></tr>`;
    }).join('');
    const mon = pl.mon, fis = 1 - G.Stats.taken(mon, 'physical'), esp = 1 - G.Stats.taken(mon, 'special');
    const guard = v => (v >= 0 ? '−' : '+') + Math.round(Math.abs(v) * 100) + ' %';
    const st = [
      ['Vida', n(pl.hp) + ' / ' + n(pl.maxHp)],
      ['Ataque', k2(pl.atkFor({ cat: 'physical' }))],
      ['At. Esp.', k2(pl.atkFor({ cat: 'special' }))],
      ['Defensa', Math.round(mon.df) + ' <small>' + guard(fis) + ' físico</small>'],
      ['Def. Esp.', Math.round(mon.sd) + ' <small>' + guard(esp) + ' especial</small>'],
      ['Velocidad', n(pl.spd)],
      ['Crítico', pct(pl.critChance || 0)],
      ['Reducción de daño', pct(pl.reduction)],
      ['Recarga', pl.cdMul < 0.995 ? '−' + pct(1 - pl.cdMul) : '0 %'],
      ['Regeneración', pl.regen.toFixed(1).replace('.', ',') + ' /s']
    ].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    const it = pl.item && G.Items.BY[pl.item];
    const cards = Object.entries(pl.statsTaken || {}).map(([id, c]) => {
      const s = G.LevelUp.STATS.find(x => x.id === id);
      return s ? `<span class="chip">${G.Icons.html(s.icon, 12)} ${s.title} ×${c}</span>` : '';
    }).join('');
    return `<h3>Tus ataques</h3>
      <table class="sum-moves"><tr><th></th><th></th><th class="num">Daño</th><th class="num">Por segundo</th></tr>${moves}</table>
      <h3>Tus estadísticas</h3><div class="sum-stats">${st}</div>
      <h3>Objeto y cartas</h3>
      <p class="sub">${it ? G.Icons.html(pl.item, 18) + ' <b>' + it.name + '</b>: ' + it.desc : 'Sin objeto.'}</p>
      <div class="chips">${cards || '<span class="sub">Aún no has cogido cartas de mejora.</span>'}</div>`;
  }

  /** Las esferas que llevas (con su tecla y lo que hacen) y las mejoras que tienes puestas. */
  function orbsSummary(pl) {
    const key = i => G.Touch.active ? '' : `<kbd>${i + 5}</kbd> `;
    const rows = (pl.orbs || []).map((s, i) => {
      if (!s) return '';
      const o = G.Orbs.BY[s.id];
      return `<p class="sub orb-row">${key(i)}${G.Icons.html('orb:' + s.id, 18)} <b>${G.T(o.name)}</b>${s.n > 1 ? ' ×' + s.n : ''}: ${G.T(o.desc)}</p>`;
    }).join('');
    const ob = pl.orbBuff || {};
    const on = Object.keys(ob).filter(id => ob[id] > 0)
      .map(id => `<span class="chip">${G.Icons.html('orb:' + id, 12)} ${G.T(G.Orbs.BY[id].name)} · ${Math.ceil(ob[id])} s</span>`).join('');
    return (rows || '<p class="sub">Aún no llevas esferas. Salen de los cofres, de los jefes y, a veces, al derrotar a un Pokémon.</p>')
      + (on ? `<div class="chips">${on}</div>` : '');
  }

  function showPause(coop = false) {
    $('pause-sum').innerHTML = pauseSummary();
    autoSel = null;
    renderAuto();
    renderAdmin();
    G.UI.soundControls($('pause-sound'));
    $('pause-coop').classList.toggle('hidden', !coop);
    $('btn-quit').textContent = coop ? 'Salir de la partida' : 'Abandonar run';
    G.UI.show('scr-pause');
  }

  function wirePause(onResume, onQuit) {
    $('btn-resume').onclick = onResume;
    $('btn-quit').onclick = onQuit;
  }

  return { showLevelUp, reroll, showItemChoice, showBond, pickBond, bondBack, pick, setWaiting, closeLevelUp, showOver, wirePause, showPause, bestCard };
})();
