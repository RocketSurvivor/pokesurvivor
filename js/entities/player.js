/* ============ player.js — el Pokémon que controlas ============
 * (x, y) son los PIES. Sólo UN movimiento está activo a la vez: se dispara
 * solo y se cambia con 1-4 / Q / E. Cada disparo reproduce la animación de
 * ataque de Mundo Misterioso que le toca (Attack, Shoot o Charge).
 */
G.Player = class Player {
  /**
   * @param mon   entrada de G.DEX
   * @param perks mejoras permanentes ya resueltas (ver data/upgrades.js)
   */
  constructor(mon, perks = {}, shiny = false) {
    this.mon = mon;
    this.dex = mon.dex;
    this.shiny = shiny && G.Sprites.hasShiny(mon.dex);
    // Los grandes, algo más pequeños y con el choque de uno normal (ver sprites.js).
    this.scale = G.Sprites.playerScale(mon.dex);
    this.anim = new G.Sprites.Animator(mon.dex, this.scale, this.shiny);
    this.x = 0; this.y = 0;
    this.r = G.Sprites.playerRadius(mon.dex);
    this.bodyH = G.Sprites.bodyHeight(mon.dex, this.scale);

    this.atkMul = perks.atkMul || 1;
    this.spdMul = perks.spdMul || 1;
    this.cdMul = perks.cdMul || 1;
    this.dmgReduce = perks.dmgReduce || 0;
    this.regenFlat = perks.regen || 0;
    this.magnet = 78 * (perks.magnetMul || 1);
    this.xpMul = perks.xpMul || 1;
    this.coinMul = perks.coinMul || 1;

    this.maxHp = mon.hp + (perks.hp || 0);
    this.hp = this.maxHp;
    this.baseSpd = mon.spd;
    this.baseAtk = mon.atk;

    this.moves = [];           // todos los movimientos aprendidos
    this.slots = [];           // huecos: cada uno, una lista de movimientos que se lanzan a la vez
    this.active = 0;           // hueco activo
    this.maxMoves = 4;         // huecos
    this.bonds = 0;            // vínculos por usar (premio de los legendarios)

    // patk / satk: Danza Espada y Danza Dragón (físico) y Maquinación (especial).
    this.buffs = {
      atk: { n: 0, t: 0, amount: 0 },
      patk: { n: 0, t: 0, amount: 0 },
      satk: { n: 0, t: 0, amount: 0 },
      spd: { n: 0, t: 0, amount: 0 },
      def: { n: 0, t: 0, amount: 0 },
      regen: { n: 0, t: 0, amount: 0 }
    };

    this.level = 1;
    this.xp = 0;
    this.xpNext = Player.xpFor(1);
    this.kills = 0;
    this.bosses = 0;
    this.rerolls = 0;          // veces que ha cambiado las cartas de nivel en esta run
    this.rerollBonus = perks.rerolls || 0;   // cambios comprados en Mejoras (más el gratis)
    this.critChance = perks.crit || 0;       // probabilidad de golpe crítico (Mejoras)
    this.extraProj = perks.proj || 0;        // Mejoras → Ráfaga: proyectiles de más
    this.areaMul = perks.areaMul || 1;       // Mejoras → Amplitud: × al área
    this.banned = new Set();                 // movimientos vetados (Mejoras → Veto): no salen en las cartas
    this.bind = {};                          // movimiento -> hueco fijo (0-3), elegido en Mejoras
    this.coins = 0;            // monedas recogidas en esta run
    this.t1 = 0; this.t10 = 0; // tickets del gacha recogidos en esta run
    this.dmgDealt = 0;

    this.invuln = 0;
    this.flash = 0;
    this.aim = Math.PI / 2;
    this.moveAngle = Math.PI / 2;
    this.walking = false;
    this.inLiquid = false;
    this.lavaTick = 0;
    this.attackFace = 0;       // tiempo que sigue mirando al objetivo tras atacar
    this.dead = false;
    this.power = null;         // poder de altar activo: { def, t, dur }
    this.slowT = 0;            // pegado por una trampa
    this.item = null;          // objeto equipado (data/items.js), uno por run
    this.sashT = -999;         // última vez que salvó la Banda Focus
    this.bellHeal = 0;         // curación pendiente del Cascabel Concha
    this.statsTaken = {};      // mejoras de stat cogidas (condición de evolución)
    this.abil = null;          // efecto de su habilidad (data/ability-fx.js), lo pone game.js
    this.sturdyAt = -999;      // última vez que le salvó Robustez
    // Evolución en la partida (ver evoLevel): el Pokémon con el que empezaste
    // (mejoras, ranking, "más usados") y cuántas veces ha evolucionado.
    this.startDex = mon.dex;
    this.evoN = 0;
    this.evoLeft = Player.evoDepth(mon.dex);
    this.isMega = !!mon.mega;     // ya megaevolucionado (o empezaste con una mega)
    this.evoFx = null;            // animación de la esfera (ver startEvo)
  }

  /*
   * Mejoras Ráfaga y Amplitud: se aplican al aprender el ataque (las mejoras de
   * nivel y la evolución del ataque multiplican y suman encima, como siempre).
   *   Ráfaga: +1 proyectil por nivel (+2 en los que ya sueltan muchos: abanico y anillo).
   *   Amplitud: × al radio de golpes cuerpo a cuerpo, auras, zonas, meteoros, minas...
   *             y al grosor de rayos (Hiperrayo, Hidrobomba...) y embestidas.
   */
  static applyPerks(m, proj, area) {
    if (proj > 0 && Player.PROJ_KINDS.has(m.kind)) {
      m.count = (m.count || 1) + proj * (m.kind === 'nova' || m.kind === 'cone' ? 2 : 1);
      if (m.spread != null && (m.kind === 'projectile' || m.kind === 'homing' || m.kind === 'bounce')) m.spread = Math.max(m.spread, 0.12) * (1 + proj * 0.6);
    }
    if (area > 1 && Player.AREA_KINDS.has(m.kind) && m.radius) m.radius *= area;
    // Rayos (Hiperrayo, Hidrobomba...) y embestidas: más grosor.
    if (area > 1 && Player.WIDTH_KINDS.has(m.kind) && m.width) m.width *= area;
  }
  static get PROJ_KINDS() { return new Set(['projectile', 'homing', 'bounce', 'boomerang', 'cone', 'nova']); }
  static get WIDTH_KINDS() { return new Set(['beam', 'charge', 'dash']); }
  static get AREA_KINDS() { return new Set(['melee', 'aura', 'meteor', 'mine', 'stun', 'quake', 'vortex', 'shove', 'spin', 'trail']); }

  // ---------------- evolución durante la partida ----------------
  /*
   * Si empiezas con un Pokémon que no es su última forma, evoluciona al subir
   * de nivel (como en los juegos, pero aquí siempre por nivel):
   *   - le quedan 2 evoluciones (Charmander): a los niveles 7 y 16
   *   - le queda 1 (Charmeleon, Pikachu...): al nivel 10
   * Cada evolución da CRECIMIENTO para el resto de la partida: +12 % de daño y
   * +10 % de vida máxima (y te cura del todo). Así, quien empieza débil acaba
   * más fuerte que si hubiera cogido directamente la última forma (+25 % de
   * daño y +21 % de vida con dos evoluciones).
   */
  /** Cuántas evoluciones le quedan como mucho (0, 1 o 2). */
  static evoDepth(dex, n = 0) {
    const next = (G.EVOS && G.EVOS[dex]) || [];
    if (!next.length || n > 3) return 0;
    return 1 + Math.max(...next.map(d => Player.evoDepth(d, n + 1)));
  }
  static get GROW_ATK() { return 1.12; }
  static get GROW_HP() { return 0.10; }
  /** Nivel al que toca la siguiente evolución, o 0 si ya no le quedan. */
  evoLevel() {
    const left = this.evoLeft - this.evoN;
    if (left <= 0 || !(G.EVOS && G.EVOS[this.dex] && G.EVOS[this.dex].length)) return 0;
    return this.evoLeft >= 2 ? [7, 16][this.evoN] || 0 : [10][this.evoN] || 0;
  }
  /** En qué puede evolucionar ahora. */
  evoOptions() { return ((G.EVOS && G.EVOS[this.dex]) || []).filter(d => G.DEX_BY[d] && G.SPRITE_META[d]); }

  /*
   * Megaevolución en la partida: cuando ya no le quedan evoluciones normales y
   * su forma tiene mega (data/megas.js), megaevoluciona al nivel MEGA_LV. Da
   * las estadísticas de la mega (no da Crecimiento: ya es un salto grande).
   */
  static get MEGA_LV() { return 24; }
  /** Los legendarios (Mewtwo, Rayquaza, Latias...) megaevolucionan más tarde. */
  static get MEGA_LV_LEG() { return 40; }
  megaOptions() {
    if (this.isMega) return [];
    return (G.MEGAS || []).filter(m => m.base === this.dex && G.SPRITE_META[m.dex]).map(m => m.dex);
  }
  /** Lo siguiente que le toca: { lv, opts } (lv 0 = nada). */
  nextEvo() {
    const lv = this.evoLevel();
    if (lv) return { lv, opts: this.evoOptions() };
    const megas = this.megaOptions();
    const leg = G.DEX_BY[this.dex] && G.DEX_BY[this.dex].leg;
    return megas.length ? { lv: leg ? Player.MEGA_LV_LEG : Player.MEGA_LV, opts: megas } : { lv: 0, opts: [] };
  }

  /** Cambia el aspecto y el Pokémon (también la copia de un compañero en cooperativo). */
  morph(dex) {
    const base = G.DEX_BY[dex];
    if (!base) return false;
    // La naturaleza es la del Pokémon con el que empezaste (ver G.Mons.monFor).
    const n = G.Mons.natureOf(this.startDex || this.dex), m = Object.assign({}, base);
    if (n.up) m[n.up] = base[n.up] * 1.1;
    if (n.down) m[n.down] = base[n.down] * 0.9;
    m.atk = Math.max(m.pa, m.sa);
    m.nature = n.id;
    m.tmDex = this.startDex || this.dex;          // las MT aprendidas son las de tu Pokémon
    const old = this.mon;
    this.mon = m;
    this.dex = dex;
    this.shiny = this.shiny && G.Sprites.hasShiny(dex);
    this.scale = G.Sprites.playerScale(dex);
    this.anim = new G.Sprites.Animator(dex, this.scale, this.shiny);
    this.r = G.Sprites.playerRadius(dex);
    this.bodyH = G.Sprites.bodyHeight(dex, this.scale);
    G.Sprites.preload([dex], 8000, this.shiny);
    return old;
  }

  /** Evoluciona (tu Pokémon): stats de la nueva forma y Crecimiento (las megas, sin Crecimiento). */
  evolveTo(dex) {
    const mega = !!(G.DEX_BY[dex] && G.DEX_BY[dex].mega);
    const old = this.morph(dex);
    if (!old) return false;
    const m = this.mon;
    this.maxHp += m.hp - old.hp;
    this.baseSpd += m.spd - old.spd;
    this.baseAtk += m.atk - old.atk;
    if (mega) { this.isMega = true; if (!this.remote) G.Progress.event('mega'); }
    else {
      this.evoN++;
      this.atkMul *= Player.GROW_ATK;
      this.maxHp = Math.round(this.maxHp * (1 + Player.GROW_HP));
    }
    this.hp = this.maxHp;
    this.invuln = Math.max(this.invuln, 1.5);
    return true;
  }

  /** Pone la habilidad (G.AbilityFX.of) y aplica lo que hace al empezar. */
  setAbility(id) {
    this.abilId = id || '';
    this.abil = G.AbilityFX.of(id, this.mon);
    if (this.abil.cdMul) this.cdMul *= this.abil.cdMul;
    if (this.abil.start) this.abil.start(this);
  }

  /** Segundos que hay que estar junto a un compañero caído para levantarlo. */
  static get REVIVE_TIME() { return 3; }

  // (×2 y luego ×4 el 2026-10-10: se subía de nivel demasiado rápido.)
  static xpFor(level) {
    return Math.floor((8 + level * 6 + Math.pow(level, 1.75) * 1.6) * 4);
  }

  cy() { return this.y; }

  // ---------------- stats efectivos ----------------
  get atk() { return this.baseAtk * this.atkMul * (1 + this.buffs.atk.n * this.buffs.atk.amount); }
  /**
   * Ataque con un movimiento: el físico o el especial de tu Pokémon (ver
   * G.Stats), con las danzas que sean de su lado (las de mejora, sin ninguna).
   */
  atkFor(m) {
    const cat = m && m.cat, b = cat === 'physical' ? this.buffs.patk : cat === 'special' ? this.buffs.satk : null;
    return this.atk * G.Stats.fit(this.mon, cat) * (b ? 1 + b.n * b.amount : 1) * (m && this.monoType(m.type) ? Player.MONO_K : 1) * this.metroK();
  }
  /** Metrónomo (objeto): +6 % cada 4 s seguidos con el mismo hueco activo, hasta +36 %. */
  metroK() { return this.hasItem('metronome') ? 1 + Math.min(6, Math.floor((this._metroT || 0) / 4)) * 0.06 : 1; }
  static get METRO_MAX() { return 1.36 - 1e-9; }
  /** Cargas del Metrónomo (0-6), para el HUD. */
  metroStacks() { return this.hasItem('metronome') ? Math.min(6, Math.floor((this._metroT || 0) / 4)) : 0; }
  /** Monotipo (19-10-2026): los de un solo tipo pegan un +20 % con los ataques de su tipo (tienen menos variedad). */
  static get MONO_K() { return 1.2; }
  monoType(type) { return this.mon.types.length === 1 && type === this.mon.types[0]; }
  get spd() {
    // (Habilidades: "steady" no se frena; speed() multiplica, ver data/ability-fx.js.)
    const ab = this.abil || {}, stuck = this.slowT > 0 && !ab.steady;
    const s = this.baseSpd * this.spdMul * (1 + this.buffs.spd.n * this.buffs.spd.amount) * (stuck ? 0.5 : 1) * (ab.speed ? ab.speed(this) : 1);
    const w = G.Weather.speedFor(this.mon.types);
    const slow = this.inLiquid && !ab.steady && !this.hasItem('airballoon') ? G.World.liquidEffect(this.mon.types).slow || 1 : 1;
    return G.Judgment && G.Judgment.active ? G.Judgment.capSpd(s * slow * w) : s * slow * w;
  }
  get reduction() { return Math.min(0.8, this.dmgReduce + this.buffs.def.n * this.buffs.def.amount); }
  get regen() { return this.regenFlat + this.buffs.regen.n * this.buffs.regen.amount; }

  // ---------------- movimientos ----------------
  addMove(id) {
    if (this.slots.length >= this.maxMoves || this.hasMove(id)) return false;
    const m = G.Moves.instance(id, 1);
    m.since = G.Game.st.time;          // desde cuándo lo tienes (daño por segundo en el resumen)
    Player.applyPerks(m, this.extraProj, this.areaMul);
    this.moves.push(m);
    const group = [m];
    this.slots.push(group);
    this.arrange();
    // Te quedas con el que llevabas (18-10-2026: antes se cambiaba solo al nuevo
    // y te quitaba el ataque que estabas usando). Sólo si no tenías ninguno, el nuevo.
    if (!this.slots[this.active]) this.active = this.slots.indexOf(group);
    return true;
  }

  /**
   * Huecos fijos (Mejoras → Atajos): cada movimiento con hueco elegido se pone
   * en ese número para la memoria muscular (Confusión siempre en el 1...).
   * Mientras no tengas tantos movimientos, va al más cercano; los demás
   * rellenan los huecos libres en el orden en que los aprendiste.
   */
  arrange() {
    const n = this.slots.length;
    if (n < 2 || !this.bind) return;
    const want = g => { let k = Infinity; for (const m of g) if (this.bind[m.id] != null) k = Math.min(k, this.bind[m.id]); return k; };
    const cur = this.slots[this.active];
    const out = new Array(n).fill(null);
    const bound = this.slots.filter(g => want(g) < Infinity).sort((a, b) => want(a) - want(b));
    for (const g of bound) {
      let p = Math.min(want(g), n - 1);
      while (p >= 0 && out[p]) p--;                          // ocupado: el de antes
      if (p < 0) { p = 0; while (out[p]) p++; }              // o el primero libre
      out[p] = g;
    }
    for (const g of this.slots) if (!out.includes(g)) out[out.indexOf(null)] = g;
    this.slots = out;
    if (cur) this.active = out.indexOf(cur);
  }

  hasMove(id) { return this.moves.some(m => m.id === id); }

  setActive(i) {
    if (i < 0 || i >= this.slots.length || i === this.active) return;
    // Cinta Elección: no se puede cambiar de movimiento.
    if (this.hasItem('choiceband') && this.slots[this.active]) {
      G.FX.dmgText(this.x, this.y - this.bodyH - 8, 'Cinta Elección', '#ff8ad8');
      return;
    }
    this.active = i;
    this._metroT = 0;
    G.Projectiles.clearOrbs(this);
    G.Audio.sfx('select');
    for (const m of this.slots[i]) m.t = Math.min(m.t, m.cd * 0.35);
    const m = this.slots[i][0];
    G.FX.ring(this.x, this.y - G.LIFT * 0.5, 6, this.r * 3.4, G.U.TYPE_COLOR[m.type], 0.3, 3);
  }

  cycle(dir) {
    if (!this.slots.length) return;
    this.setActive((this.active + dir + this.slots.length) % this.slots.length);
  }

  // ---------------- vínculos (fusiones) ----------------
  // Cada legendario vencido da un vínculo. Con él se juntan movimientos en un
  // solo hueco y se lanzan a la vez. Sólo crece un grupo (hasta BOND_MAX); si
  // no hay ninguno a medias, el vínculo une dos movimientos sueltos.
  static get BOND_MAX() { return 4; }

  /** Lo que se puede hacer ahora con un vínculo: añadir a un grupo o unir dos sueltos. */
  bondOptions() {
    const loose = this.slots.filter(s => s.length === 1).map(s => s[0]);
    const grow = this.slots.find(s => s.length > 1 && s.length < Player.BOND_MAX);
    if (grow) return loose.length ? { mode: 'add', group: grow, loose } : null;
    return loose.length >= 2 ? { mode: 'pair', group: null, loose } : null;
  }

  /** Junta `moves` (sueltos) en el grupo `group` (o en uno nuevo) y gasta un vínculo. */
  fuse(moves, group = null) {
    const target = group || this.slots.find(s => s[0] === moves[0]);
    const cur = this.slots[this.active];
    for (const m of moves) {
      if (target.includes(m)) continue;
      const i = this.slots.findIndex(s => s.length === 1 && s[0] === m);
      if (i < 0) continue;
      this.slots.splice(i, 1);
      target.push(m);
    }
    this.arrange();
    // Se pasa al grupo, salvo con la Cinta Elección (sigues en el hueco que tenías, si queda).
    const a = this.slots.indexOf(cur);
    this.active = this.hasItem('choiceband') && a >= 0 ? a : this.slots.indexOf(target);
    this.bonds = Math.max(0, this.bonds - 1);
    G.Projectiles.clearOrbs(this);
    return target;
  }

  /** Movimientos que se lanzan ahora (el grupo del hueco activo). */
  activeGroup() { return this.slots[this.active] || []; }

  activeMove() { return this.activeGroup()[0]; }

  /**
   * Lo llama combat.js al lanzar un movimiento. Elige la animación de PMD y la
   * acelera si la recarga es más corta que la animación, para que encadene.
   */
  cast(m) {
    // Vidasfera: cada ataque cuesta un poco de vida (nunca te deja KO).
    if (this.hasItem('lifeorb') && m.kind !== 'orbit' && m.kind !== 'trail' && !this.remote) {
      this.hp = Math.max(1, this.hp - Math.max(1, this.maxHp * 0.01));
    }
    const anim = { melee: 'Attack', beam: 'Shoot', projectile: 'Shoot', nova: 'Attack',
                   aura: 'Charge', buff: 'Charge', orbit: 'Charge', boomerang: 'Shoot', chain: 'Shoot',
                   mine: 'Charge', meteor: 'Charge', turret: 'Charge', dash: 'Attack', trail: 'Walk', cone: 'Shoot' }[m.kind] || 'Attack';
    // Las familias nuevas suenan como la parecida de las de siempre.
    const SND = { boomerang: 'projectile', chain: 'beam', mine: 'nova', meteor: 'nova', turret: 'buff', dash: 'melee', trail: 'aura', cone: 'projectile' };
    // El rastro no suena a cada charco (sería un zumbido constante).
    if (m.kind !== 'trail') G.Audio.sfx('shot', { kind: SND[m.kind] || m.kind, type: m.type });
    if (m.kind === 'trail') return;
    // No reinicies una animación que va por la mitad: se vería a tirones.
    if (this.anim.busy() && this.anim.progress() < 0.65) return;
    const meta = G.Sprites.animMeta(this.dex, anim);
    const len = meta ? meta.d.reduce((a, b) => a + b, 0) / 60 : 0.4;
    const cd = Math.max(0.12, m.cd * this.cdMul);
    this.anim.play(anim, { speed: Math.max(1, len / (cd * 0.9)) });
    this.attackFace = 0.35;
  }

  // ---------------- daño y curación ----------------
  /**
   * @param type  tipo del ataque (tabla de tipos y clima); sin tipo, daño tal cual
   * @param pure  daño que no baja con la defensa ni el cuerpo a cuerpo (Arceus)
   */
  /** @param cat  'physical' | 'special': con qué defensa tuya se para (la del enemigo que pega). */
  hurt(amount, type = null, pure = false, cat = null) {
    if (this.god) return;               // invencible (menú de administrador)
    if (this.invuln > 0 || this.dead) return;
    // Habilidad (data/ability-fx.js): absorber un tipo, esquivar o recibir menos.
    const ab = this.abil, cls = cat === 'physical' ? 'p' : cat === 'special' ? 's' : '';
    if (ab && !pure) {
      if (type && ab.absorb === type) {
        this.invuln = 0.3;
        this.heal(this.maxHp * 0.03);
        return;
      }
      if (ab.dodge && Math.random() < ab.dodge(this, type, cls)) {
        this.invuln = 0.3;
        G.FX.dmgText(this.x, this.y - this.bodyH - 4, '¡Esquiva!', '#bfe8ff');
        return;
      }
      if (ab.inMul) amount *= ab.inMul(this, type, cls);
    }
    if (!pure) amount *= G.Stats.taken(this.mon, cat);
    let eff = null;
    if (type) {
      const k = G.Types.mult(type, this.mon.types);
      eff = G.Types.label(k);
      amount *= k * G.Weather.mult(type);
    }
    // Con un ataque cuerpo a cuerpo activo se recibe un 25 % menos: hay que
    // estar encima de los enemigos para pegar (iban muy por detrás).
    const close = this.activeGroup().some(m => m.kind === 'melee') ? 0.75 : 1;
    const d = pure ? Math.max(1, amount) : Math.max(1, amount * (1 - this.reduction) * close);
    this.hp -= d;
    // Quién te ha quitado la vida, para el resumen del final (ver run-ui.js showOver).
    const by = this.hitBy || 'Otros';
    this.hitBy = null;
    (this.taken = this.taken || {})[by] = (this.taken[by] || 0) + Math.min(d, Math.max(0, this.hp + d));
    this.invuln = 0.45;
    this.flash = 0.14;
    G.Audio.sfx('hurt');
    G.Camera.kick(0.28);
    if (!this.remote) G.Pad.rumble(0.25 + Math.min(0.75, d / this.maxHp * 3), 140);
    G.FX.dmgText(this.x, this.y - this.bodyH - 4, '-' + Math.round(d), eff === 'super' ? '#ff3048' : eff === 'weak' ? '#c9a0a8' : '#ff6b7a', eff === 'super');
    G.FX.burst(this.x, this.y - this.bodyH * 0.5, '#ff5f6d', 6, 90);
    // Banda Focus: aguanta el golpe con 1 de vida (una vez cada 60 s).
    if (this.hp <= 0 && this.hasItem('focussash') && performance.now() - this.sashT > 60000) {
      this.sashT = performance.now();
      this.hp = 1; this.invuln = 1.2;
      G.FX.dmgText(this.x, this.y - this.bodyH - 16, '¡Banda Focus!', '#ff9a3d', true);
      G.FX.ring(this.x, this.y, 6, 70, '#ff9a3d', 0.5, 4);
    }
    // Robustez (habilidad): lo mismo, una vez cada 90 s.
    if (this.hp <= 0 && ab && ab.sturdy && performance.now() - this.sturdyAt > 90000) {
      this.sturdyAt = performance.now();
      this.hp = 1; this.invuln = 1.2;
      G.FX.dmgText(this.x, this.y - this.bodyH - 16, '¡Robustez!', '#c9b48a', true);
      G.FX.ring(this.x, this.y, 6, 70, '#c9b48a', 0.5, 4);
    }
    if (ab && ab.hurt && this.hp > 0) ab.hurt(this, type, cls);
    if (this.hp <= 0) {
      this.hp = 0; this.dead = true;
      this.anim.play('Faint', { hold: true });
      G.Projectiles.clearOrbs(this);
      this.reviveT = 0;
    }
  }

  heal(amount) {
    if (this.abil && this.abil.healMul) amount *= this.abil.healMul;     // Gula, Recogida
    if (this.hasItem('bigroot')) amount *= 1.5;                          // Raíz Grande (objeto)
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const got = Math.round(this.hp - before);
    if (got >= 1) G.FX.dmgText(this.x, this.y - this.bodyH - 6, '+' + got, '#5fe08a');
  }

  addMaxHp(amount) { this.maxHp += amount; this.hp += amount; }

  /** Devuelve cuántos niveles ha subido (pueden ser varios de golpe). */
  gainXp(amount) {
    const add = amount * this.xpMul;
    if (!Number.isFinite(add) || add <= 0) return 0;     // una experiencia infinita no acababa nunca de subir niveles
    this.xp += add;
    let leveled = 0;
    while (this.xp >= this.xpNext && leveled < 50) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = Player.xpFor(this.level);
      leveled++;
    }
    return leveled;
  }

  // ---------------- objeto equipado ----------------
  hasItem(id) { return this.item === id; }

  /** Se pone un objeto (y se quita el que llevara). */
  equip(id) {
    if (this.item) G.Items.BY[this.item].off(this);
    this.item = id;
    if (id) G.Items.BY[id].on(this);
  }

  /** Cascabel Concha: un poco de vida por el daño que haces (tope 4/s). */
  onDealt(dmg) {
    if (this.item === 'shellbell') this.bellHeal = Math.min(4, this.bellHeal + dmg * 0.04);
  }

  /** Poder de un altar (ver systems/interact.js): se aplica y se quita solo. */
  addPower(def, dur) {
    if (this.power) this.power.def.off(this);
    def.on(this);
    this.power = { def, t: dur, dur };
  }

  addBuff(stat, amount, dur, maxStacks) {
    const b = this.buffs[stat];
    if (!b) return;
    b.amount = amount;
    b.n = Math.min(maxStacks, b.n + 1);
    b.t = dur;
  }

  // ---------------- ciclo ----------------
  /*
   * Animación de evolución: una esfera de luz te envuelve (0-0,35 s), late
   * (hasta 0,8 s), cambias de forma dentro y estalla dejándote ver (hasta 1,25 s).
   * Mientras dura no te pueden dañar. `done(nombreAnterior)` se llama al cambiar.
   */
  startEvo(dex, done) {
    if (this.evoFx) return false;
    this.evoFx = { t: 0, dex, done, swapped: false, mega: !!(G.DEX_BY[dex] && G.DEX_BY[dex].mega) };
    this.invuln = Math.max(this.invuln, 1.4);
    G.Audio.sfx('heal');
    return true;
  }
  static get EVO_SWAP() { return 0.8; }
  static get EVO_END() { return 1.25; }
  evoTick(dt) {
    const f = this.evoFx;
    if (!f) return;
    f.t += dt;
    this.invuln = Math.max(this.invuln, 0.2);
    if (!f.swapped && f.t >= Player.EVO_SWAP) {
      f.swapped = true;
      const from = this.mon.name;
      if (this.evolveTo(f.dex) && f.done) f.done(from);
      G.FX.ring(this.x, this.y - this.bodyH * 0.5, 10, this.r * 7, f.mega ? '#ff7ad8' : '#ffffff', 0.5, 6);
      G.FX.burst(this.x, this.y - this.bodyH * 0.5, f.mega ? '#ffb0f0' : '#fff3c8', 46, 300);
    }
    if (f.t >= Player.EVO_END) this.evoFx = null;
  }
  /** La esfera (encima del sprite). */
  drawEvo(ctx) {
    const f = this.evoFx;
    if (!f) return;
    const cx = this.x, cy = this.y - this.bodyH * 0.5;
    const R = Math.max(this.r * 2.6, this.bodyH * 0.85, 26);
    const t = f.t, grow = Math.min(1, t / 0.35), ease = 1 - Math.pow(1 - grow, 3);
    let rad = R * ease, a = 0.95 * ease;
    if (t >= Player.EVO_SWAP) {                       // estalla
      const k = Math.min(1, (t - Player.EVO_SWAP) / (Player.EVO_END - Player.EVO_SWAP));
      rad = R * (1 + k * 0.7); a = 0.95 * (1 - k);
    } else if (t > 0.35) rad *= 1 + Math.sin(t * 28) * 0.04;   // late
    const tint = f.mega ? ['255,240,252', '255,122,216'] : ['255,255,255', '160,210,255'];
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    const g = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.1, cx, cy, rad);
    g.addColorStop(0, `rgba(${tint[0]},1)`);
    g.addColorStop(0.7, `rgba(${tint[0]},0.95)`);
    g.addColorStop(1, `rgba(${tint[1]},0.75)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${tint[1]},1)`; ctx.stroke();
    ctx.restore();
    if (t < Player.EVO_SWAP && Math.random() < 0.6) {
      const ang = Math.random() * 6.2832;
      G.FX.px(cx + Math.cos(ang) * rad * 1.2, cy + Math.sin(ang) * rad * 1.2, f.mega ? '#ff9ae6' : '#cfe8ff', { vx: -Math.cos(ang) * 60, vy: -Math.sin(ang) * 60, life: 0.4 });
    }
  }

  update(dt) {
    this.anim.update(dt);
    if (this.dead) return;
    this.evoTick(dt);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.attackFace > 0) this.attackFace -= dt;

    for (const k in this.buffs) {
      const b = this.buffs[k];
      if (b.n > 0) { b.t -= dt; if (b.t <= 0) b.n = 0; }
    }
    if (this.slowT > 0) this.slowT -= dt;
    if (this.bellHeal > 0) { const h = Math.min(this.bellHeal, 4 * dt); this.hp = Math.min(this.maxHp, this.hp + h); this.bellHeal -= h; }
    if (this.power && (this.power.t -= dt) <= 0) { this.power.def.off(this); this.power = null; }
    if (this.regen > 0) this.hp = Math.min(this.maxHp, this.hp + this.regen * dt * (this.hasItem('bigroot') ? 1.5 : 1));
    if (this.hasItem('metronome')) {
      this._metroT = (this._metroT || 0) + dt;
      // Al llegar al máximo, un aviso; mientras dure, un aura que lo deja ver.
      const max = this.metroK() >= Player.METRO_MAX;
      if (max && !this._metroMax) {
        G.FX.dmgText(this.x, this.y - this.bodyH - 16, G.T('¡Metrónomo al máximo!'), '#ff9a3d', true);
        G.FX.ring(this.x, this.y, 8, 90, '#ff9a3d', 0.5, 5);
        G.Audio.sfx('select');
      }
      if (max && (this._metroAura = (this._metroAura || 0) - dt) <= 0) {
        this._metroAura = 0.9;
        G.FX.ring(this.x, this.y - this.bodyH * 0.4, this.r * 1.6, this.r * 3.2, '#ff9a3d', 0.45, 3);
      }
      this._metroMax = max;
    } else this._metroMax = false;
    if (this.abil && this.abil.tick) this.abil.tick(this, dt);
    // Sequía, Llovizna...: su clima al empezar y cada 3 min, si no hay otro (en
    // grupo lo pone el anfitrión, que es quien manda el clima a todos).
    if (this.abil && this.abil.summon && (!G.Coop.active || G.Coop.isHost) && (this.sumT = (this.sumT || 0) - dt) <= 0) {
      this.sumT = 180;
      if (!G.Weather.current) G.Weather.debugStart(this.abil.summon, 60);
    }

    // --- movimiento con colisiones ---
    // (En cooperativo la pausa no para el juego: sólo te quedas quieto.)
    const [ax, ay] = this.frozen ? [0, 0] : G.Input.axis();
    this.walking = ax !== 0 || ay !== 0;
    const s = this.spd;
    // Hielo: resbalas (la velocidad cambia despacio).
    const slide = this.inLiquid && G.World.liquidEffect(this.mon.types).slide;
    this.svx = slide ? G.U.damp(this.svx || 0, ax * s * 1.15, 1.6, dt) : ax * s;
    this.svy = slide ? G.U.damp(this.svy || 0, ay * s * 1.15, 1.6, dt) : ay * s;
    this.x += this.svx * dt;
    this.y += this.svy * dt;
    G.World.collide(this);
    if (this.walking) this.moveAngle = Math.atan2(ay, ax);

    // --- terreno líquido ---
    // (Levitación: flota por encima del agua y la lava.)
    this.inLiquid = !(this.abil && this.abil.levitate) && G.World.isLiquid(this.x, this.y);
    if (this.inLiquid) {
      const le = G.World.liquidEffect(this.mon.types);
      if (le.dmg && !(this.abil && this.abil.lavaProof)) {
        this.lavaTick -= dt;
        if (this.lavaTick <= 0) {
          this.lavaTick = le.every; this.invuln = 0;
          this.hurt(Math.max(le.flat, this.maxHp * le.dmg * 0.5));
          G.FX.burst(this.x, this.y - 4, le.color, 5, 70);
        }
      } else if (this.walking && Math.random() < dt * 8) {
        G.FX.burst(this.x, this.y, le.slide ? '#ffffff' : '#b3defa', 2, 40);
      }
    }

    // --- apuntado: enemigo más cercano; si no hay, hacia donde caminas ---
    // Prioridad de blanco según el ataque activo:
    //   a distancia (proyectil, rayo): el jefe si está a tiro > lo que te toca > el más cercano
    //   cuerpo a cuerpo y el resto:   lo que te toca > el jefe > el más cercano
    // Con una horda encima casi siempre te toca algo; si eso ganara siempre,
    // los ataques a distancia no le darían nunca al jefe.
    // Sin enemigos, apunta a la roca o cofre más cercano.
    const all = G.EnemyMgr.all();
    const m = this.activeMove();
    const ranged = !!m && (m.kind === 'projectile' || m.kind === 'beam');
    const threat = G.Projectiles.nearest(all, this.x, this.y, this.r + 24);
    const boss = all.find(e => e.boss && !e.dead && G.U.dist(this.x, this.y, e.x, e.y) < 330);
    const tg = (ranged ? boss || threat : threat || boss)
            || G.Projectiles.nearest(all, this.x, this.y, 520)
            || G.World.nearestBreakable(this.x, this.y, 200);
    // Apuntar a mano (Ajustes > Accesibilidad): hacia el ratón o el stick derecho.
    // El blanco (para la cadena) es el enemigo que hay en esa dirección; si no
    // hay ninguno, el de siempre.
    const hand = this.handAim();
    this.manualAim = hand != null;
    if (hand != null) {
      this.aim = hand;
      this.target = this.enemyAlong(all, hand) || tg;
    } else {
      this.target = tg;
      if (tg) this.aim = Math.atan2(tg.y - this.y, tg.x - this.x);
      else if (this.walking) this.aim = this.moveAngle;
    }

    // --- animación: mira al objetivo al atacar, si no a donde camina ---
    const face = this.attackFace > 0 || !this.walking ? this.aim : this.moveAngle;
    this.anim.dir = G.Sprites.dirFromAngle(face);
    this.anim.loop(this.walking ? 'Walk' : 'Idle', this.walking ? s / 110 : 1);
  }

  /**
   * Ángulo de "Apuntar a mano", o null si toca apuntar solo. Manda lo último
   * que se haya usado: el stick derecho mientras se empuja; si no, el ratón si
   * se ha movido después (en PC). Soltar el stick sin tocar el ratón = solo.
   */
  handAim() {
    // En el móvil (táctil) no hay apuntado a mano: siempre apunta solo.
    if (this.remote || G.Settings.touch || !G.Settings.get('aimManual')) return null;
    const st = G.Pad.aim();
    if (st) return Math.atan2(st[1], st[0]);
    if (G.Touch.active || !G.Input.mouseMovedAt || G.Input.mouseMovedAt < G.Pad.aimAt) return null;
    const w = G.Input.mouseWorld();
    const dx = w.x - this.x, dy = w.y - (this.y - G.LIFT * 0.5);
    return Math.hypot(dx, dy) < 4 ? null : Math.atan2(dy, dx);
  }

  /** El enemigo más cercano dentro de ±25° de la dirección a (a menos de 520). */
  enemyAlong(all, a) {
    let best = null, bd = 520 * 520;
    const ca = Math.cos(a), sa = Math.sin(a), cosMax = Math.cos(0.44);
    for (const e of all) {
      if (e.dead) continue;
      const dx = e.x - this.x, dy = e.y - this.y, d2 = dx * dx + dy * dy;
      if (d2 >= bd || d2 < 1) continue;
      if ((dx * ca + dy * sa) / Math.sqrt(d2) < cosMax) continue;
      bd = d2; best = e;
    }
    return best;
  }

  /** Vuelve a levantarse (lo revive un compañero en cooperativo). */
  revive(frac = 0.5) {
    this.dead = false;
    this.hp = Math.max(1, this.maxHp * frac);
    this.invuln = 2;
    this.reviveT = 0;
    this.anim._start('Idle', false);
    G.FX.ring(this.x, this.y, 6, 70, '#5fe08a', 0.5, 4);
    G.FX.burst(this.x, this.y - this.bodyH * 0.5, '#9dffb8', 18, 150);
    G.Audio.sfx('heal');
  }

  // ---------------- compañero (cooperativo) ----------------

  /**
   * Un compañero en otro ordenador: su dueño manda su estado (posición, vida,
   * movimiento activo...) y aquí se sigue con suavidad.
   * n = { x, y, ang, walk, hp, maxHp, dead, mv, ml, mag, aim, rev }
   */
  netUpdate(dt) {
    this.anim.update(dt);
    const n = this.net;
    if (!n) return;
    if (this.flash > 0) this.flash -= dt;
    if (this.attackFace > 0) this.attackFace -= dt;
    if (G.U.dist2(this.x, this.y, n.x, n.y) > 300 * 300) { this.x = n.x; this.y = n.y; }
    else { this.x = G.U.damp(this.x, n.x, 14, dt); this.y = G.U.damp(this.y, n.y, 14, dt); }
    if (n.hp < this.hp - 0.5 && !n.dead) this.flash = 0.14;
    this.hp = n.hp; this.maxHp = n.maxHp;
    this.magnet = n.mag || this.magnet;
    this.reviveT = n.rev || 0;
    if (n.dead && !this.dead) { this.dead = true; this.anim.play('Faint', { hold: true }); G.Projectiles.clearOrbs(this); }
    else if (!n.dead && this.dead) this.revive(n.hp / (n.maxHp || 1));
    // Movimiento activo (para el halo, el HUD y los orbes).
    if (n.mv && (!this.moves[0] || this.moves[0].id !== n.mv || this.moves[0].lvl !== n.ml) && G.Moves.BY_ID[n.mv]) {
      this.moves = [G.Moves.instance(n.mv, n.ml || 1)];
      this.slots = [this.moves.slice()];
      this.active = 0;
      G.Projectiles.clearOrbs(this);
    }
    if (this.dead) return;
    this.walking = !!n.walk;
    this.moveAngle = n.ang;
    this.aim = n.aim;
    const face = this.attackFace > 0 || !this.walking ? this.aim : this.moveAngle;
    this.anim.dir = G.Sprites.dirFromAngle(face);
    this.anim.loop(this.walking ? 'Walk' : 'Idle', this.walking ? this.baseSpd / 110 : 1);
  }

  draw(ctx) {
    // Halo del tipo del movimiento activo, en el suelo.
    const m = this.activeMove();
    if (m && !this.dead) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = G.U.TYPE_COLOR[m.type];
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r * 1.5, this.r * 0.6, 0, 0, 6.2832); ctx.stroke();
      ctx.restore();
    }
    G.Sprites.drawShadow(ctx, this.dex, this.x, this.y, this.scale);
    // Poder de altar: aro de su color latiendo bajo los pies.
    if (this.power && !this.dead) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(performance.now() / 120) * 0.15;
      ctx.strokeStyle = this.power.def.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r * 2.1, this.r * 0.85, 0, 0, 6.2832); ctx.stroke();
      ctx.restore();
    }

    const alpha = this.invuln > 0 && !this.dead ? (Math.floor(this.invuln * 18) % 2 ? 0.45 : 1) : 1;
    this.anim.draw(ctx, this.x, this.y, { flash: this.flash > 0, softFlash: true, alpha, color: '#ffcb3d' });
    this.drawEvo(ctx);

    // Arcos de buff alrededor de los pies.
    const COL = { atk: '#ff6b4d', patk: '#ff6b4d', satk: '#c47bff', spd: '#7fe0ff', def: '#b0b8c8', regen: '#5fe08a' };
    let i = 0;
    for (const k in this.buffs) {
      const b = this.buffs[k];
      if (b.n <= 0) continue;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = COL[k];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r * 1.8 + i * 5, (this.r * 1.8 + i * 5) * 0.42, 0, 0, 6.2832 * (b.n / 5));
      ctx.stroke();
      ctx.restore();
      i++;
    }

    // Cooperativo: anillo de "reviviendo" y nombre encima.
    if (this.dead && this.reviveT > 0) {
      ctx.save();
      ctx.strokeStyle = '#5fe08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r * 2.4, this.r * 1.0, 0, -Math.PI / 2, -Math.PI / 2 + 6.2832 * Math.min(1, this.reviveT / G.Player.REVIVE_TIME));
      ctx.stroke();
      ctx.restore();
    }
    if (this.tag) {
      ctx.save();
      ctx.font = '700 7px Pixelify,"Segoe UI",sans-serif';
      ctx.textAlign = 'center';
      const y = this.y - this.bodyH - 8;
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(0,0,0,.75)';
      G.I18n.rawCanvas(ctx, 'strokeText', this.tag, this.x, y);
      ctx.fillStyle = this.dead ? '#ff8a96' : this.tagColor || '#fff';
      G.I18n.rawCanvas(ctx, 'fillText', this.tag, this.x, y);
      if (this.dead) {
        ctx.font = '700 6px Pixelify,"Segoe UI",sans-serif';
        ctx.strokeText(this.revLabel || '', this.x, y - 8);
        ctx.fillText(this.revLabel || '', this.x, y - 8);
      }
      ctx.restore();
    }
  }
};
