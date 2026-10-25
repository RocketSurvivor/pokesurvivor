/* ============ extras.js — cosas de la partida añadidas el 25-10-2026 ============
 *
 *   G.GoldChest  cofre dorado custodiado: una vez por partida (a veces), entre el
 *                minuto 5 y el 20, sale un cofre cerca de ti con 5 guardianes de
 *                élite alrededor. Cuando caen, quédate a su lado 2 s y eliges premio.
 *                (Sólo en solitario: en grupo habría que repartir el cofre.)
 *   G.Paths      el camino del minuto 10: eliges una de tres ventajas con su
 *                contra, que dura toda la partida.
 *   G.BiomeFx    un suceso de cada zona, cada ~70 s: niebla en el Bosque Umbrío,
 *                derrumbe de cristales en la Cueva Cristal y erupción en el Volcán
 *                Ceniza. (Los derrumbes y erupciones, sólo en solitario; la niebla, siempre.)
 *   G.Combos     cooperativo: si un compañero con un tipo que combina con el tuyo
 *                está cerca, los dos pegáis un 12 % más y se ve un lazo entre vosotros.
 */

// ---------------- cofre dorado ----------------
G.GoldChest = (() => {
  const CHANCE = 0.7, FROM = 300, TO = 1200, GUARDS = 5, OPEN_T = 2, LIFE = 120;
  let at = 0, chest = null;      // { x, y, guards: [id], t, open, life }

  function reset() { chest = null; at = Math.random() < CHANCE ? G.U.rand(FROM, TO) : 0; }

  function update(dt, pl, time) {
    if (!pl || G.Coop.active) return;
    if (!chest) {
      if (!at || time < at || G.Rift.inArena || G.Judgment.active || G.EnemyMgr.bossAlive()) return;
      at = 0;
      spawn(pl, time);
      return;
    }
    if (G.Rift.inArena || G.Judgment.active) return;          // en la arena el cofre espera
    const c = chest;
    c.t += dt;
    if ((c.life -= dt) <= 0) { chest = null; G.Spawner.say('El cofre dorado ha desaparecido…', 2.4); return; }
    const locked = c.guards.some(id => { const e = G.EnemyMgr.get(id); return e && !e.dead; });
    c.locked = locked;
    if (locked || pl.dead) { c.open = Math.max(0, c.open - dt); return; }
    if (G.U.dist2(pl.x, pl.y, c.x, c.y) < 52 * 52) {
      if (c.open === 0) G.Audio.sfx('select');
      c.open += dt;
      if (c.open >= OPEN_T) { chest = null; reward(pl, c); }
    } else c.open = Math.max(0, c.open - dt * 1.5);
  }

  function spawn(pl, t) {
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(240, 320);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (!G.World.isFree(x, y, 30)) continue;
      chest = { x, y, guards: [], t: 0, open: 0, life: LIFE, locked: true };
      const bag = G.Enemies.bagAt(t).filter(d => ['chase', 'charger', 'ranged', 'tank'].includes(d.behavior));
      const sc = G.Enemies.scale(t);
      for (let g = 0; g < GUARDS && bag.length; g++) {
        const ga = g / GUARDS * 6.2832, gx = x + Math.cos(ga) * 70, gy = y + Math.sin(ga) * 56;
        const e = new G.Enemy(G.U.pick(bag), gx, gy, { hp: sc.hp * 3, spd: sc.spd, dmg: sc.dmg * 1.2 });
        e.xp = Math.round(e.xp * 3);
        e.guard = true;
        G.EnemyMgr.add(e);
        chest.guards.push(e.id);
      }
      G.Spawner.say('¡Un cofre dorado! Vence a sus guardianes para abrirlo', 3.4);
      G.Guide.tip('chest');
      G.Audio.sfx('shiny');
      G.FX.ring(x, y, 8, 90, '#ffd23f', 0.7, 5);
      return;
    }
  }

  function reward(pl, c) {
    G.Audio.sfx('legend');
    G.FX.burst(c.x, c.y - 20, '#ffe14d', 50, 260);
    G.FX.ring(c.x, c.y, 8, 120, '#ffd23f', 0.8, 6);
    const item = G.Items.roll(pl.item);
    const it = G.Items.BY[item];
    const low = pl.moves.filter(m => m.lvl < m.def.maxLvl).sort((a, b) => a.lvl - b.lvl)[0];
    const cards = [
      { id: 'item', icon: item, color: '#ffd23f', tag: G.T('Objeto'), title: G.T(it.name), desc: G.T(it.desc),
        apply: () => setTimeout(() => G.Game.offerItem(item), 0) },
      low ? { id: 'train', icon: 'move:' + low.id, color: G.U.TYPE_COLOR[low.type], tag: G.T('Entrenamiento'),
              title: G.T(low.name, 'move') + ' +2', desc: G.T('Sube 2 niveles a tu ataque más flojo.'),
              apply: () => { G.Moves.levelUp(low); G.Moves.levelUp(low); } }
          : { id: 'train', icon: 'heart', color: '#5fe08a', tag: G.T('Entrenamiento'), title: G.T('Vigor ×2'),
              desc: G.T('+40 de vida máxima.'), apply: p => p.addMaxHp(40) },
      { id: 'loot', icon: 'ticket10', color: '#c47bff', tag: G.T('Tesoro'), title: G.T('Ticket ×10 y monedas'),
        desc: G.T('Un ticket ×10 y 300 Pokémonedas.'),
        apply: p => { G.Pickups.drop('ticket10', p.x, p.y - 20, 1); for (let i = 0; i < 6; i++) G.Pickups.drop('coin', p.x + G.U.rand(-30, 30), p.y + G.U.rand(-20, 20), 50); G.Pickups.pullAll(); } }
    ];
    G.Game.offerChoice('¡Cofre dorado!', 'Elige un premio', cards);
  }

  /** El cofre grande del mapa, teñido de oro (se hace una vez). */
  let gold = null;
  function goldImg() {
    if (gold) return gold;
    const img = G.Tiles.propSprite(0, 'bigchest', 0);
    gold = document.createElement('canvas');
    gold.width = img.width; gold.height = img.height;
    const x = gold.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.globalAlpha = 0.5;
    x.fillStyle = '#ffcf33';
    x.fillRect(0, 0, gold.width, gold.height);
    return gold;
  }

  function drawable() {
    if (!chest) return null;
    const c = chest;
    return {
      y: c.y,
      draw(ctx) {
        const P = G.Sprites.PX, img = goldImg();
        const w = img.width * P, h = img.height * P, pulse = 0.5 + Math.sin(c.t * 4) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.35 + pulse * 0.25;
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath(); ctx.ellipse(c.x, c.y, 40, 14, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.drawImage(img, Math.round(c.x - w / 2), Math.round(c.y - h + 4), w, h);
        ctx.restore();
        if (Math.random() < 0.25) G.FX.px(c.x + G.U.rand(-16, 16), c.y - G.U.rand(6, 40), '#fff3b0', { vy: -30, life: 0.6 });
        // Candado / barra de apertura.
        ctx.save();
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        const label = c.locked ? G.T('Cofre dorado · vence a los guardianes') : c.open > 0 ? G.T('Abriendo…') : G.T('Cofre dorado · acércate');
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(label, c.x, c.y - h - 6);
        ctx.fillStyle = '#ffe680'; ctx.fillText(label, c.x, c.y - h - 6);
        if (c.open > 0) {
          ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(c.x - 24, c.y + 10, 48, 6);
          ctx.fillStyle = '#ffd23f'; ctx.fillRect(c.x - 24, c.y + 10, 48 * Math.min(1, c.open / OPEN_T), 6);
        }
        ctx.restore();
      }
    };
  }

  return { reset, update, drawable, debugSpawn() { const p = G.Game.player; if (p && !chest) spawn(p, G.Game.st.time || 0); },
           get chest() { return chest; } };
})();

