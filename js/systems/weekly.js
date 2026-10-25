/* ============ weekly.js — Desafío semanal (25-10-2026) ============
 * Cada semana (lunes a domingo, hora de Madrid, la misma que el ranking) hay un
 * desafío igual para todos: un Pokémon fijo y dos reglas raras. Se juega solo,
 * sin las Mejoras compradas ni la maestría (todos en igualdad), y tiene su
 * propio ranking de la semana (tabla s_wk<semana>, ver net/ranking.js).
 * Las partidas del desafío no cuentan para el ranking normal.
 *
 *   G.Weekly.info()   → { id, dex, mods: [{ id, name, desc }] }  el de esta semana
 *   G.Weekly.play()   empieza la partida del desafío
 *   G.Weekly.active   true mientras se juega
 */
G.Weekly = (() => {
  // Reglas: lo que cambian en los enemigos (ehp, espd, edmg, rate) y en ti (apply).
  const MODS = {
    tough:  { name: 'Enemigos duros', desc: 'Los enemigos tienen un 40 % más de vida.', ehp: 1.4 },
    fast:   { name: 'Enemigos veloces', desc: 'Los enemigos son un 25 % más rápidos.', espd: 1.25 },
    swarm:  { name: 'Enjambre', desc: 'Salen un 40 % más de enemigos.', rate: 1.4 },
    strong: { name: 'Golpes fuertes', desc: 'Los enemigos pegan un 30 % más.', edmg: 1.3 },
    glass:  { name: 'Cañón de cristal', desc: 'Pegas un 50 % más, pero tienes la mitad de vida.',
              apply: pl => { pl.atkMul *= 1.5; pl.maxHp = Math.max(1, Math.round(pl.maxHp * 0.5)); pl.hp = pl.maxHp; } },
    mono:   { name: 'Un solo tipo', desc: 'Sólo te salen ataques de su primer tipo (y los potenciadores).',
              apply: pl => {
                const t = pl.mon.types[0];
                pl.banned = pl.banned || new Set();
                for (const id of G.Moves.poolFor(pl.mon)) {
                  const m = G.Moves.BY_ID[id];
                  if (m && m.type !== t && m.kind !== 'buff') pl.banned.add(id);
                }
              } },
    // (25-10-2026, más reglas para que no se repitan tan pronto)
    lead:   { name: 'Pies de plomo', desc: 'Vas un 15 % más lento, pero pegas un 20 % más.',
              apply: pl => { pl.spdMul *= 0.85; pl.atkMul *= 1.2; } },
    regen:  { name: 'Regeneración', desc: 'Recuperas 2 de vida por segundo, pero los enemigos tienen un 20 % más de vida.', ehp: 1.2,
              apply: pl => { pl.regenFlat += 2; } },
    study:  { name: 'Aprendiz rápido', desc: 'Ganas un 50 % más de experiencia, pero los enemigos son un 15 % más rápidos.', espd: 1.15,
              apply: pl => { pl.xpMul *= 1.5; } },
    giant:  { name: 'Jefes gigantes', desc: 'Los jefes y legendarios tienen un 50 % más de vida.', bhp: 1.5 },
    rapid:  { name: 'Recarga rápida', desc: 'Tus ataques recargan un 25 % antes, pero tienes un 30 % menos de vida.',
              apply: pl => { pl.cdMul *= 0.75; pl.maxHp = Math.max(1, Math.round(pl.maxHp * 0.7)); pl.hp = pl.maxHp; } },
    magnet: { name: 'Imán gigante', desc: 'Recoges la experiencia desde el triple de lejos, pero los enemigos pegan un 20 % más.', edmg: 1.2,
              apply: pl => { pl.magnet *= 3; } },
    naked:  { name: 'Sin defensas', desc: 'Recibes un 25 % más de daño, pero ganas un 30 % más de experiencia.',
              apply: pl => { pl.dmgReduce -= 0.25; pl.xpMul *= 1.3; } }
  };
  let active = false, cur = null;

  /** Número al azar fijo para una semana. */
  function rng(seed) {
    let h = 2166136261;
    for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1e6) / 1e6; };
  }

  function info() {
    const id = G.Ranking.periodIds().w;
    if (cur && cur.id === id) return cur;
    const r = rng('weekly:' + id);
    // Pokémon con sprite, ni legendario ni mega (que todos lo puedan llevar bien).
    const pool = G.DEX.filter(p => !p.leg && !p.mega && G.SPRITE_META[p.dex]).sort((a, b) => a.dex - b.dex);
    const mon = pool[Math.floor(r() * pool.length)];
    // (Las 7 reglas nuevas entran desde la semana 44 de 2026: la 43 sigue con las suyas.)
    const OLD = ['tough', 'fast', 'swarm', 'strong', 'glass', 'mono'];
    const keys = id <= 'w2026-43' ? OLD.slice() : Object.keys(MODS);
    const a = keys.splice(Math.floor(r() * keys.length), 1)[0];
    const b = keys[Math.floor(r() * keys.length)];
    cur = { id, dex: mon.dex, mods: [a, b].map(k => Object.assign({ id: k }, MODS[k])) };
    return cur;
  }

  /** Lo que se multiplica en los enemigos (1 si no hay desafío). */
  function mult(k) {
    if (!active) return 1;
    return info().mods.reduce((v, m) => v * (m[k] || 1), 1);
  }

  function play() {
    if (G.Game.state !== 'ui' || G.Social.room) return;
    info();
    active = true;
    G.Game.startRun();
  }

  /** Lo llama game.js al crear tu Pokémon. */
  function applyPlayer(pl) { if (active) for (const m of info().mods) if (m.apply) m.apply(pl); }

  /** Al acabar: tu mejor marca de la semana y el ranking del desafío. → true si es récord tuyo. */
  function finish(mark) {
    if (!active) return false;
    active = false;
    const s = G.DB.save, w = info();
    G.Progress.event('weekly');
    let record = false;
    if (s) {
      const old = s.wk && s.wk.id === w.id ? s.wk.best || 0 : 0;
      if (mark.t > old) { s.wk = { id: w.id, best: mark.t }; record = true; }
    }
    return record;
  }

  function cancel() { active = false; }

  return { MODS, info, play, mult, applyPlayer, finish, cancel, get active() { return active; } };
})();
