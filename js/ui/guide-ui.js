/* ============ guide-ui.js — guía de novedades y consejos (25-10-2026) ============
 * - Guía: una tarjeta por cada cosa nueva (Retos → Guía). Sale sola una vez,
 *   la primera vez que entras al menú después de que llegue.
 * - Consejos: la primera vez que te pasa algo en la partida (el camino del
 *   minuto 10, un cofre dorado, la grieta verde...) sale un recuadro arriba que
 *   lo explica en una frase. Una sola vez por aparato (se guarda en el navegador).
 */
G.Guide = (() => {
  const $ = G.UI.$;
  const KEY = 'ps.guide', VER = 2;
  const ITEMS = [
    // (VER 2, 25-10-2026: lo nuevo, arriba.)
    ['dungeon', 'gchest', 'Modo Mazmorra', 'Nuevo modo al pulsar Jugar: vence a los Pokémon de cada piso y baja por la escalera. Hay salas de tesoro, descanso, tienda, trampas y casas de monstruos, un jefe cada 5 pisos y un legendario cada 10. Ganas tickets por cada piso.'],
    ['raid', 'crown', 'Incursiones', 'En la sala de grupo, el anfitrión puede elegir Incursión (★, ★★ o ★★★): en el minuto 6 sale el legendario Dinamax de la semana, gigante, y tenéis 4 minutos para vencerlo. Cuanta más dificultad, más tickets.'],
    ['daily', 'ticket', 'Premio diario', 'Cada día que entras te llevas un premio, y mejora con la racha. ¡El séptimo día seguido, un ticket shiny!'],
    ['zones', 'wfog', 'Tres zonas nuevas', 'Playa Coral (oleaje), Ciudad Neón (apagón) y Mundo Distorsión (los controles se invierten un rato; su jefe es Giratina). Cada zona trae también sus propios Pokémon salvajes.'],
    ['sig', 'star', 'Ataques exclusivos y formas', '27 legendarios tienen su ataque propio, y hay formas regionales y alternativas (y Primigenios y Origen) como Pokémon en el gacha.'],
    ['mode', 'clock', 'Modos Normal e Infinito', 'Al pulsar Jugar eliges el modo. Normal: en el minuto 30 llega la Sentencia de Arceus y, si caes, se acaba. Infinito: sin Arceus, todo sigue y se va endureciendo; tiene su propio ranking.'],
    ['green', 'shiny', 'Grieta verde', 'En el minuto 15, 45, 60... se abre una grieta verde. Dentro te esperan 3 legendarios a la vez. Si ganas: un ticket ×10 seguro, a veces un ticket shiny y un vínculo.'],
    ['path', 'up', 'Caminos del minuto 10', 'En el minuto 10 eliges un camino para toda la partida: una ventaja con su contra (más daño y menos vida, más vida y menos velocidad...).'],
    ['chest', 'gchest', 'Cofre dorado', 'A veces aparece un cofre dorado con 5 guardianes. Véncelos, quédate a su lado 2 segundos y elige: un objeto, entrenar tu ataque más flojo o un tesoro.'],
    ['biome', 'wfog', 'Sucesos y jefes de zona', 'Cada zona tiene su suceso (niebla en el bosque, derrumbes en la cueva, erupciones en el volcán, oleaje en la playa, apagón en la ciudad, gravedad al revés en el Mundo Distorsión) y su jefe con un ataque propio.'],
    ['revive', 'revive', 'Revivir', 'Algunos jefes sueltan un Revivir. Si lo llevas y caes, te levanta con la mitad de la vida. Se ve su icono junto a tu nombre.'],
    ['mastery', 'medal3', 'Maestría y talentos', 'Cuanto más juegas con un Pokémon, más rango (hasta Leyenda): +1 % de daño por rango. Cada rango pide también un reto. Con Maestro eliges un talento.'],
    ['season', 'medal3', 'Temporadas', 'Cada mes es de un tipo: sus Pokémon pegan un 10 % más. Aguanta 15 minutos con uno de ellos y te llevas un ticket shiny.'],
    ['weekly', 'clock', 'Desafío semanal', 'Cada semana, el mismo Pokémon y dos reglas raras para todos, sin tus Mejoras. Tiene su propio ranking. Está en Retos.'],
    ['auto', 'gear', 'Mejora automática', 'En la pausa puedes activar que las cartas de nivel se elijan solas, y ordenar qué prefieres (con órdenes listos y uno por Pokémon).'],
    ['movedex', 'book', 'Movedex', 'Arriba a la izquierda, en los menús: todos los ataques con su daño, recarga y área, y cuáles has usado y evolucionado.'],
    ['tm', 'tm', 'MT', 'En la Tienda Kecleon hay MT de tipo Normal siempre a la venta, para cualquier Pokémon. En la ficha del Pokémon puedes olvidar una MT (vuelve a la Mochila).']
  ];
  const TIPS = {
    path: ['Elige tu camino', 'Dura toda la partida: cada camino da una ventaja y tiene su contra.'],
    chest: ['Cofre dorado', 'Vence a sus 5 guardianes y quédate 2 segundos a su lado para abrirlo.'],
    green: ['Grieta verde', 'Entra: dentro te esperan 3 legendarios a la vez. Si ganas, ticket ×10 seguro.'],
    zoneboss: ['Jefe de zona', 'Tiene un ataque propio de la zona: esquiva las zonas que se marcan en el suelo.'],
    biome: ['Suceso de zona', 'Cada zona tiene el suyo y dura unos segundos: aguanta y sigue moviéndote.'],
    revive: ['Revivir', 'Si caes, te levanta solo con la mitad de la vida. Sólo puedes llevar uno.'],
    season: ['Temporada', 'Tu Pokémon es del tipo de la temporada: pega un 10 % más. Aguanta 15 minutos y ganas un ticket shiny.'],
    auto: ['¿Te cansa elegir cartas?', 'En la pausa puedes activar la Mejora automática y decidir qué prefieres.']
  };

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const write = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* nada */ } };

  function open() {
    G.UI.show('scr-guide', true);
    $('guide-cards').innerHTML = ITEMS.map(([, ic, t, d]) => `<div class="panel guide-card"><div class="gh">${G.Icons.html(ic, 22)}<b>${G.T(t)}</b></div><p>${G.T(d)}</p></div>`).join('');
    const o = read(); o.v = VER; write(o);
  }

  /** Sale sola una vez (al entrar al menú, si aún no la has visto). */
  function maybeShow() {
    const o = read();
    if (o.v >= VER || !G.DB.save || !G.DB.save.partner) return;
    setTimeout(() => { if (G.UI.isOpen('scr-menu')) open(); }, 900);
  }

  let tipEl = null, tipT = 0;
  /** Consejo de la primera vez. */
  function tip(id) {
    const t = TIPS[id];
    if (!t) return;
    const o = read();
    o.tips = o.tips || {};
    if (o.tips[id]) return;
    o.tips[id] = 1; write(o);
    if (tipEl) tipEl.remove();
    tipEl = document.createElement('div');
    tipEl.className = 'guide-tip';
    tipEl.innerHTML = `${G.Icons.html('book', 22)}<div><b>${G.T(t[0])}</b><small>${G.T(t[1])}</small></div>`;
    document.body.appendChild(tipEl);
    const el = tipEl;
    clearTimeout(tipT);
    tipT = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 600); }, 6500);
  }

  return { open, maybeShow, tip, ITEMS };
})();