// ---------------- camino del minuto 10 ----------------
G.Paths = (() => {
  const AT = 600;
  const PATHS = [
    { id: 'cannon', icon: 'fist', color: '#ff5f6d', title: 'Camino del cañón', desc: '+30 % de daño, pero −25 % de vida máxima.',
      apply: p => { p.atkMul *= 1.3; p.maxHp = Math.max(1, Math.round(p.maxHp * 0.75)); p.hp = Math.min(p.hp, p.maxHp); } },
    { id: 'wall', icon: 'shield', color: '#8fa3c4', title: 'Camino de la muralla', desc: '+40 % de vida máxima, pero −10 % de velocidad.',
      apply: p => { const add = Math.round(p.maxHp * 0.4); p.addMaxHp(add); p.spdMul *= 0.9; } },
    { id: 'haste', icon: 'clock', color: '#ffd23f', title: 'Camino de la prisa', desc: '−20 % de recarga, pero −15 % de vida máxima.',
      apply: p => { p.cdMul *= 0.8; p.maxHp = Math.max(1, Math.round(p.maxHp * 0.85)); p.hp = Math.min(p.hp, p.maxHp); } },
    { id: 'sage', icon: 'book', color: '#7fe0ff', title: 'Camino del sabio', desc: '+40 % de experiencia, pero −10 % de daño.',
      apply: p => { p.xpMul *= 1.4; p.atkMul *= 0.9; } },
    { id: 'greed', icon: 'coin', color: '#ffd23f', title: 'Camino de la avaricia', desc: '+60 % de Pokémonedas, pero recibes un 10 % más de daño.',
      apply: p => { p.coinMul *= 1.6; p.dmgReduce -= 0.1; } },
    { id: 'life', icon: 'sprout', color: '#5fe08a', title: 'Camino de la vida', desc: '+2 de vida por segundo y doble radio de recogida, pero −10 % de daño.',
      apply: p => { p.regenFlat += 2; p.magnet *= 2; p.atkMul *= 0.9; } }
  ];
  let done = false;

  function reset() { done = false; }

  function update(pl, time) {
    if (done || !pl || pl.dead || time < AT || G.Rift.inArena || G.Judgment.active) return;
    done = true;
    G.Guide.tip('path');
    const pick = G.U.pickN(PATHS, 3);
    G.Game.offerChoice('Elige tu camino', 'Dura toda la partida', pick.map(p => ({
      id: p.id, icon: p.icon, color: p.color, tag: G.T('Camino'), title: G.T(p.title), desc: G.T(p.desc),
      apply: pl2 => { p.apply(pl2); pl2.path = p.id; G.Spawner.say(G.I18n.f('Has elegido el {x}', G.T(p.title).toLowerCase()), 2.6, true); }
    })));
  }

  return { reset, update, PATHS };
})();

