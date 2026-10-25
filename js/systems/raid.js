/* ============ raid.js — Incursiones cooperativas (25-10-2026) ============
 * En la sala de grupo, el anfitrión puede elegir "Incursión" en vez de una
 * partida normal, con su dificultad (★ Normal, ★★ Difícil, ★★★ Experto).
 *   - La partida empieza como siempre (para subir de nivel) y en el minuto 6
 *     aparece el legendario Dinamax de la semana: gigante, con muchísima vida,
 *     sus dos fases y su ataque exclusivo. Es el mismo para todos esa semana.
 *   - Hay 4 minutos para vencerlo. Si cae, premio para todos según la
 *     dificultad; si se acaba el tiempo, se escapa. En los dos casos la partida
 *     acaba ahí (y si caéis todos, también, como siempre).
 *   - Antes del minuto 6 no hay grietas, jefes de zona ni el jefe del minuto 6.
 * Lo controla el anfitrión y se lo cuenta a los demás (coop 'rd' y 'rg').
 */
G.Raid = (() => {
  const AT = 360, LIMIT = 240, GIANT = 1.6;
  const DIFF = {
    1: { name: 'Normal', stars: '★', hp: 1, dmg: 1, t10: 2, ts: 0, coins: 300 },
    2: { name: 'Difícil', stars: '★★', hp: 1.7, dmg: 1.25, t10: 4, ts: 0, coins: 600 },
    3: { name: 'Experto', stars: '★★★', hp: 2.6, dmg: 1.5, t10: 6, ts: 1, coins: 1000 }
  };
  let diff = 0, phase = null, bossId = 0, t0 = 0, endT = 0, won = false, said = false, cur = null;

  /** El legendario de la semana (uno de los que tienen ataque exclusivo). */
  function boss() {
    const id = G.Ranking.periodIds().w;
    if (cur && cur.id === id) return cur.dex;
    let h = 2166136261;
    for (const c of 'raid:' + id) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const pool = (G.Moves.SIG || []).map(s => s.who[0]).filter(d => G.DEX_BY[d] && G.SPRITE_META[d] && d !== 493);
    cur = { id, dex: pool[(h >>> 0) % pool.length] || 150 };
    return cur.dex;
  }

  /** @param coop  la configuración de la partida en grupo ({ raid: 1..3 } si es incursión) */
  function reset(coop) {
    diff = coop && DIFF[coop.raid] ? +coop.raid : 0;
    phase = diff ? 'wait' : null; bossId = 0; t0 = 0; endT = 0; won = false; said = false;
    if (diff) G.Sprites.preload([boss()], 10000);
  }

  const host = () => !G.Coop.active || G.Coop.isHost;

  function update(dt, pl, time) {
    if (!diff || !pl) return;
    if (phase === 'wait') {
      if (!said && time >= AT - 20) { said = true; G.Spawner.say(G.T('¡La incursión empieza en 20 segundos!'), 3, true); G.Audio.sfx('boss'); }
      if (host() && time >= AT && !G.Rift.inArena) spawn();
      return;
    }
    if (phase === 'fight' && host()) {
      const e = G.EnemyMgr.get(bossId);
      if (!e || e.dead) end(true);
      else if (time - t0 >= LIMIT) end(false);
      return;
    }
    if (phase === 'end' && host() && (endT -= dt) <= 0) { phase = 'done'; G.Game.finishRun(false); }
  }

  function spawn() {
    const D = DIFF[diff], dex = boss(), mon = G.DEX_BY[dex], last = G.Enemies.BOSS_SLOTS[G.Enemies.BOSS_SLOTS.length - 1];
    const def = { at: AT, dex, name: mon.name, hp: Math.round(last.hp * 1.35 * D.hp), spd: 55, dmg: Math.round(last.dmg * 1.2 * D.dmg),
                  xp: last.xp, behavior: 'chase', shotDmg: Math.round(last.dmg * 0.55 * D.dmg), shotCd: 1.1, range: 260 };
    const e = G.Spawner.spawnBossDef(def, AT);
    if (!e) return;
    e.legend = true; e.raid = true; e.ai = null;
    e.giant(GIANT);
    bossId = e.id; t0 = G.Game.st.time; phase = 'fight';
    if (G.Coop.isHost) { G.Coop.broadcast(['rg', e.id, GIANT]); G.Coop.broadcast(['rd', 'fight', t0]); }
    announce();
  }

  function announce() {
    G.Spawner.say(G.I18n.f('¡Incursión! {x} Dinamax', G.T(G.DEX_BY[boss()].name)), 3.4, true);
    G.Game.flash('#ff4a6a', 0.6);
    G.Camera.kick(1.2);
    G.Audio.sfx('legend');
  }

  function end(win) {
    phase = 'end'; won = win; endT = 4;
    if (G.Coop.isHost) G.Coop.broadcast(['rd', win ? 'won' : 'lost']);
    result(win);
  }

  /** En cada ordenador: el premio (los tickets ×10 y las monedas los manda el anfitrión con el equipo). */
  function result(win) {
    const pl = G.Game.player, D = DIFF[diff];
    if (!pl) return;
    if (win) {
      if (host()) { pl.t10 += D.t10; pl.coins += D.coins; }
      if (D.ts) pl.ts = (pl.ts || 0) + D.ts;
      G.Spawner.say(G.I18n.f('¡Incursión superada! +{x} tickets ×10', D.t10) + (D.ts ? ' · +1 ' + G.T('ticket shiny') : ''), 4, true);
      G.Audio.sfx('legend');
      G.FX.burst(pl.x, pl.y - 30, '#ffe14d', 60, 300);
    } else {
      G.Spawner.say(G.I18n.f('{x} se ha escapado…', G.T(G.DEX_BY[boss()].name)), 4, true);
      G.Audio.sfx('gameover');
    }
  }

  /** Invitado: lo que manda el anfitrión. */
  function remote(ev) {
    if (!diff) return;
    if (ev[1] === 'fight') { phase = 'fight'; t0 = +ev[2] || 0; announce(); }
    else if (ev[1] === 'won' || ev[1] === 'lost') { phase = 'end'; won = ev[1] === 'won'; result(won); }
  }

  /** Cuenta atrás (debajo del reloj) mientras dura la pelea. */
  function drawHud(ctx, w, h, time) {
    if (!diff || (phase !== 'fight' && phase !== 'wait')) return;
    const left = phase === 'fight' ? Math.max(0, LIMIT - (time - t0)) : AT - time;
    if (phase === 'wait' && left > 60) return;
    const txt = (phase === 'fight' ? G.T('INCURSIÓN') + ' ' + DIFF[diff].stars + ' · ' : G.T('LA INCURSIÓN EMPIEZA EN') + ' ') + G.U.mmss(left);
    ctx.save();
    ctx.font = '800 13px Pixelify, monospace'; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(txt, w / 2, h - 118);
    ctx.fillStyle = phase === 'fight' && left < 30 ? '#ff5f6d' : '#ffb0c4'; ctx.fillText(txt, w / 2, h - 118);
    ctx.restore();
  }

  /** Al acabar la partida. → { diff, won, dex } o null */
  function finish() {
    if (!diff) return null;
    const r = { diff, won, dex: boss(), stars: DIFF[diff].stars };
    diff = 0; phase = null;
    return r;
  }

  return { AT, LIMIT, DIFF, boss, reset, update, remote, drawHud, finish,
           get active() { return diff > 0; }, get diff() { return diff; } };
})();
