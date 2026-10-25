/* ============ legendrift.js — Grieta verde de legendarios (cada 15 min) ============
 * En el minuto 15, 45, 60... (en el 30 no: viene Arceus) se abre una GRIETA
 * VERDE cerca de ti. Si entras, te lleva a una arena (como las grietas
 * normales, ver rift.js) donde te esperan 3 legendarios a la vez. Cuentan como
 * legendarios vencidos (colección, logros) y sueltan lo mismo: tickets,
 * monedas y a veces un ticket ×10; al ganar te llevas también un vínculo.
 *
 * Si a esa hora hay otra grieta abierta, estás en una arena o en la Sentencia,
 * espera a que acabe. En cooperativo la abre el anfitrión.
 * (Hasta el 25-10-2026 los tres salían en el mapa, entre todos los enemigos.)
 */
G.LegendRift = (() => {
  const EVERY = 15 * 60;
  const authority = () => !G.Coop.active || G.Coop.isHost;
  let next = EVERY, retryT = 0;

  function reset() { next = EVERY; retryT = 0; }

  function update(dt, pl, time) {
    if (!authority() || time < next) return;
    if ((G.Dungeon && G.Dungeon.active) || (G.Raid && G.Raid.active)) return;
    if (G.Rift.rift || G.Rift.inArena || G.Judgment.active) return;     // espera a que acabe
    if ((retryT -= dt) > 0) return;
    if (!G.Rift.openTrio()) { retryT = 1; return; }                       // no había sitio libre: vuelve a probar
    next += EVERY;
    // En el minuto 30 llega Arceus: esa grieta no se abre.
    if (!G.Judgment.retired && next === G.Judgment.AT) next += EVERY;
    while (next <= time) next += EVERY;
  }

  function drawGround() { /* la grieta la dibuja rift.js */ }

  return { reset, update, drawGround, EVERY };
})();
