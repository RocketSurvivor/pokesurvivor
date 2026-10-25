/* ============ dungeon.js — modo Mazmorra (25-10-2026) ============
 * Pisos cortos al estilo Mundo Misterioso (sólo en solitario):
 *   - En cada piso hay que derrotar a unos cuantos Pokémon; entonces se abre la
 *     ESCALERA (flecha en el borde de la pantalla). Al pisarla bajas al siguiente:
 *     mapa y zona nuevos, enemigos más fuertes y recuperas un poco de vida.
 *   - Cada piso puede tener una sala especial: tesoro (cofre dorado con
 *     guardianes), descanso (recuperas toda la vida), casa de monstruos (te rodean
 *     de golpe), trampas (zonas que estallan todo el piso) o tienda de Kecleon
 *     (gastas las monedas de la partida).
 *   - Cada 5 pisos, un jefe; cada 10, un legendario (con sus fases y su ataque
 *     exclusivo). La escalera sale al vencerlo.
 *   - Premios (a tu cuenta al acabar, como los tickets de la partida): 1 ticket por
 *     cada piso superado, 1 ticket ×10 por jefe y, por cada legendario, 2 ×10 y
 *     1 ticket shiny. Se guarda tu piso récord (stats.dgBest).
 *   - No hay Arceus, grietas, jefes de siempre ni jefes de zona: la dificultad la
 *     marca el piso (G.Dungeon.vt, el "minuto" equivalente para las oleadas).
 */
