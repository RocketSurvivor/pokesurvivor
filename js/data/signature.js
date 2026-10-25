/* ============ signature.js — ataques exclusivos de los legendarios (25-10-2026) ============
 * Cada uno es sólo de su legendario (y de sus formas: Primigenio, Origen, megas,
 * Kyurem Negro, Deoxys Ataque…). Empieza la partida con él, le salen sus mejoras
 * como a cualquier ataque, pero no lo aprende nadie más, no tiene MT, no se olvida
 * y no evoluciona (ya es fuerte de por sí; recarga larga).
 *
 * Usan las mismas formas de atacar que el resto (kind, ver moves.js) y, algunos,
 * un segundo golpe a la vez (`also`: otra forma, con `dmgK` del daño del ataque).
 * Con la forma especial (Primigenio, Origen, mega…) pegan un 25 % más y, si
 * disparan varios, sueltan 2 más (ver combat.js).
 *
 * Como jefes también lo usan, avisando (`boss`, ver enemy.js):
 *   beam  un rayo enorme hacia ti        fan   abanico ancho de disparos
 *   ring  anillo denso de disparos       line  zonas en línea hacia ti
 *   rain  lluvia de zonas a tu alrededor zone  una zona enorme a su alrededor
 *   dash  embestida larga
 *
 *   G.Moves.SIG            lista de ataques exclusivos
 *   G.Moves.sigFor(mon)    el exclusivo de ese Pokémon (o de su forma base) o null
 */
