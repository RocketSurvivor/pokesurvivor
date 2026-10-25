/* ============ mode.js — modo de juego (25-10-2026) ============
 *   normal    como siempre: en el minuto 30 llega la Sentencia de Arceus y, si
 *             caes, se acaba la partida (ya no se puede seguir tras caer ante él)
 *   infinite  sin Arceus: siguen las oleadas, jefes y grietas para siempre, cada
 *             vez más fuertes (a partir del minuto 30 la dificultad sube más
 *             deprisa). Sólo en solitario. Tiene su propio ranking.
 */
G.Mode = (() => {
  let cur = 'normal';
  return {
    set(m) { cur = m === 'infinite' ? 'infinite' : 'normal'; },
    get cur() { return cur; },
    get infinite() { return cur === 'infinite'; },
    /** Lo que se multiplica a los enemigos en el Infinito a partir del minuto 30. */
    scale(t) {
      if (cur !== 'infinite' || t <= 1800) return { hp: 1, dmg: 1 };
      const x = (t - 1800) / 60;               // minutos desde el 30
      return { hp: 1 + x * 0.09, dmg: 1 + x * 0.035 };
    }
  };
})();
