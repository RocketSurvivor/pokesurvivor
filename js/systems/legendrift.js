/* ============ legendrift.js — Grieta de legendarios (cada 15 min) ============
 * En el minuto 15, 45, 60... (en el 30 no: viene Arceus) se abre una grieta
 * en el mapa, cerca de ti, y salen de ella 3 legendarios a por ti, uno tras
 * otro. Pelean como los de las grietas (con todos sus ataques, ver
 * Enemy.bossInit) y cuentan como legendarios vencidos (colección, logros) y
 * sueltan lo mismo: tickets, monedas y a veces un ticket ×10.
 *
 * Si a esa hora estás dentro de una grieta normal o en la Sentencia, espera a
 * que salgas. En cooperativo la abre el anfitrión (los enemigos ya se reparten).
 */
G.LegendRift = (() => {
  const EVERY = 15 * 60, COUNT = 3, GAP = 1.4, FIRST = 1.6;
  const authority = () => !G.Coop.active || G.Coop.isHost;
  let next = EVERY, gate = null;      // { x, y, t, q: [dex], n }

  function reset() { next = EVERY; gate = null; }

  function update(dt, pl, time) {
    if (gate) tick(dt, time);
    if (!authority() || gate || time < next) return;
    if (G.Rift.inArena || G.Judgment.active) return;           // espera a que salgas
    next += EVERY;
    // En el minuto 30 llega Arceus: esa grieta no se abre.
    if (!G.Judgment.retired && next === G.Judgment.AT) next += EVERY;
    open(pl);
  }

  function open(pl) {
    const pool = G.DEX.filter(p => p.leg && p.dex !== 493 && G.SPRITE_META[p.dex]);
    const q = G.U.pickN(pool, COUNT).map(p => p.dex);
    G.Sprites.preload(q, 10000);
    let x = pl.x, y = pl.y - 180;
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(170, 230);
      const tx = pl.x + Math.cos(a) * d, ty = pl.y + Math.sin(a) * d * 0.8;
      if (G.World.isFree(tx, ty, 26)) { x = tx; y = ty; break; }
    }
    gate = { x, y, t: 0, q, n: 0, fx: 0 };
    G.Spawner.say('¡Se ha abierto una grieta! Salen 3 legendarios…', 3.4);
    G.Audio.sfx('rift');
    G.Camera.kick(0.8);
  }

  function tick(dt, time) {
    const g = gate;
    g.t += dt;
    // La grieta: anillos morados que se abren y chispas.
    if ((g.fx -= dt) <= 0) {
      g.fx = 0.22;
      G.FX.ring(g.x, g.y, 6, 70, Math.random() < 0.5 ? '#c9a6ff' : '#7e5be0', 0.5, 4);
      G.FX.burst(g.x, g.y - 10, '#c9a6ff', 6, 90);
    }
    if (authority() && g.n < g.q.length && g.t >= FIRST + g.n * GAP) spawn(g.q[g.n++], time);
    if (g.n >= g.q.length && g.t >= FIRST + g.q.length * GAP + 1.5) gate = null;
  }

  function spawn(dex, t) {
    const mon = G.DEX_BY[dex];
    if (!mon) return;
    const n = G.Game.everyone().length;
    // Como el legendario de una grieta normal (rift.js), pero son tres a la vez: el 75 % de vida cada uno.
    const def = {
      dex, name: mon.name,
      hp: Math.round((3200 + t * 9) * 1.3 * 0.75 * G.Coop.scaleHp(n) * (n > 1 ? 1.4 : 1)),
      spd: Math.round(G.U.clamp(48 + (mon.spd - 78) * 0.6, 48, 105)),
      dmg: Math.round((36 + t / 20) * 1.15), xp: Math.round(500 + t * 1.2),
      behavior: mon.types.some(x => ['psychic', 'electric', 'ghost', 'fairy', 'fire', 'water', 'ice', 'dragon'].includes(x)) ? 'ranged' : 'charger',
      shotDmg: Math.round((18 + t / 40) * 1.15), shotCd: 0.9, range: 300
    };
    const e = new G.Enemy(def, gate.x, gate.y, { hp: 1, spd: 1, dmg: 1 }, true);
    e.legend = true;
    G.EnemyMgr.add(e);
    G.FX.ring(gate.x, gate.y, 10, 160, '#c9a6ff', 0.6, 6);
    G.Spawner.say(G.I18n.f('¡{x} sale de la grieta!', G.T(e.name)), 2.4);
    G.Audio.sfx('boss');
  }

  /** La grieta abierta, para dibujarla bajo los Pokémon. */
  function drawGround(ctx) {
    if (!gate) return;
    const k = Math.min(1, gate.t / 0.6), pulse = 1 + Math.sin(gate.t * 6) * 0.06;
    ctx.save();
    ctx.globalAlpha = 0.85 * k;
    const r = 34 * k * pulse;
    const g = ctx.createRadialGradient(gate.x, gate.y, 2, gate.x, gate.y, r);
    g.addColorStop(0, '#120624'); g.addColorStop(0.6, '#3a1670'); g.addColorStop(1, 'rgba(201,166,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(gate.x, gate.y, r * 1.3, r * 0.75, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  return { reset, update, drawGround, EVERY, get open() { return !!gate; } };
})();