(() => {
  const SIG = [
    { id: 'psystrike', name: 'Onda Mental', type: 'psychic', kind: 'homing', who: [150], boss: 'ring',
      desc: 'Ondas psíquicas enormes que persiguen solas a los enemigos y los atraviesan.',
      cd: 1.3, dmg: 26, count: 4, spread: 0.3, speed: 320, life: 2.0, size: 11, homing: 5, pierce: 1,
      vis: { proj: 'ring', trail: 'wisp' } },
    { id: 'aeroblast', name: 'Aerochorro', type: 'flying', kind: 'beam', who: [249], boss: 'beam',
      desc: 'Un chorro de aire larguísimo que lo atraviesa todo y ralentiza.',
      cd: 1.4, dmg: 40, radius: 430, width: 46, slow: 0.35,
      vis: { beam: 'ring', proj: 'wind' } },
    { id: 'sacred-fire', name: 'Fuego Sagrado', type: 'fire', kind: 'cone', who: [250], boss: 'fan',
      desc: 'Llamas sagradas en abanico que atraviesan y queman a todo lo que tocan.',
      cd: 1.4, dmg: 16, count: 11, arc: 1.2, speed: 360, life: 0.62, size: 8, pierce: 2, burn: 3,
      vis: { proj: 'fire', trail: 'ember' } },
    { id: 'origin-pulse', name: 'Pulso Primigenio', type: 'water', kind: 'cone', who: [382], boss: 'fan',
      desc: 'Ondas de agua en un abanico enorme que atraviesan a los enemigos.',
      cd: 1.6, dmg: 18, count: 13, arc: 1.9, speed: 300, life: 0.95, size: 9, pierce: 3, knock: 60,
      vis: { proj: 'ring', trail: 'drip' } },
    { id: 'precipice-blades', name: 'Filo del Abismo', type: 'ground', kind: 'quake', who: [383], boss: 'line',
      desc: 'Columnas de roca brotan en una línea larga hacia donde apuntas.',
      cd: 1.6, dmg: 26, count: 9, radius: 42,
      vis: { proj: 'rock', trail: 'dirt' } },
    { id: 'dragon-ascent', name: 'Ascenso Draco', type: 'flying', kind: 'dash', who: [384], boss: 'dash',
      desc: 'Cruzas el cielo hacia el enemigo arrasando el camino y caes con una onda.',
      cd: 1.4, dmg: 40, radius: 220, width: 56, knock: 120,
      also: { kind: 'shove', dmgK: 0.4, radius: 100, knock: 260 },
      vis: { proj: 'streak' } },
    { id: 'doom-desire', name: 'Deseo Oculto', type: 'steel', kind: 'meteor', who: [385], boss: 'rain',
      desc: 'Pide un deseo: caen estrellas de acero enormes sobre los enemigos.',
      cd: 2.2, dmg: 44, count: 3, radius: 62,
      vis: { proj: 'star', trail: 'spark' } },
    { id: 'psycho-boost', name: 'Psicoataque', type: 'psychic', kind: 'nova', who: [386], boss: 'ring',
      desc: 'Una explosión psíquica que lanza disparos en todas las direcciones.',
      cd: 1.6, dmg: 22, count: 16, speed: 300, pierce: 2, life: 1.1, size: 9,
      vis: { proj: 'ring', trail: 'spark' } },
    { id: 'roar-of-time', name: 'Distorsión', type: 'dragon', kind: 'stun', who: [483], boss: 'zone',
      desc: 'Detiene el tiempo en una zona enorme: daña y deja quietos a los enemigos.',
      cd: 2.6, dmg: 50, radius: 125, stun: 1.6,
      vis: { proj: 'ring', trail: 'wisp', pal: 'steel' } },
    { id: 'spacial-rend', name: 'Corte Vacío', type: 'dragon', kind: 'beam', who: [484], boss: 'beam',
      desc: 'Rasga el espacio: un tajo que cruza toda la pantalla.',
      cd: 1.9, dmg: 54, radius: 720, width: 40,
      vis: { beam: 'shard', proj: 'crescent', pal: 'psychic' } },
    { id: 'shadow-force', name: 'Golpe Umbrío', type: 'ghost', kind: 'dash', who: [487], boss: 'dash',
      desc: 'Desapareces un instante (invulnerable) y reapareces golpeando a tu alrededor.',
      cd: 1.6, dmg: 48, radius: 200, width: 50, invuln: 0.8,
      also: { kind: 'spin', dmgK: 0.5, radius: 90, count: 2 },
      vis: { proj: 'shadow', trail: 'wisp' } },
    { id: 'dark-void', name: 'Brecha Negra', type: 'dark', kind: 'stun', who: [491], boss: 'zone',
      desc: 'Un vacío negro enorme que daña y duerme (deja quietos) a los enemigos.',
      cd: 2.8, dmg: 30, radius: 140, stun: 2.2,
      vis: { proj: 'shadow', trail: 'wisp' } },
    { id: 'seed-flare', name: 'Fulgor Semilla', type: 'grass', kind: 'shove', who: [492], boss: 'zone',
      desc: 'Una explosión de luz alrededor que aparta a los enemigos y suelta semillas.',
      cd: 1.8, dmg: 40, radius: 150, knock: 260,
      also: { kind: 'nova', dmgK: 0.35, count: 12, speed: 280, life: 1.0, size: 8, pierce: 1 },
      vis: { proj: 'leaf', trail: 'spark' } },
    { id: 'judgment', name: 'Sentencia', type: 'normal', kind: 'meteor', who: [493], boss: 'rain',
      desc: 'Una lluvia de rayos de luz cae sobre los enemigos cercanos.',
      cd: 1.8, dmg: 26, count: 5, radius: 50,
      vis: { proj: 'star', trail: 'spark' } },
    { id: 'blue-flare', name: 'Llama Azul', type: 'fire', kind: 'charge', who: [643], boss: 'beam',
      desc: 'Se carga un momento y suelta un rayo de fuego azul enorme que quema.',
      cd: 2.6, charge: 0.7, dmg: 90, radius: 330, width: 60, burn: 4,
      vis: { beam: 'fire', proj: 'fire', pal: 'water' } },
    { id: 'fusion-bolt', name: 'Rayo Fusión', type: 'electric', kind: 'dash', who: [644], boss: 'dash',
      desc: 'Te lanzas como un rayo y la descarga salta a los enemigos cercanos.',
      cd: 1.3, dmg: 38, radius: 210, width: 52, knock: 80,
      also: { kind: 'chain', dmgK: 0.5, count: 4 },
      vis: { proj: 'bolt', trail: 'spark' } },
    { id: 'glaciate', name: 'Mundo Gélido', type: 'ice', kind: 'shove', who: [646], boss: 'zone',
      desc: 'Una onda helada enorme a tu alrededor que aparta y congela (ralentiza).',
      cd: 1.8, dmg: 32, radius: 160, knock: 120, slow: 0.5,
      vis: { proj: 'shard', trail: 'wisp' } },
    { id: 'geomancy', name: 'Geocontrol', type: 'fairy', kind: 'aura', who: [716], boss: 'ring',
      desc: 'Absorbe la energía de la tierra: un aura enorme que daña y te cura.',
      cd: 0.45, dmg: 10, radius: 125, drain: 0.6,
      vis: { aura: 'star', inward: true } },
    { id: 'oblivion-wing', name: 'Ala Mortífera', type: 'flying', kind: 'cone', who: [717], boss: 'fan',
      desc: 'Un aleteo que lanza rayos oscuros que atraviesan y te curan al golpear.',
      cd: 1.3, dmg: 17, count: 9, arc: 0.7, speed: 420, life: 0.7, size: 8, pierce: 3, drain: 1,
      vis: { proj: 'crescent', trail: 'wisp', pal: 'dark' } },
    { id: 'thousand-arrows', name: 'Mil Flechas', type: 'ground', kind: 'meteor', who: [718], boss: 'rain',
      desc: 'Una lluvia de flechas de tierra cae sobre todos los enemigos cercanos.',
      cd: 1.6, dmg: 18, count: 7, radius: 38,
      vis: { proj: 'needle', trail: 'dirt' } },
    { id: 'sunsteel-strike', name: 'Meteoimpacto', type: 'steel', kind: 'dash', who: [791], boss: 'dash',
      desc: 'Te lanzas como un meteoro arrasando el camino y estallas al llegar.',
      cd: 1.4, dmg: 42, radius: 230, width: 60, knock: 120,
      also: { kind: 'shove', dmgK: 0.4, radius: 110, knock: 280 },
      vis: { proj: 'fire', trail: 'spark', pal: 'fire' } },
    { id: 'moongeist-beam', name: 'Rayo Umbrío', type: 'ghost', kind: 'beam', who: [792], boss: 'beam',
      desc: 'Un rayo de luz lunar larguísimo que suelta esquirlas de luna en todas direcciones.',
      cd: 1.4, dmg: 42, radius: 440, width: 50,
      also: { kind: 'nova', dmgK: 0.3, count: 10, speed: 260, life: 0.9, size: 7, pierce: 1 },
      vis: { beam: 'shadow', proj: 'crescent' } },
    { id: 'prismatic-laser', name: 'Láser Prisma', type: 'psychic', kind: 'charge', who: [800], boss: 'beam',
      desc: 'Concentra la luz un buen rato y suelta un láser gigantesco.',
      cd: 3.0, charge: 0.9, dmg: 120, radius: 380, width: 70,
      vis: { beam: 'star', proj: 'star', pal: 'electric' } },
    { id: 'behemoth-blade', name: 'Tajo Supremo', type: 'steel', kind: 'melee', who: [888], boss: 'zone',
      desc: 'Un espadazo enorme que corta todo a tu alrededor (360°).',
      cd: 1.0, dmg: 40, radius: 110, arc: 9, knock: 140,
      vis: { melee: 'claw' } },
    { id: 'behemoth-bash', name: 'Embate Supremo', type: 'steel', kind: 'shove', who: [889], boss: 'dash',
      desc: 'Un golpe de escudo que daña y lanza lejísimos a los enemigos.',
      cd: 1.3, dmg: 38, radius: 130, knock: 420,
      vis: { proj: 'shard', trail: 'spark' } },
    { id: 'dynamax-cannon', name: 'Cañón Dinamax', type: 'dragon', kind: 'charge', who: [890], boss: 'beam',
      desc: 'Carga energía Dinamax y suelta un cañonazo enorme.',
      cd: 2.6, charge: 0.8, dmg: 100, radius: 400, width: 64,
      vis: { beam: 'fire', proj: 'fire', pal: 'poison' } },
    { id: 'collision-course', name: 'Nitrochoque', type: 'fighting', kind: 'dash', who: [1007], boss: 'dash',
      desc: 'Una carrera brutal hacia el enemigo que acaba en una onda que aparta a todos.',
      cd: 1.3, dmg: 40, radius: 230, width: 54, knock: 100,
      also: { kind: 'shove', dmgK: 0.4, radius: 100, knock: 300 },
      vis: { proj: 'impact', trail: 'dirt' } }
  ];

  const M = G.Moves;
  const PHYS = new Set(['sacred-fire', 'precipice-blades', 'dragon-ascent', 'shadow-force', 'fusion-bolt', 'thousand-arrows',
    'sunsteel-strike', 'behemoth-blade', 'behemoth-bash', 'collision-course']);
  const SIG_OF = {};
  for (const m of SIG) {
    if ((m.kind === 'homing' || m.kind === 'projectile' || m.kind === 'bounce') && m.count == null) m.count = 1;
    m.sig = true;
    m.cat = PHYS.has(m.id) ? 'physical' : 'special';
    m.ups = M.ALL.find(x => x.kind === m.kind).ups;    // la escalera de mejoras de su forma
    m.maxLvl = m.ups.length + 1;
    M.BY_ID[m.id] = m;
    for (const d of m.who) SIG_OF[d] = m.id;
  }

  /** El exclusivo del Pokémon (las formas y megas, el de su base). */
  function sigFor(mon) {
    if (!mon) return null;
    const id = SIG_OF[G.dexNo ? G.dexNo(mon) : mon.dex] || SIG_OF[mon.dex];
    return id ? M.BY_ID[id] : null;
  }

  // Lo aprende (y sólo él): se añade a su lista de ataques.
  const poolFor = M.poolFor;
  M.poolFor = (mon, natural) => {
    const ids = poolFor(mon, natural), s = mon && sigFor(mon);
    if (s && !ids.includes(s.id)) ids.unshift(s.id);
    return ids;
  };
  // Y empieza con él.
  const startFor = M.startFor;
  M.startFor = mon => { const s = sigFor(mon); return s ? s.id : startFor(mon); };

  M.SIG = SIG;
  M.sigFor = sigFor;
})();