// ---------------- sucesos de cada zona ----------------
G.BiomeFx = (() => {
  const EVERY = [60, 85], DUR = { 0: 14, 1: 8, 2: 8 };
  const NAME = { 0: '¡Niebla en el bosque! No se ve casi nada', 1: '¡Derrumbe! Cuidado con los cristales que caen', 2: '¡Erupción! Esquiva la lava' };
  let next = 0, ev = null;       // { b, t, dur, every, acc }

  function reset() { next = G.U.rand(EVERY[0], EVERY[1]) + 90; ev = null; }

  function update(dt, pl, time) {
    if (!pl) return;
    if (G.Rift.inArena || G.Judgment.active) { ev = null; return; }
    if (ev) {
      ev.t += dt;
      if (ev.b !== 0 && !G.Coop.active && !pl.dead) {
        ev.acc -= dt;
        if (ev.acc <= 0) {
          ev.acc = ev.b === 1 ? 0.45 : 0.6;
          const n = ev.b === 1 ? 2 : 1;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * 6.2832, d = G.U.rand(0, 220);
            G.Hazards.add({ kind: 'zone', x: pl.x + Math.cos(a) * d, y: pl.y + Math.sin(a) * d * 0.8,
              r: ev.b === 1 ? 40 : 58, delay: 1.0, dmg: 6 + time / 25, type: ev.b === 1 ? 'rock' : 'fire',
              color: ev.b === 1 ? '#b8e8ff' : '#ff7a2a', by: ev.b === 1 ? 'Derrumbe' : 'Erupción' });
          }
        }
      }
      if (ev.t >= ev.dur) ev = null;
      return;
    }
    if (time < next) return;
    next = time + G.U.rand(EVERY[0], EVERY[1]);
    const b = G.Tiles.zoneOf(G.World.biome);
    if (!(b in DUR)) return;
    ev = { b, t: 0, dur: DUR[b], acc: 1.2 };
    G.Spawner.say(NAME[b], 3);
    G.Guide.tip('biome');
    G.Audio.sfx(b === 0 ? 'biome' : 'boss');
    if (b !== 0) G.Camera.kick(0.6);
  }

  /** La niebla: un círculo de visión alrededor de tu Pokémon (encima del mapa, debajo del HUD). */
  function drawHud(ctx, w, h, sx, sy) {
    if (!ev || ev.b !== 0) return;
    const k = Math.min(1, ev.t / 1.5, (ev.dur - ev.t) / 1.5);
    if (k <= 0) return;
    const r = Math.max(w, h) * (0.55 - 0.33 * k);
    const g = ctx.createRadialGradient(sx, sy, r * 0.45, sx, sy, r);
    g.addColorStop(0, 'rgba(18,28,24,0)');
    g.addColorStop(1, `rgba(18,28,24,${0.93 * k})`);
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  return { reset, update, drawHud, get active() { return ev; }, debugStart(b) { next = 0; if (b != null) G.World.setBiome(b, true); } };
})();

