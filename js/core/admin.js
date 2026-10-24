/* ============ admin.js — cuenta de administrador (para probar el juego) ============
 * La cuenta "admin" sólo se puede crear con su contraseña; la comprobación es
 * contra su huella SHA-256 (la contraseña no está en el código). Cada vez que
 * entra se le desbloquea todo en SU partida: todos los Pokémon y sus shiny,
 * todas las mejoras al máximo, monedas y tickets de sobra, Mochila y MT llenas,
 * legendarios, arenas, objetos, evoluciones de ataques y logros.
 *
 * Sólo toca la partida de esa cuenta en ese navegador (modo local, sin Firebase).
 * Para cambiar la contraseña: huella = SHA-256 de 'ps-admin:' + contraseña.
 */
G.Admin = (() => {
  const NAMES = ['admin'];
  // Otras cuentas de la nube con todo desbloqueado (por su UID de Firebase, que no se
  // puede falsificar). Los moderadores del ranking van en net/ranking.js y firestore.rules.
  const UIDS = ['iwfb9nOrIES0lq8ypnW1FmmPtGK2'];   // last
  // Títulos de perfil sólo para estas cuentas (además de los de los logros).
  // Son nombres propios: se ven igual en todos los idiomas.
  const TITLES = ['XUFARDA SUPREMA', 'MINIOCH COGOMBRO'];
  const PASS_HASH = 'ed47f635476b2b792c76724c3fac6897a681b18c784353d557325080ee0b4ecc';

  const isAdminName = name => NAMES.includes(String(name || '').trim().toLowerCase());

  async function checkPass(pass) {
    if (!(window.crypto && crypto.subtle)) return false;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ps-admin:' + (pass || '')));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('') === PASS_HASH;
  }

  /** Lo desbloquea todo en la partida `s` (se puede llamar las veces que haga falta). */
  function unlockAll(s) {
    const now = Date.now(), mark = (o, k) => { if (!o[k]) o[k] = now; };
    s.owned = s.owned || {}; s.shiny = s.shiny || {}; s.pupg = s.pupg || {};
    s.legends = s.legends || {}; s.arenas = s.arenas || {}; s.itemsFound = s.itemsFound || {};
    s.evoMoves = s.evoMoves || {}; s.ach = s.ach || {};
    for (const p of G.DEX) {
      if (!G.SPRITE_META[p.dex]) continue;
      if (!s.owned[p.dex]) s.owned[p.dex] = { at: now, from: 'admin' };
      if (!s.shiny[p.dex] && G.Sprites.hasShiny(p.dex)) s.shiny[p.dex] = { at: now, from: 'admin' };
      const up = s.pupg[p.dex] = s.pupg[p.dex] || {};
      for (const u of G.Upgrades.LIST) up[u.id] = u.max;
      if (p.leg) mark(s.legends, p.dex);
    }
    for (const t of Object.keys(G.U.TYPE_COLOR)) mark(s.arenas, t);
    for (const it of G.Items.LIST) mark(s.itemsFound, it.id);
    for (const id of Object.keys(G.Moves.EVO)) mark(s.evoMoves, id);
    for (const a of G.AchDefs.LIST) mark(s.ach, a.id);
    // Monedas y tickets de sobra (van a la libreta de este aparato al guardar).
    s.coins = Math.max(s.coins || 0, 9999999);
    s.tickets = s.tickets || { t1: 0, t10: 0 };
    s.tickets.t1 = Math.max(s.tickets.t1 || 0, 999);
    s.tickets.t10 = Math.max(s.tickets.t10 || 0, 999);
    s.tickets.ts = Math.max(s.tickets.ts || 0, 99);           // tickets shiny (gacha shiny)
    s.bag = s.bag || {}; s.tms = s.tms || {};
    for (const id of G.Shop.ORDER) s.bag[id] = 999;
    for (const id of Object.keys(G.TM_MOVES)) if (G.Moves.BY_ID[id]) s.tms[id] = 999;
    // Sin compañero aún: Pikachu, para ir directo al menú.
    if (!s.partner) { s.partner = 25; s.starter = s.starter || 25; }
    s.admin = true;
    return s;
  }

  return { NAMES, UIDS, TITLES, isAdminName, checkPass, unlockAll };
})();