G.Dungeon = (() => {
  const ROOMS = [['normal', 40], ['treasure', 13], ['rest', 10], ['monster', 14], ['trap', 12], ['shop', 11]];
  const ROOM_NAME = { treasure: 'Sala del tesoro', rest: 'Sala de descanso', monster: '¡Casa de monstruos!', trap: 'Sala de trampas', shop: 'Tienda de Kecleon' };
  let on = false, floor = 1, killsAt = 0, need = 0, stairs = null, room = 'normal', bossId = 0, bossWait = 0,
      trapT = 0, nextBoss = null, cleared = 0, reward = { t1: 0, t10: 0, ts: 0 }, announced = false;

  /** "Minuto" equivalente del piso, para las oleadas y la fuerza de los enemigos. */
  const vtOf = f => 20 + (f - 1) * 45;
  const isBoss = f => f % 5 === 0;
  const isLegend = f => f % 10 === 0;

  function reset() {
    on = G.Mode.cur === 'dungeon';
    floor = 1; killsAt = 0; need = 0; stairs = null; room = 'normal'; bossId = 0; bossWait = 0; trapT = 0;
    nextBoss = null; cleared = 0; reward = { t1: 0, t10: 0, ts: 0 }; announced = false;
  }

  /** Lo llama game.js al empezar la partida (ya con tu Pokémon creado). */
  function begin(pl) {
    if (!on) return;
    startFloor(pl, true);
  }

  function pickRoom() {
    let r = Math.random() * ROOMS.reduce((a, x) => a + x[1], 0);
    for (const [k, w] of ROOMS) if ((r -= w) <= 0) return k;
    return 'normal';
  }

  /** El jefe del piso (se elige un piso antes, para que su sprite ya esté cargado). */
  function bossFor(f) {
    const t = vtOf(f);
    const slots = G.Enemies.BOSS_SLOTS, idx = Math.min(slots.length - 1, f / 5 - 1), slot = slots[Math.max(0, idx)];
    const extra = 1 + Math.max(0, f - 25) * 0.08;
    let p;
    if (isLegend(f)) {
      p = G.U.pick(G.DEX.filter(x => x.leg && !x.mega && !x.form && x.dex !== 493 && G.SPRITE_META[x.dex]));
    } else {
      const b = G.Enemies.BOSSES[Math.max(0, idx)];
      p = G.DEX_BY[b.dex];
    }
    G.Sprites.preload([p.dex], 8000);
    const k = isLegend(f) ? 1.5 : 1;
    return {
      at: t, dex: p.dex, name: p.name, legend: isLegend(f),
      hp: Math.round(slot.hp * 1.35 * k * extra), spd: 60, dmg: Math.round(slot.dmg * 1.2 * Math.sqrt(extra)), xp: Math.round(slot.xp * k),
      behavior: 'chase', shotDmg: Math.round(slot.dmg * 0.55 * Math.sqrt(extra)), shotCd: 1.1, range: 260
    };
  }

  function startFloor(pl, first) {
    stairs = null; bossId = 0; trapT = 2; announced = false;
    killsAt = pl.kills;
    room = first || isBoss(floor) ? 'normal' : pickRoom();
    need = isBoss(floor) ? 0 : 20 + floor * 4 + (room === 'monster' ? 10 : 0);
    if (isBoss(floor)) { bossWait = 2.2; if (!nextBoss) nextBoss = bossFor(floor); }
    if (isBoss(floor + 1)) nextBoss = bossFor(floor + 1);
    G.World.setBiome(first ? 0 : Math.floor(Math.random() * G.Tiles.NORMAL), true);
    const label = isBoss(floor) ? (isLegend(floor) ? G.T('¡Piso del legendario!') : G.T('¡Piso del jefe!')) : ROOM_NAME[room] ? G.T(ROOM_NAME[room]) : G.World.biomeName();
    G.Spawner.say(G.I18n.f('Piso {x}', floor) + ' — ' + label, 3.2, true);
    if (first) return;
    switch (room) {
      case 'treasure': G.GoldChest.spawnNow(pl, vtOf(floor)); break;
      case 'rest':
        pl.heal(pl.maxHp);
        G.FX.ring(pl.x, pl.y, 10, 90, '#5fe08a', 0.6, 4);
        G.Audio.sfx('levelup');
        break;
      case 'monster':
        setTimeout(() => { if (on && G.Game.player === pl) { G.Spawner.burst(14, vtOf(floor)); G.Spawner.burst(10, vtOf(floor)); G.Camera.kick(0.6); G.Audio.sfx('surge'); } }, 1200);
        break;
      case 'shop': setTimeout(() => { if (on && G.Game.player === pl) shop(pl); }, 900); break;
    }
  }

  /** Tienda de Kecleon: se paga con las monedas recogidas en la partida. */
  function shop(pl) {
    const low = pl.moves.filter(m => m.lvl < m.def.maxLvl).sort((a, b) => a.lvl - b.lvl)[0];
    const price = { heal: 40 + floor * 4, item: 120 + floor * 8, train: 90 + floor * 6 };
    const cards = [];
    if (pl.coins >= price.heal && pl.hp < pl.maxHp) cards.push({ id: 'heal', icon: 'heart', color: '#5fe08a', tag: price.heal + ' ₽',
      title: G.T('Baya Aranja'), desc: G.T('Recuperas toda la vida.'), apply: p => { p.coins -= price.heal; p.heal(p.maxHp); } });
    if (pl.coins >= price.item) {
      const item = G.Items.roll(pl.item), it = G.Items.BY[item];
      cards.push({ id: 'item', icon: item, color: '#ffd23f', tag: price.item + ' ₽', title: G.T(it.name), desc: G.T(it.desc),
        apply: p => { p.coins -= price.item; setTimeout(() => G.Game.offerItem(item), 0); } });
    }
    if (low && pl.coins >= price.train) cards.push({ id: 'train', icon: 'move:' + low.id, color: G.U.TYPE_COLOR[low.type], tag: price.train + ' ₽',
      title: G.T(low.name, 'move') + ' +1', desc: G.T('Sube un nivel a tu ataque más flojo.'), apply: () => { G.Moves.levelUp(low); } });
    if (!cards.length) { G.Spawner.say(G.T('Kecleon: «Vuelve cuando tengas monedas»'), 2.6, true); return; }
    cards.push({ id: 'none', icon: 'coin', color: '#8fa3c4', tag: G.I18n.f('Tienes {x} ₽', pl.coins), title: G.T('Nada, gracias'),
      desc: G.T('Guarda tus monedas para más adelante.'), apply: () => {} });
    G.Game.offerChoice('Tienda de Kecleon', '¿Te llevas algo?', cards);
  }

  function update(dt, pl) {
    if (!on || !pl || pl.dead) return;
    // Jefe del piso.
    if (isBoss(floor) && !bossId && !stairs && (bossWait -= dt) <= 0) {
      const def = nextBoss || bossFor(floor);
      nextBoss = null;
      const e = G.Spawner.spawnBossDef(def, vtOf(floor));
      if (e) {
        if (def.legend) { e.legend = true; e.ai = null; }
        bossId = e.id;
      } else bossWait = 1;
    }
    // Trampas: zonas que estallan cerca de ti todo el piso.
    if (room === 'trap' && !stairs && (trapT -= dt) <= 0) {
      trapT = Math.max(0.55, 0.95 - floor * 0.01);
      const a = Math.random() * 6.2832, d = G.U.rand(0, 200), z = G.Tiles.zoneOf(G.World.biome);
      G.Hazards.add({ kind: 'zone', x: pl.x + Math.cos(a) * d, y: pl.y + Math.sin(a) * d * 0.8, r: 48, delay: 1.0,
        dmg: 8 + floor * 1.6, type: G.ZoneBoss.type(z), color: '#ff5f6d', by: 'Trampa' });
    }
    // ¿Piso superado?
    if (!stairs) {
      const done = isBoss(floor) ? bossId && !(G.EnemyMgr.get(bossId) && !G.EnemyMgr.get(bossId).dead) : pl.kills - killsAt >= need;
      if (done) openStairs(pl);
      return;
    }
    stairs.t += dt;
    if (G.U.dist2(pl.x, pl.y, stairs.x, stairs.y) < 30 * 30 && G.Game.state === 'playing') descend(pl);
  }

  function openStairs(pl) {
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(230, 330);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (!G.World.isFree(x, y, 26)) continue;
      stairs = { x, y, t: 0 };
      break;
    }
    if (!stairs) stairs = { x: pl.x + 120, y: pl.y, t: 0 };
    G.Pickups.pullAll();                                        // la experiencia que quede, para ti
    G.Spawner.say(G.T('¡Se ha abierto la escalera!'), 2.6, true);
    G.Audio.sfx('shiny');
    G.FX.ring(stairs.x, stairs.y, 8, 80, '#ffe680', 0.7, 5);
  }

  function descend(pl) {
    // Premios del piso superado (se suman a los tickets de la partida).
    const was = floor;
    pl.t1++; reward.t1++;
    if (isBoss(was)) { pl.t10++; reward.t10++; }
    if (isLegend(was)) { pl.t10++; reward.t10++; pl.ts = (pl.ts || 0) + 1; reward.ts++; }
    cleared = was;
    G.FX.dmgText(pl.x, pl.y - pl.bodyH - 18, G.T('¡Piso superado!'), '#ffd23f', true);
    floor++;
    // Mapa nuevo: todo lo de este piso se queda atrás.
    G.EnemyMgr.clear(); G.Projectiles.clear(); G.Combat.clearFields(); G.Hazards.clear(); G.Pickups.clear(); G.Path.clear();
    G.World.reset(Math.floor(Math.random() * 1e6));
    pl.x = 0; pl.y = 0; pl.invuln = Math.max(pl.invuln || 0, 2);
    pl.heal(Math.round(pl.maxHp * 0.15));
    G.Camera.x = pl.x; G.Camera.y = pl.y;
    G.Game.flash('#000000', 0.8);
    G.Audio.sfx('biome');
    startFloor(pl, false);
  }

  /** Al acabar la partida: tu récord. → { floor, cleared, best, record, reward } */
  function finish() {
    if (!on) return null;
    on = false;
    const s = G.DB.save, best = (s && s.stats.dgBest) || 0, record = cleared > best;
    if (s && record) s.stats.dgBest = cleared;
    return { floor, cleared, best: Math.max(best, cleared), record, reward };
  }

  function drawable() {
    if (!on || !stairs) return null;
    const st = stairs;
    return {
      y: st.y - 4000,                        // en el suelo: debajo de todo
      draw(ctx) {
        const t = st.t, glow = 0.5 + Math.sin(t * 4) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.25 + glow * 0.25;
        ctx.fillStyle = '#ffe680';
        ctx.beginPath(); ctx.ellipse(st.x, st.y, 44, 18, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#1a1420';
        ctx.fillRect(st.x - 26, st.y - 18, 52, 34);
        ctx.fillStyle = '#8a7f76';
        for (let i = 0; i < 4; i++) ctx.fillRect(st.x - 24 + i * 3, st.y - 16 + i * 8, 48 - i * 6, 5);
        ctx.strokeStyle = '#d8c8a8'; ctx.lineWidth = 2;
        ctx.strokeRect(st.x - 26, st.y - 18, 52, 34);
        // Flecha que bota encima.
        const by = st.y - 44 - Math.abs(Math.sin(t * 3)) * 10;
        ctx.fillStyle = '#ffe680';
        ctx.beginPath(); ctx.moveTo(st.x - 9, by - 10); ctx.lineTo(st.x + 9, by - 10); ctx.lineTo(st.x, by); ctx.fill();
        ctx.restore();
      }
    };
  }

  /** Piso y objetivo, para la línea de debajo del reloj (hud.js). */
  function hudText(pl) {
    return G.I18n.f('PISO {x}', floor) + '  ·  ' + (stairs ? G.T('¡ESCALERA ABIERTA!')
      : isBoss(floor) ? G.T(isLegend(floor) ? 'VENCE AL LEGENDARIO' : 'VENCE AL JEFE')
      : G.I18n.f('{x}/{x} DERROTADOS', Math.min(need, pl.kills - killsAt), need));
  }

  /** Flecha a la escalera en el borde de la pantalla si no se ve. */
  function drawHud(ctx, w, h, cam, pl) {
    if (!on || !pl) return;
    ctx.save();
    if (stairs) {
      const sx = (stairs.x - cam.left()) * cam.scale, sy = (stairs.y - cam.top()) * cam.scale;
      if (sx < 20 || sy < 20 || sx > w - 20 || sy > h - 20) {
        const cx = w / 2, cy = h / 2, a = Math.atan2(sy - cy, sx - cx);
        const k = Math.min((w / 2 - 40) / Math.abs(Math.cos(a) || 1e-6), (h / 2 - 40) / Math.abs(Math.sin(a) || 1e-6));
        const ex = cx + Math.cos(a) * k, ey = cy + Math.sin(a) * k;
        ctx.translate(ex, ey);
        ctx.fillStyle = 'rgba(0,0,0,.6)';
        ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#ffe680';
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28);
        ctx.lineTo(Math.cos(a + 0.5) * 17, Math.sin(a + 0.5) * 17);
        ctx.lineTo(Math.cos(a - 0.5) * 17, Math.sin(a - 0.5) * 17);
        ctx.fill();
        ctx.font = '800 9px Pixelify, monospace';
        ctx.lineWidth = 3; ctx.strokeText(G.T('ESCALERA'), 0, 30); ctx.fillText(G.T('ESCALERA'), 0, 30);
        ctx.fillStyle = '#1a1420'; ctx.fillRect(-7, -6, 14, 11);
        ctx.fillStyle = '#d8c8a8'; for (let i = 0; i < 3; i++) ctx.fillRect(-6 + i * 2, -5 + i * 3, 12 - i * 4, 2);
      }
    }
    ctx.restore();
  }

  return {
    reset, begin, update, finish, drawable, drawHud, hudText,
    get active() { return on; }, get floor() { return floor; }, get vt() { return vtOf(floor); },
    get boss() { return isBoss(floor); },
    get stairs() { return stairs; },
    /** Menú de administrador: abre la escalera ya. */
    debugStairs() { const p = G.Game.player; if (on && p && !stairs) openStairs(p); }
  };
})();