// ---------------- combos de tipos (cooperativo) ----------------
G.Combos = (() => {
  const RANGE = 170, BONUS = 1.12;
  const PAIRS = [
    ['fire', 'grass', 'Incendio'], ['water', 'electric', 'Tormenta'], ['fire', 'water', 'Vapor'], ['rock', 'ground', 'Terremoto'],
    ['psychic', 'fairy', 'Aura mística'], ['ghost', 'dark', 'Sombra'], ['ice', 'water', 'Ventisca'], ['flying', 'electric', 'Rayo celeste'],
    ['fighting', 'steel', 'Puño de acero'], ['dragon', 'fire', 'Fuego dragón'], ['bug', 'poison', 'Plaga'], ['normal', 'fighting', 'Entrenamiento']
  ];
  let link = null;               // { other, name, a, b }

  function comboOf(t1, t2) {
    for (const [a, b, n] of PAIRS) if ((t1.includes(a) && t2.includes(b)) || (t1.includes(b) && t2.includes(a))) return n;
    return null;
  }

  function update(pl) {
    link = null;
    if (!pl) return;
    pl.comboK = 1;
    if (!G.Coop.active || pl.dead) return;
    let best = null, bd = RANGE * RANGE;
    for (const o of G.Coop.puppets()) {
      if (o.dead) continue;
      const d2 = G.U.dist2(pl.x, pl.y, o.x, o.y);
      if (d2 > bd) continue;
      const n = comboOf(pl.mon.types, o.mon.types);
      if (n) { best = { other: o, name: n }; bd = d2; }
    }
    if (best) { pl.comboK = BONUS; link = best; }
  }

  function drawGround(ctx, pl) {
    if (!link || !pl) return;
    const o = link.other, t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(t * 6) * 0.2;
    ctx.strokeStyle = '#ffe680';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.moveTo(pl.x, pl.y - 10); ctx.lineTo(o.x, o.y - 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    const mx = (pl.x + o.x) / 2, my = (pl.y + o.y) / 2 - 18, label = G.I18n.f('Combo: {x} (+12 %)', G.T(link.name));
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(label, mx, my);
    ctx.fillStyle = '#ffe680'; ctx.fillText(label, mx, my);
    ctx.restore();
  }

  return { update, drawGround, comboOf, PAIRS, get link() { return link; } };
})();

// ---------------- jefes de zona ----------------
// A los 90 s de entrar en cada zona (cada 4 min cambia; desde la segunda, minuto 5:30) sale su jefe: un Pokémon de
// los tipos de la zona, un poco más flojo que el jefe de ese momento, con un ataque
// propio (esporas en el bosque, cristales en la cueva, lava en el volcán).
// Lo saca quien manda (solitario o anfitrión); los ataques se reparten como los demás.
G.ZoneBoss = (() => {
  const AFTER = 90;
  const ZONES = {
    0: { types: ['grass', 'bug', 'poison'], color: '#9be04a', type: 'grass', name: 'Bosque Umbrío' },
    1: { types: ['rock', 'ice', 'ground'], color: '#b8e8ff', type: 'rock', name: 'Cueva Cristal' },
    2: { types: ['fire', 'dragon'], color: '#ff7a2a', type: 'fire', name: 'Volcán Ceniza' }
  };
  let zoneAt = -1, done = -1;     // tramo (cada 4 min) en el que empezó la zona / último con jefe

  function reset() { zoneAt = 0; done = -1; }
  const color = z => (ZONES[z] || ZONES[0]).color;
  const type = z => (ZONES[z] || ZONES[0]).type;

  function update(pl, time) {
    if (!pl || (G.Coop.active && !G.Coop.isHost)) return;
    const seg = Math.floor(time / 240);
    if (seg < 1 || seg === done || G.Rift.inArena || G.Judgment.active || G.EnemyMgr.bossAlive()) return;
    if (time - seg * 240 < AFTER) return;
    done = seg;
    spawn(G.Tiles.zoneOf(G.World.biome), time);
  }

  function spawn(z, t) {
    const Z = ZONES[z];
    if (!Z) return;
    const pool = G.DEX.filter(p => !p.leg && !p.mega && p.bst >= 420 && G.SPRITE_META[p.dex] && p.types.some(x => Z.types.includes(x)));
    if (!pool.length) return;
    const mon = G.U.pick(pool);
    const bosses = G.Enemies.BOSSES;
    const ref = bosses.filter(b => b.at <= t).pop() || bosses[0];
    if (!ref) return;
    const k = ref.at <= t ? 0.8 : 0.6;
    G.Sprites.preload([mon.dex]);
    const def = Object.assign({}, ref, { at: t, dex: mon.dex, name: mon.name, hp: Math.round(ref.hp * k), dmg: Math.round(ref.dmg * 0.9),
      shotDmg: Math.round((ref.shotDmg || ref.dmg * 0.5) * 0.9), shotCd: ref.shotCd || 1.1, range: ref.range || 260 });
    const e = G.Spawner.spawnBossDef(def);
    if (!e) return;
    e.zoneBoss = z;
    e.ai = null;                  // se rehace con su ataque de zona (Enemy.bossInit)
    G.Spawner.say(G.I18n.f('¡Jefe de zona: {x}!', G.T(e.name)), 3.2);
    G.Guide.tip('zoneboss');
  }

  return { reset, update, color, type, ZONES, debugSpawn() { spawn(G.Tiles.zoneOf(G.World.biome), G.Game.st.time || 0); } };
})();

// ---------------- temporadas ----------------
// Cada mes (hora de Madrid) es la temporada de un tipo: sus Pokémon pegan un 10 % más,
// sus legendarios salen más en las grietas y, si aguantas 15 minutos con uno de ese
// tipo (modo Normal o Infinito), te llevas un ticket shiny y la insignia de la temporada.
G.Season = (() => {
  const MONTH_TYPE = ['ice', 'fairy', 'grass', 'bug', 'flying', 'water', 'fire', 'electric', 'ground', 'ghost', 'dark', 'dragon'];
  const GOAL = 900;
  let given = false;

  function cur() {
    const id = G.Ranking.periodIds().m;                  // 'm202610'
    const month = +id.slice(5, 7);
    const type = MONTH_TYPE[month - 1];
    return { id, type, name: G.I18n.f('Temporada {x}', G.T(G.U.TYPE_NAME[type])) };
  }
  const fits = mon => !!mon && mon.types.includes(cur().type);

  function reset() { given = false; }

  /** Al empezar la partida: +10 % de daño si tu Pokémon es del tipo de la temporada. */
  function applyPlayer(pl) {
    pl.season = fits(pl.mon);
    if (pl.season) { pl.atkMul *= 1.1; if (!pl.weekly) setTimeout(() => G.Guide.tip('season'), 2500); }
  }

  function update(pl, time) {
    if (given || !pl || !pl.season || pl.weekly || time < GOAL) return;
    given = true;
    const s = G.DB.save, c = cur();
    if (!s) return;
    s.seasons = s.seasons || {};
    if (s.seasons[c.id]) return;
    s.seasons[c.id] = Date.now();
    G.Pickups.drop('ticketS', pl.x, pl.y - 30, 1);
    G.Pickups.pullAll();
    G.Spawner.say(G.I18n.f('¡Reto de la {x} cumplido! Ticket shiny e insignia', c.name), 3.6, true);
    G.Audio.sfx('legend');
    G.Progress.event('season');
    G.DB.commit(true);
  }

  return { cur, fits, reset, applyPlayer, update, MONTH_TYPE };
})();
