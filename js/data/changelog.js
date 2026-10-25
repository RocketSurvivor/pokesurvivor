/* ============ changelog.js — novedades del juego ============
 * Lo que ve la gente en el botón "Novedades" de la barra de arriba: cambios
 * de juego y fallos arreglados (nada de servidores ni bases de datos).
 * La fecha más nueva, arriba. En cada fecha, por apartados:
 *   new  lo nuevo · chg  cambios y ajustes · fix  fallos arreglados
 * Cada línea en español y en inglés.
 */
G.CHANGELOG = [
  { d: '2026-10-25', title: ["Mejoras de Ráfaga y Amplitud y megaevolución en la partida", "Barrage and Breadth upgrades and Mega Evolving during runs"], new: [
    ["Modo Mazmorra (pisos con escalera, salas de tesoro, descanso, tienda, trampas y casas de monstruos, jefe cada 5 pisos y legendario cada 10, con tickets por piso), incursiones en grupo (el legendario Dinamax de la semana en el minuto 6, con 3 dificultades y premios según la dificultad), premio diario con racha, tres zonas nuevas con sus Pokémon, sucesos y jefes (Playa Coral, Ciudad Neón y Mundo Distorsión, donde el jefe es Giratina) y avisos de los administradores en el menú.", "Dungeon mode (floors with stairs, treasure, rest, shop, trap and monster-house rooms, a boss every 5 floors and a legendary every 10, with tickets per floor), group raids (the week's Dynamax legendary at minute 6, with 3 difficulties and rewards to match), a daily reward with streaks, three new zones with their own Pokémon, events and bosses (Coral Beach, Neon City and the Distortion World, whose boss is Giratina) and admin notices in the menu."],
    ["Ataques exclusivos de legendario: 27 legendarios (Mewtwo, Lugia, Ho-Oh, Kyogre, Groudon, Rayquaza, Dialga, Palkia, Giratina, Reshiram, Zekrom, Zacian, Eternatus, Koraidon…) empiezan con su ataque propio, como Pulso Primigenio, Distorsión, Corte Vacío o Golpe Umbrío. Nadie más puede aprenderlo, tiene efectos propios (detener el tiempo, segundo golpe, curarte…) y con su forma especial (Primigenio, Origen, mega…) pega más. Como jefes también lo usan, con aviso y su nombre en pantalla. En la Movedex salen marcados como «Exclusivo».", "Legendary signature moves: 27 legendaries (Mewtwo, Lugia, Ho-Oh, Kyogre, Groudon, Rayquaza, Dialga, Palkia, Giratina, Reshiram, Zekrom, Zacian, Eternatus, Koraidon…) start with their own move, like Origin Pulse, Roar of Time, Spacial Rend or Shadow Force. Nobody else can learn it, it has its own effects (stopping time, a second hit, healing you…) and it hits harder in their special form (Primal, Origin, Mega…). As bosses they use it too, with a warning and its name on screen. They're marked «Exclusive» in the Movedex."],
    ["Pokémon nuevos de SpriteCollab: Groudon y Kyogre Primigenios y Dialga, Palkia y Giratina Origen (en el gacha de su región; en la partida, esos legendarios se transforman al nivel 40), y 104 formas regionales y alternativas como Pokémon propios: de Alola, Galar, Hisui y Paldea (en el banner de su región) y formas como Rotom Calor, Deoxys Ataque, Kyurem Negro, Shaymin Cielo, Zacian Espada Suprema u Ogerpon con sus máscaras (en el de su base). Las regionales evolucionan como su forma (Vulpix de Alola → Ninetales de Alola). Como jefes, Groudon y Kyogre se vuelven Primigenios y Dialga, Palkia y Giratina pasan a su forma Origen al llegar a la segunda fase.", "New Pokémon from SpriteCollab: Primal Groudon and Kyogre and Origin Forme Dialga, Palkia and Giratina (in their region's gacha; in runs, those legendaries transform at level 40), plus 104 regional and alternate forms as Pokémon of their own: from Alola, Galar, Hisui and Paldea (in their region's banner) and forms like Heat Rotom, Attack Deoxys, Black Kyurem, Sky Shaymin, Crowned Zacian or Ogerpon with its masks (in their base's banner). Regional forms evolve within their form (Alolan Vulpix → Alolan Ninetales). As bosses, Groudon and Kyogre turn Primal and Dialga, Palkia and Giratina switch to their Origin Forme when they reach their second phase."],
    ["Modo Infinito: al darle a Jugar eliges Normal (con la Sentencia de Arceus en el minuto 30; si caes, se acaba) o Infinito (sin Arceus: oleadas, jefes y grietas sin fin, cada vez más fuertes, con su propio ranking). Ya no se sigue la partida tras caer ante Arceus. Jefes de zona: en cada zona sale un jefe con su ataque propio (esporas, cristales o lava). Talentos: con la maestría Maestro eliges uno para ese Pokémon (Comienzo veloz o Cuerpo curtido). Temporadas: cada mes es de un tipo (octubre, Fantasma): sus Pokémon pegan un 10 % más, sus legendarios salen más en las grietas y, si aguantas 15 minutos con uno, te llevas un ticket shiny.", "Infinite mode: when you press Play you choose Normal (with Arceus's Judgment at minute 30; if you fall, it's over) or Infinite (no Arceus: endless waves, bosses and rifts that keep getting stronger, with its own leaderboard). You can no longer keep playing after falling to Arceus. Zone bosses: each zone has a boss with its own attack (spores, crystals or lava). Talents: at Master mastery you pick one for that Pokémon (Quick start or Hardened body). Seasons: each month belongs to a type (October: Ghost): its Pokémon deal 10% more damage, its legendaries show up more in rifts and, if you survive 15 minutes with one, you get a shiny ticket."],
    ["Partidas más variadas: cada zona tiene su suceso (niebla en el Bosque Umbrío, derrumbes en la Cueva Cristal y erupciones en el Volcán Ceniza); a veces sale un cofre dorado con 5 guardianes de élite que da a elegir un objeto, entrenamiento o tesoro; y en el minuto 10 eliges un camino (más daño, más vida, más recarga, más experiencia...) con su contra para toda la partida. Los jefes pueden soltar un Revivir, que te levanta con la mitad de vida si caes. En cooperativo, los compañeros con tipos que combinan (Fuego y Planta, Agua y Eléctrico...) pegan un 12 % más cuando están cerca.", "More varied runs: each zone has its own event (fog in the Gloomy Forest, cave-ins in the Crystal Cave and eruptions in the Ash Volcano); sometimes a golden chest appears with 5 elite guards and lets you pick an item, training or treasure; and at minute 10 you choose a path (more damage, more HP, faster cooldowns, more experience...) with a drawback for the whole run. Bosses can drop a Revive, which gets you back up with half your HP if you fall. In co-op, teammates with types that combine (Fire and Grass, Water and Electric...) deal 12% more damage when close together."],
    ["La Movedex marca los ataques que has usado (✓) y evolucionado (★), y tiene filtro «Sin usar» y logros. La ficha de cada Pokémon enseña su mejor tiempo, nivel máximo, partidas, derrotados y su ataque que más pega. Cada rango de maestría pide ahora también un reto con ese Pokémon. Botón «Jugar otra vez» al acabar. En Ajustes > Accesibilidad: modo daltónico y texto de la partida más grande. Los administradores tienen un panel con estadísticas de los rankings.", "The Movedex marks the moves you've used (✓) and evolved (★), and has an «Unused» filter and achievements. Each Pokémon's card shows its best time, max level, runs, defeated foes and its hardest-hitting move. Each mastery rank now also asks for a challenge with that Pokémon. «Play again» button at the end of a run. In Settings > Accessibility: colorblind mode and bigger in-game text. Admins have a panel with leaderboard stats."],
    ["Desafío semanal: cada semana, el mismo Pokémon y dos reglas raras para todos (enemigos duros, enjambre, cañón de cristal, un solo tipo...), sin Mejoras ni maestría, con su propio ranking. Maestría: cuanto más juegas con un Pokémon, más rango (Aprendiz, Entrenado, Experto, Maestro y Leyenda), con un 1 % más de daño por rango. Se ve en su ficha. Los legendarios tienen dos fases: al bajar de la mitad de vida sacan todos sus ataques. La grieta verde da un ticket ×10 seguro y un 30 % de ticket shiny. 9 logros nuevos.", "Weekly Challenge: every week, the same Pokémon and two odd rules for everyone (tough enemies, swarm, glass cannon, single type...), with no Upgrades or mastery and its own leaderboard. Mastery: the more you play a Pokémon, the higher its rank (Apprentice, Trained, Expert, Master and Legend), with 1% more damage per rank. It shows on its card. Legendaries have two phases: below half HP they use all their attacks. The green rift gives a guaranteed ×10 ticket and a 30% chance of a shiny ticket. 9 new achievements."],
    ["Mejora automática: cada Pokémon guarda su propio orden, y hay órdenes listos para poner de un toque (Daño máximo, Tanque, Velocidad y recarga, Muchos ataques). Al acabar la partida se ve el daño de cada ataque con barras y lo que más vida te ha quitado. Más herramientas para los administradores: jefe, grieta, grieta verde y Aipom shiny al momento, curarse e invencible.", "Auto-upgrade: each Pokémon keeps its own order, and there are ready-made orders you can set with one tap (Max damage, Tank, Speed and cooldown, Many moves). At the end of a run you see each move's damage with bars and what hurt you the most. More admin tools: instant boss, rift, green rift and shiny Aipom, heal and invincible."],
    ["Ya se pueden olvidar las MT: en la ficha del Pokémon, «Olvidar MT». El ataque deja de salirle y la MT vuelve a tu Mochila. La mejora automática ahora deja ordenar cada estadística y cada ataque: en el menú de pausa, «Orden de las estadísticas» y «Orden de los ataques». Los administradores salen con el nombre en verde y tienen un menú en la pausa para subir niveles y adelantar minutos.", "TMs can now be forgotten: on the Pokémon's card, «Forget TM». The move stops showing up for it and the TM goes back to your Bag. Auto-upgrade now lets you order every stat and every move: in the pause menu, «Stat order» and «Move order». Admins show their name in green and have a pause menu to add levels and skip minutes."],
    ["Nuevo apartado en la Tienda Kecleon: MT de tipo Normal, siempre a la venta. Con ellas cualquier Pokémon puede aprender los ataques de tipo Normal (Placaje, Golpe Cuerpo, Vozarrón, Hiperrayo, Rapidez...).", "New section in the Kecleon Shop: Normal-type TMs, always for sale. With them any Pokémon can learn Normal-type moves (Tackle, Body Slam, Hyper Voice, Hyper Beam, Swift...)."],
    ["Movedex: un botón arriba a la izquierda en los menús con todos los ataques del juego (daño, daño por segundo, recarga, área, grosor, efectos, quién los aprende y cómo evolucionan), con buscador, filtro por tipo y orden. Mejora automática: actívala o desactívala en el menú de pausa y elige qué priorizar (evoluciones, mejorar ataques, ataques nuevos o estadísticas, y tu estadística preferida); las cartas de nivel se eligen solas. Los tickets shiny se ven en la barra de arriba, al lado de los demás.", "Movedex: a button at the top left of the menus with every move in the game (damage, damage per second, cooldown, area, width, effects, who learns them and how they evolve), with search, type filter and sorting. Auto-upgrade: turn it on or off in the pause menu and choose what to prioritize (evolutions, upgrading moves, new moves or stats, plus your preferred stat); level-up cards are picked for you. Shiny tickets now show in the top bar, next to the others."],
    ["Grieta de legendarios: en el minuto 15 (y luego cada 15 min, menos en el 30, que viene Arceus) se abre una grieta cerca de ti y salen 3 legendarios a por ti. Los legendarios de todas las grietas usan ahora todos los ataques de los jefes y dos nuevos: una tormenta de zonas por todas partes y rayos en ráfaga que te siguen. Nuevo Gacha Shiny: todas las regiones y todo sale shiny. Se tira con tickets shiny, que suelta un Aipom shiny que aparece en más o menos una de cada tres partidas y huye a los 20 s. Y 36 ataques nuevos, uno físico y uno especial para cada tipo (Llamarada, Cascada, Hoja Aguda, Electrocañón, Puño Hielo, A Bocajarro, Pulso Dragón, Cañón Floral...). Chispa pasa a llamarse Placaje Eléctrico.", "Legendary Rift: at minute 15 (and then every 15 min, except at 30, when Arceus comes) a rift opens near you and 3 legendaries come after you. Legendaries in every rift now use all the boss attacks and two new ones: a storm of zones everywhere and rapid beams that follow you. New Shiny Gacha: every region and everything is shiny. You pull with shiny tickets, dropped by a shiny Aipom that shows up in about one in three runs and runs away after 20 s. Plus 36 new moves, one physical and one special for each type (Fire Blast, Waterfall, Leaf Blade, Zap Cannon, Ice Punch, Close Combat, Dragon Pulse, Fleur Cannon...). Spark is now called Volt Tackle."],
    ["Mejoras nuevas: Ráfaga (+1 proyectil en los ataques que disparan, hasta +2) y Amplitud (+7 % de área en golpes cuerpo a cuerpo, auras, meteoros y zonas, hasta +28 %). Además, cuando tu Pokémon ya no puede evolucionar más y su forma tiene megaevolución, megaevoluciona al nivel 24. Al evolucionar te envuelve una esfera de luz y sales de ella con tu nueva forma. Los legendarios de las grietas tienen un 30 % más de vida y pegan un 15 % más.", "New upgrades: Barrage (+1 projectile on moves that shoot, up to +2) and Breadth (+7% area on melee strikes, auras, meteors and zones, up to +28%). Also, when your Pokémon can't evolve any further and its form has a Mega Evolution, it Mega Evolves at level 24. When evolving, a sphere of light surrounds you and you come out of it in your new form. Rift legendaries have 30% more HP and hit 15% harder."]
  ], chg: [
    ["Revivir más visible: si llevas uno, un halo dorado late a tus pies, su icono flota encima de tu Pokémon y sale «REVIVIR» junto a tus efectos.", "Revive is easier to see: if you carry one, a golden halo pulses at your feet, its icon floats above your Pokémon and «REVIVE» shows next to your effects."],
    ["Los jefes, legendarios y jefes de zona ya no se pueden aturdir ni dormir, y a los ralentizadores sólo les afectan un poco (se quedaban quietos sin poder hacer nada).", "Bosses, legendaries and zone bosses can no longer be stunned or put to sleep, and slowing effects only affect them a little (they were left standing still, unable to do anything)."],
    ["Ataques exclusivos de legendario: un 18 % menos de daño y la forma especial (Primigenio, Origen, mega…) da un 15 % más en vez de un 25 %. Y 25 ataques exclusivos nuevos para 33 legendarios más: Latias y Latios, el trío del lago, Heatran, Regigigas, Cresselia, Victini, los Espadachines Místicos, Tornadus, Thundurus, Landorus, Enamorus, Keldeo, Genesect, Diancie, Hoopa, Volcanion, los Tapus, Marshadow, Zeraora, Melmetal, Regieleki, Regidrago, Glastrier, Spectrier y Ogerpon.", "Legendary signature moves: 18% less damage, and their special form (Primal, Origin, Mega…) adds 15% instead of 25%. Plus 25 new signature moves for 33 more legendaries: Latias and Latios, the lake trio, Heatran, Regigigas, Cresselia, Victini, the Swords of Justice, Tornadus, Thundurus, Landorus, Enamorus, Keldeo, Genesect, Diancie, Hoopa, Volcanion, the Tapus, Marshadow, Zeraora, Melmetal, Regieleki, Regidrago, Glastrier, Spectrier and Ogerpon."],
    ["Ajustes: los legendarios (Mewtwo, Rayquaza, Latias...) megaevolucionan al nivel 40, y el resto al 24. Amplitud también hace más gruesos los rayos (Hiperrayo, Hidrobomba, Rayo Solar...) y las embestidas. Los enemigos de los primeros minutos tienen algo más de vida (+10-25 %), porque con Ráfaga y Amplitud se empieza más fuerte.", "Tweaks: legendaries (Mewtwo, Rayquaza, Latias...) Mega Evolve at level 40, and the rest at 24. Breadth also makes beams (Hyper Beam, Hydro Pump, Solar Beam...) and dashes wider. Enemies in the first minutes have a bit more HP (+10-25%), since Barrage and Breadth let you start stronger."],
    ["HUD más claro: los avisos del centro se apilan en vez de taparse; flechas en el borde de la pantalla hacia el cofre dorado y los jefes que no se ven; una barra por jefe cuando hay varios (grieta verde, jefe de zona...); una fila con lo que llevas activo (objeto, camino, temporada, maestría) bajo tu vida; barra de experiencia más gruesa que destella al estar a punto de subir; y menos números de daño cuando hay muchos golpes a la vez. Los orbes de experiencia cercanos se juntan en uno cuando hay muchos. Nuevos enemigos élite con rasgo y aura de color (veloz, duro, escudo, explosivo o que se divide), que dan el triple de experiencia. El juego se pausa también al perder el foco (una notificación o cambiar de ventana).", "Clearer HUD: center notices stack instead of covering each other; arrows at the screen edge point to the golden chest and off-screen bosses; one bar per boss when there are several (green rift, zone boss...); a row under your HP with what you have active (item, path, season, mastery); a thicker experience bar that flashes when you're about to level up; and fewer damage numbers when lots of hits land at once. Nearby experience orbs merge into one when there are many. New elite enemies with a trait and a colored aura (swift, tough, shield, explosive or splitting) that give triple experience. The game also pauses when it loses focus (a notification or switching windows)."],
    ["Menú más ordenado: Misiones, Desafío semanal, Ranking y una Guía nueva están juntos en «Retos». La Guía explica todo lo nuevo, y la primera vez que te pasa algo en la partida (el camino del minuto 10, un cofre dorado, la grieta verde...) sale un consejo que lo explica. En la pausa, las opciones de la Mejora automática salen plegadas. El Desafío semanal tiene 7 reglas nuevas desde la semana que viene (pies de plomo, regeneración, aprendiz rápido, jefes gigantes, recarga rápida, imán gigante y sin defensas).", "Tidier menu: Missions, Weekly Challenge, Leaderboard and a new Guide are together in «Challenges». The Guide explains everything new, and the first time something happens in a run (the minute 10 path, a golden chest, the green rift...) a tip explains it. In the pause menu, Auto-upgrade options start collapsed. The Weekly Challenge gets 7 new rules from next week (lead feet, regeneration, quick learner, giant bosses, fast cooldown, giant magnet and no defenses)."],
    ["Va más fluido en móviles modestos: con calidad baja (o si la automática la baja) se dibuja a menos resolución. Si el juego da un error, manda un informe corto para poder arreglarlo antes.", "Smoother on modest phones: on low quality (or when auto lowers it) the game renders at a lower resolution. If the game hits an error, it sends a short report so it can be fixed sooner."],
    ["Mejora automática: ya no se abren las cartas al subir de nivel. Sale un aviso con lo que ha cogido y la partida sigue sin pararse (en cooperativo se siguen viendo las cartas, porque hay que esperar a los demás).", "Auto-upgrade: level-up cards no longer open. A notice shows what it picked and the run keeps going without stopping (in co-op you still see the cards, since you have to wait for the others)."],
    ["Mejora automática: para cambiar el orden ya no hay flechas; tocas una estadística o un ataque y luego otro, y se intercambian.", "Auto-upgrade: no more arrows to change the order; tap a stat or a move and then another one, and they swap places."],
    ["La Grieta de legendarios es ahora una grieta verde: en el minuto 15 (y cada 15 min, menos en el 30) se abre cerca de ti, y si entras te lleva a una arena donde te esperan los 3 legendarios a la vez. Tienes 3 min y 30 s para vencerlos y, al ganar, también te llevas un vínculo. La barra del jefe dice cuántos quedan.", "The Legendary Rift is now a green rift: at minute 15 (and every 15 min, except at 30) it opens near you, and if you go in it takes you to an arena where all 3 legendaries are waiting. You have 3 min 30 s to beat them and, if you win, you also get a bond. The boss bar shows how many are left."]
  ], fix: [
    ["En grupo, el aviso «Pausa: … está eligiendo» se quedaba en pantalla para siempre aunque ya se hubiera elegido.", "In co-op, the “Paused: … is choosing” notice stayed on screen forever even after the choice was made."],
    ["Al usar un vínculo (al salir de una grieta) para juntar ataques, ya no se cambia solo el hueco que tenías seleccionado.", "When using a bond (after leaving a rift) to merge moves, the slot you had selected no longer changes by itself."],
    ["Los Pokémon muy grandes del escaparate del gacha (como Zygarde o Eternatus Dinamax Infinito) ya no salen cortados: se encogen lo justo para caber.", "The very large Pokémon in the gacha showcase (like Zygarde or Eternamax Eternatus) are no longer cut off: they shrink just enough to fit."],
    ["Desde el minuto 12 el mapa usaba los colores de las arenas de las grietas en vez de volver a empezar por el Bosque Umbrío; ahora las tres zonas se turnan siempre.", "From minute 12 the map used the rift arena colors instead of starting over with the Gloomy Forest; now the three zones always take turns."],
    ["El juego ya no se puede quedar parado esperando una elección que no se ve (por ejemplo, al recoger el premio de la grieta verde): si pasa, sigue solo al segundo y medio.", "The game can no longer get stuck waiting for a choice that isn't on screen (for example, when collecting the green rift reward): if it happens, it carries on by itself after a second and a half."],
    ["El juego podía quedarse congelado en el minuto 15, al salir los 3 legendarios en el mapa entre todos los enemigos.", "The game could freeze at minute 15, when the 3 legendaries came out on the map among all the enemies."],
    ["La Defensa Especial del menú de pausa salía con decimales infinitos (55,0000000001).", "Special Defense in the pause menu showed endless decimals (55.0000000001)."]
  ] },
  { d: '2026-10-24', title: ['Megaevoluciones, 18 ataques, 6 objetos y jefes con ataques nuevos', 'Mega Evolutions, 18 moves, 6 items and bosses with new attacks'], new: [
    ["Evolución en la partida: si juegas con un Pokémon que aún puede evolucionar, evoluciona al subir de nivel (con dos evoluciones por delante, a los niveles 7 y 16; con una, al 10). Cada evolución te cura y te da Crecimiento para el resto de la partida (+12 % de daño y +10 % de vida máxima), así que empezar con Charmander cuesta más al principio pero acaba más fuerte que empezar con Charizard. Si hay varias formas (Eevee, Kirlia...), eliges tú; en grupo sale una al azar.", "Evolving during runs: if you play with a Pokémon that can still evolve, it evolves when you level up (with two evolutions ahead, at levels 7 and 16; with one, at 10). Each evolution heals you and gives Growth for the rest of the run (+12% damage and +10% max HP), so starting with Charmander is harder at first but ends stronger than starting with Charizard. If there are several forms (Eevee, Kirlia...), you choose; in a group, one is picked at random."],
    ["Ataques: Golpe Cuerpo ahora aplasta donde avisa el suelo y paraliza, y Picotazo Veneno lanza aguijones que buscan solos (antes repetían lo mismo que Placaje y Residuos). Y 6 ataques físicos nuevos para los tipos que casi sólo tenían especiales: Colmillo Ígneo, Acua Cola, Puño Trueno, Chispa, Cabezazo Zen y Puya Nociva.", "Moves: Body Slam now crushes where the ground warns and paralyzes, and Poison Sting fires stingers that seek on their own (before, they did the same as Tackle and Sludge). Plus 6 new physical moves for the types that had almost only special ones: Fire Fang, Aqua Tail, Thunder Punch, Spark, Zen Headbutt and Poison Jab."],
    ['18 ataques nuevos para los tipos que tenían menos variedad: Ventisca y Alud (Hielo), Trampa Rocas y Testarazo (Roca), Puño Bala y Cabeza de Hierro (Acero), Pin Misil y Tijera X (Bicho), Alarido (Siniestro), Golpe Fantasma (Fantasma), Cometa Draco (Dragón), Fuerza Lunar (Hada), Ultrapuño (Lucha), Onda Tóxica (Veneno), Vendaval (Volador), Trueno (Eléctrico), Surf (Agua) y Tierra Viva (Tierra). Todos se mejoran y evolucionan como los demás.',
     '18 new moves for the types that had the least variety: Blizzard and Avalanche (Ice), Stealth Rock and Head Smash (Rock), Bullet Punch and Iron Head (Steel), Pin Missile and X-Scissor (Bug), Snarl (Dark), Phantom Force (Ghost), Draco Meteor (Dragon), Moonblast (Fairy), Mach Punch (Fighting), Sludge Wave (Poison), Hurricane (Flying), Thunder (Electric), Surf (Water) and Earth Power (Ground). They all level up and evolve like the rest.'],
    ['6 objetos nuevos: Cinta Experto (+30 % de daño súper eficaz), Periscopio (+15 % de crítico), Raíz Grande (+50 % a toda tu curación), Roca del Rey (8 % de aturdir al golpear), Globo Helio (+15 % de velocidad y el agua no te frena) y Metrónomo (más daño cuanto más rato sigues con el mismo ataque).',
     '6 new items: Expert Belt (+30% super-effective damage), Scope Lens (+15% critical chance), Big Root (+50% to all your healing), King\'s Rock (8% chance to stun on hit), Air Balloon (+15% speed and water no longer slows you) and Metronome (more damage the longer you stick with the same move).'],
    ['Los jefes y los legendarios de las grietas tienen un ataque más según su tipo: una espiral de disparos que gira, una jaula de zonas alrededor de ti con un solo hueco para salir, o rayos en cruz seguidos de rayos en aspa.',
     'Bosses and rift legendaries have one more attack depending on their type: a spinning spiral of shots, a cage of zones around you with a single gap to escape, or beams in a cross followed by beams in an X.'],
    ["Ante Arceus ya no se acaba todo al caer: puedes seguir la run sin él. Arceus se va y vuelves al mapa donde estabas: siguen las oleadas, las mareas, las grietas y un jefe cada 3 minutos, cada vez más fuertes según el tiempo que llevas. Para el ranking, los récords y los logros cuenta el momento en que caíste; seguir te da más experiencia y Pokémonedas.",
     "Falling to Arceus no longer ends everything: you can keep playing the run without it. Arceus leaves and you return to where you were on the map: waves, surges, rifts and a boss every 3 minutes carry on, stronger and stronger the longer you've been playing. The ranking, records and achievements use the moment you fell; continuing gives you more experience and PokéCoins."],
    ["Megaevoluciones: 42 megas nuevas en el gacha (Mega-Charizard X, Mega-Mewtwo Y, Mega-Rayquaza, Mega-Gengar, Mega-Lucario, Mega-Zygarde...), cada una en el banner de la región de su Pokémon. Son Legendarias (5★), tienen sus propios tipos, estadísticas y habilidad, casi todas con versión shiny, aprenden las MT de su Pokémon y en la colección salen justo detrás de él.",
     "Mega Evolutions: 42 new Megas in the gacha (Mega Charizard X, Mega Mewtwo Y, Mega Rayquaza, Mega Gengar, Mega Lucario, Mega Zygarde...), each in the banner of its Pokémon's region. They are Legendary (5★), have their own types, stats and ability, almost all with a shiny version, learn their Pokémon's TMs and appear right after it in the collection."]
 ], chg: [
    ["Objetos con iconos nuevos, más detallados (16×16, con sombra y brillo). El Metrónomo enseña sus cargas bajo su casilla y, al máximo, la casilla parpadea, pone MÁX y tu Pokémon brilla en naranja.", "Items have new, more detailed icons (16×16, with shading and highlights). The Metronome shows its charges under its slot and, when maxed out, the slot flashes, shows MAX and your Pokémon glows orange."],
    ["Se quitan las esferas de Mundo Misterioso: ya no salen en las partidas.", "The Mystery Dungeon orbs are gone: they no longer appear in runs."],
    ["La Tienda Kecleon ya no vende MT de ataques de tipo Normal: cualquier Pokémon los aprende al subir de nivel, así que no servían para nada.",
     "Kecleon's Shop no longer sells TMs for Normal-type moves: any Pokémon learns them by leveling up, so they were useless."],
    ["Los ataques de tipo Normal (Placaje, Ataque Rápido, Golpe Cuerpo, Vozarrón, Giro Rápido, Hiperrayo y Sustituto) ya sólo los aprenden los Pokémon de tipo Normal. Fortaleza, Danza Espada, Maquinación y Agilidad los sigue pudiendo aprender cualquiera.",
     "Normal-type attacks (Tackle, Quick Attack, Body Slam, Hyper Voice, Rapid Spin, Hyper Beam and Substitute) can now only be learned by Normal-type Pokémon. Any Pokémon can still learn Harden, Swords Dance, Nasty Plot and Agility."],
    ["Cuenta de administrador para probar el juego: con todos los Pokémon y sus shiny, las mejoras al máximo, monedas y tickets de sobra, la Mochila llena y todos los logros.",
     "Administrator account for testing the game: every Pokémon and its shiny, upgrades maxed out, plenty of coins and tickets, a full Bag and every achievement."]
  ] },
  { d: '2026-10-23', title: ['Ranking de daño a Arceus y Tablas', 'Arceus damage ranking and Plates'], new: [
    ["Botón de YouTube arriba, junto a Novedades: lleva al canal del juego y, cuando hay directo, se pone rojo con «EN DIRECTO» y te lleva a verlo.",
     "YouTube button at the top, next to What's new: it takes you to the game's channel and, when there is a live stream, it turns red with \"LIVE\" and takes you to watch it."],
    ["Ranking partido en dos: a la izquierda, el daño que le has hecho a Arceus; a la derecha, el tiempo aguantado, como siempre. Las dos mitades se cargan a la vez. Todas las tablas empiezan de cero.",
     "The ranking is now split in two: on the left, the damage you dealt to Arceus; on the right, the time survived, as always. Both halves load at once. Every board starts from zero."],
    ["Sentencia de Arceus: ahora se le puede pegar. Es invencible y sólo recibe una pequeña parte del daño (cada vez menos), y los ataques le apuntan cuando no queda ningún legendario.",
     "Arceus's Judgment: you can now hit it. It is invincible and only takes a small part of the damage (less and less over time), and your attacks aim at it when no legendary is left."],
    ["Tablas: en cada partida Arceus lleva una al azar, que le da su tipo (se avisa al entrar en la arena). Ya no hay un tipo de ataque que sea siempre el mejor.",
     "Plates: in every run Arceus holds a random one, which gives it its type (you are told when you enter the arena). No move type is always the best anymore."]
  ], chg: [
    ["En el minuto 35, Arceus rompe el objeto de todos (Banda Focus incluida).",
     "At minute 35, Arceus breaks everyone's item (Focus Sash included)."],
    ["Los legendarios de la Sentencia ya no son el doble de fuertes que el anterior: cada uno tiene un 25 % más de vida y un 15 % más de daño, así que se pueden tumbar. Ya no hay límite de 45 minutos en el ranking.",
     "The Judgment legendaries are no longer twice as strong as the previous one: each one has 25% more HP and 15% more damage, so they can be taken down. There is no 45-minute limit in the ranking anymore."],
    ['Los movimientos evolucionados ya no cambian de nombre: se llaman igual con un «+» (Puño Meteoro pasa a Puño Meteoro +). Hacen lo mismo que antes y se siguen distinguiendo por el borde dorado.',
     'Evolved moves no longer change their name: they keep it with a "+" (Meteor Mash becomes Meteor Mash +). They work just like before and still stand out with their golden border.'],
    ["Puño Meteoro pega menos: 24 de daño en vez de 34 y una zona un poco más pequeña. Al máximo y evolucionado hacía casi el doble que Avalancha; ahora están a la par.",
     "Meteor Mash hits softer: 24 damage instead of 34 and a slightly smaller area. Maxed and evolved it dealt almost twice as much as Rock Slide; now they are on par."],
    ["En la Sentencia de Arceus, el veneno y las quemaduras quitan poco y siempre lo mismo a los legendarios (antes el veneno quitaba un % de su vida): envenenar y huir ya no sirve, hay que pegarles.",
     "In Arceus's Judgment, poison and burns deal a small, fixed amount to the legendaries (poison used to take a % of their HP): poisoning them and running away no longer works, you have to hit them."]
  ] },
  { d: '2026-10-22', title: ['Esferas de Mundo Misterioso, Amuletos Iris y gacha ×100', 'Mystery Dungeon orbs, Shiny Charms and ×100 gacha'], new: [
    ['Esferas de Mundo Misterioso: objetos de un solo uso que se encuentran durante la partida (cofres, jefes y, a veces, al derrotar a un Pokémon). Soporesfera, Ralentosfera y Rafagaesfera duermen, frenan o lanzan lejos a los enemigos; Focosfera, Luminosfera y Rapidosfera te dan crítico, más campo de visión o velocidad a ti y a los compañeros cercanos. Llevas hasta 4 distintas (3 de cada) y se usan con las teclas 5-8, tocando su casilla encima de los ataques o con X / Y en el mando. A los jefes y legendarios les afectan menos.',
     'Mystery Dungeon orbs: single-use items you find during the run (chests, bosses and sometimes when you defeat a Pokémon). Slumber Orb, Slow Orb and Blowback Orb put enemies to sleep, slow them down or blow them away; Focus Orb, Luminous Orb and Quick Orb give critical hits, a wider view or speed to you and nearby teammates. You carry up to 4 different ones (3 of each) and use them with keys 5-8, by tapping their slot above your moves, or with X / Y on a controller. Bosses and legendaries are less affected.'],
    ['Amuletos Iris: uno por región (Kanto, Johto, Hoenn, Sinnoh, Teselia, Kalos, Alola, Galar y Paldea). Al completar la Pokédex de una región (legendarios incluidos) te dan su Amuleto Iris y en su banner del gacha los shiny salen el doble: del 1 % al 2 %. Los tienes en la Mochila, con lo que te falta para cada uno. Si ya habías completado alguna región, el suyo ya es tuyo.',
     'Shiny Charms: one per region (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar and Paldea). Complete a region\'s Pokédex (legendaries included) to get its Shiny Charm, and shinies become twice as likely in its gacha banner: from 1% to 2%. You can find them in your Bag, along with how many you still need for each one. If you had already completed a region, its charm is already yours.'],
    ['Gacha: nueva tirada ×100, con 100 tickets normales o con 10 tickets ×10 (son diez ×10 seguidas, cada una con su Épica asegurada). La tragaperras gira 10 veces enseñando lo mejor de cada ×10 y al final ves un resumen (nuevos, shiny y Pokémonedas) con las cartas de mejor a peor. Para que quepa, ya no está la tirada ×1: se tira de 10 en 10 o de 100 en 100.',
     'Gacha: new ×100 pull, with 100 normal tickets or with 10 ×10 tickets (ten ×10 pulls in a row, each with its guaranteed Epic). The slot machine spins 10 times showing the best of each ×10, and at the end you get a summary (new, shiny and PokéCoins) with the cards sorted from best to worst. To make room, the ×1 pull is gone: you pull 10 or 100 at a time.'],
    ['Gacha: botón Saltar (o Esc) durante la animación: se acaba la tragaperras y salen todas las cartas de golpe.',
     'Gacha: Skip button (or Esc) during the animation: the slot machine ends and all the cards show up at once.']
  ], fix: [
    ['Cooperativo: a los invitados ya no les sale «La sala se ha cerrado» a mitad de partida (a veces a los pocos minutos o al entrar en una grieta) mientras los demás seguían jugando. Pasaba cuando su conexión con el servidor de las salas se cortaba un momento; ahora la partida sigue y la sala se recupera sola.',
     'Co-op: guests no longer get "The room has been closed" in the middle of a run (sometimes after a few minutes or when entering a rift) while the others kept playing. It happened when their connection to the rooms server dropped for a moment; now the run goes on and the room recovers on its own.'],
    ['Cooperativo: si se corta un momento la conexión con el anfitrión (un bache de la wifi o de los datos), el invitado ya no pierde la partida: se queda en pausa hasta 45 segundos mientras se vuelve a conectar y sigue jugando.',
     'Co-op: if the connection with the host drops for a moment (a Wi-Fi or mobile data hiccup), the guest no longer loses the run: it pauses for up to 45 seconds while reconnecting and then keeps playing.'],
    ['Cooperativo: si te quedas fuera de una partida mientras los demás siguen, ya no te sale «La sala se ha cerrado»: esperas en la sala y, cuando acaben, seguís juntos.',
     'Co-op: if you drop out of a run while the others keep playing, you no longer get "The room has been closed": you wait in the room and, when they finish, you play together again.']
  ]},
  { d: '2026-10-21', title: ['La gran actualización: Tienda Kecleon', 'The big update: Kecleon Shop'], new: [
    ['Mejora nueva: Tienda Kecleon (botón en el menú) con Mentas, Cápsulas Habilidad y 8 MT nuevas cada día. Cada Pokémon tiene ahora su naturaleza (±10 % a dos stats) y su habilidad, con efecto en la partida; se ven y se cambian en su ficha de la colección. Las MT enseñan para siempre ataques de fuera de sus tipos, pero sólo si los aprende en los juegos (Mewtwo puede aprender Bola Sombra; Psyduck no puede aprender Lanzallamas). Gracias a TheAdro7 por la idea y el trabajo de base.',
     'New: the Kecleon Shop (button in the menu) with Mints, Ability Capsules and 8 new TMs every day. Every Pokémon now has its own nature (±10% to two stats) and ability, with an effect in the run; you can see and change them on its page in the collection. TMs permanently teach moves outside its types, but only if it learns them in the games (Mewtwo can learn Shadow Ball; Psyduck cannot learn Flamethrower). Thanks to TheAdro7 for the idea and the groundwork.'],
    ['Mejora nueva, Segundo movimiento inicial: con Repertorio, se compra una vez por Pokémon y luego eliges gratis el segundo ataque con el que empiezas (o lo dejas al azar).',
     'New upgrade, Second starting move: with Repertoire, buy it once per Pokémon and then choose for free the second move you start with (or leave it random).'],
    ['Cooperativo: si vuestras redes no dejan conectaros directamente (pasa a veces con datos móviles y algunos routers), la partida ahora pasa por nuestro servidor y podéis jugar igual. Si conectáis directamente, todo sigue como antes. Hace falta haber iniciado sesión con una cuenta.',
     'Co-op: if your networks cannot connect to each other directly (it sometimes happens on mobile data and with some routers), the match now goes through our server and you can still play together. If you can connect directly, nothing changes. You need to be signed in with an account.'],
    ['Cooperativo: si caes, puedes mirar a un compañero que siga en pie mientras esperas a que te levanten. Pulsa el botón que sale debajo del aviso (o Q / E, o LB / RB en el mando) para pasar de uno a otro y volver a ti. Sólo cambia la cámara: no gasta más conexión.',
     'Co-op: if you go down, you can watch a teammate who is still standing while you wait to be revived. Press the button under the message (or Q / E, or LB / RB on a controller) to switch between them and back to yourself. Only the camera changes: it uses no extra connection.']
  ], fix: [
    ['Guardado en la nube: si jugabas en un aparato y guardabas, otro aparato con el juego abierto desde antes podía subir su copia vieja encima (al guardar o al actualizarse el juego) y en el otro no aparecían tus tickets ni tus Pokémon nuevos. Ahora, si la nube tiene algo más nuevo, se junta con lo tuyo antes de guardar y no se pierde nada.',
     'Cloud save: if you played and saved on one device, another device that still had the game open could upload its old copy over it (when saving or when the game updated), and your new tickets and Pokémon did not show up on the other one. Now, if the cloud has something newer, it is merged with yours before saving and nothing is lost.']
  ] },
  { d: '2026-10-20', title: ['Cooperativo más seguro y arreglos de ataques', 'Safer co-op and move fixes'], fix: [
    ['Cooperativo: un jugador con el juego trucado ya no puede colgar la partida de los demás mandando números imposibles (una experiencia infinita dejaba congelado al anfitrión y un efecto gigante, a los invitados).',
     'Co-op: a player with a tampered game can no longer freeze the others by sending impossible numbers (infinite experience froze the host and a giant effect froze the guests).'],
    ['Mejoras: al cambiar de compañero, la pantalla de mejoras se abre ya con el nuevo y no con el último que habías mirado.',
     'Upgrades: after changing your partner, the upgrades screen now opens on the new one instead of the last one you had looked at.'],
    ['Cooperativo: Viento Aciago, Bucle Arena y Torbellino de un invitado ya atraen a los enemigos (sólo atraían los del anfitrión).',
     'Co-op: a guest\'s Ominous Wind, Sand Tomb and Whirlpool now pull enemies in (only the host\'s did).'],
    ['Cooperativo: el Infortunio de un invitado ya hace su daño extra a los enemigos quemados, envenenados o frenados.',
     'Co-op: a guest\'s Hex now deals its extra damage to burned, poisoned or slowed enemies.'],
    ['Bomba Ácida, Bola Voltio, Bomba Germen, Rayo Señal, Joya de Luz, Bola Neblina, Energibola, Canto Helado, Sombra Vil y Beso Drenaje: al evolucionar, los disparos salían hacia los lados y no daban a nadie. Ahora salen hacia delante, y la mejora «+1 proyectil» ya añade uno (antes no añadía ninguno).',
     'Acid Spray, Electro Ball, Seed Bomb, Signal Beam, Power Gem, Mist Ball, Energy Ball, Ice Shard, Shadow Sneak and Draining Kiss: once evolved, the shots flew off to the sides and hit nothing. Now they go forward, and the "+1 projectile" upgrade really adds one (it added none before).'],
    ['Cooperativo: si a alguien se le cerraban las cartas de subida de nivel sin haber elegido (podía pasar eligiendo muy deprisa), ahora se le vuelven a abrir y los demás ya no se quedan esperándole.',
     'Co-op: if someone\'s level-up cards closed before they had picked (it could happen when picking very fast), they now open again and the others are no longer left waiting for them.']
  ], chg: [
    ['En el móvil ya no está la opción «Apuntar a mano» (no funcionaba con la pantalla táctil): los ataques siempre apuntan solos.',
     'On mobile the "Manual aim" option is gone (it did not work with the touch screen): moves always aim on their own.'],
    ['Ranking por Pokémon: ahora cuentan las partidas de 5 minutos o más (los demás rankings siguen desde 2 minutos).',
     'Per-Pokémon leaderboard: runs now count from 5 minutes on (the other leaderboards still from 2 minutes).'],
    ['Amigos: ya no se ve quién está en línea, y puedes invitar a una sala a cualquier amigo (si no entra, la invitación caduca sola a los 3 minutos).',
     'Friends: you no longer see who is online, and you can invite any friend to a room (if they do not join, the invite expires on its own after 3 minutes).'],
    ['Guardado en la nube: ahora la partida sólo se sube a la nube cuando pulsas el botón Guardar de arriba (y antes de una actualización del juego). En este navegador se sigue guardando todo al momento. Si juegas en otro aparato o vas a borrar los datos del navegador, pulsa Guardar antes.',
     'Cloud save: your game is now only uploaded to the cloud when you press the Save button at the top (and before a game update). Everything is still saved instantly in this browser. If you play on another device or are about to clear your browser data, press Save first.'],
    ['Las solicitudes de amistad nuevas se ven al abrir Amigos.',
     'New friend requests show up when you open Friends.']
  ] },
  { d: '2026-10-19', title: ['38 ataques nuevos', '38 new moves'], new: [
    ['38 ataques nuevos: ahora todos los tipos tienen 5 o más (Roca, Lucha, Dragón y Hada tenían sólo 2). Entre ellos Hiperrayo, Rayo Solar, Magnitud, Torbellino, Onda Trueno, Enfado, Carantoña, Golpe Bajo... cada uno con su evolución.',
     '38 new moves: every type now has 5 or more (Rock, Fighting, Dragon and Fairy had only 2). Among them Hyper Beam, Solar Beam, Magnitude, Whirlpool, Thunder Wave, Outrage, Play Rough, Sucker Punch... each with its evolution.'],
    ['Formas nuevas de atacar: disparos que persiguen al enemigo o rebotan entre ellos, rayos que se cargan, giros que golpean todo alrededor, ondas que avanzan por el suelo, remolinos que atraen a los enemigos, ondas que los apartan y zonas que los dejan aturdidos.',
     'New ways to attack: shots that chase enemies or bounce between them, beams you charge up, spins that hit everything around you, shockwaves that travel along the ground, vortexes that pull enemies in, waves that push them away and zones that stun them.'],
    ['Mejora nueva, Movimiento inicial: se compra una vez por Pokémon y luego eliges gratis con qué ataque empieza la partida.',
     'New upgrade, Starting move: buy it once per Pokémon and then choose for free which move it starts the run with.'],
    ['Idiomas nuevos: francés, italiano, portugués de Brasil, chino simplificado y chino tradicional, en Ajustes > Gráficos > Idioma. Gracias a quienes los tradujeron.',
     'New languages: French, Italian, Brazilian Portuguese, Simplified Chinese and Traditional Chinese, in Settings > Graphics > Language. Thanks to everyone who translated them.'],
    ['Una frase de broma en el título del menú principal, como las de Minecraft.',
     'A joke line on the main menu title, like the ones in Minecraft.']
  ], chg: [
    ['Los Pokémon de un solo tipo pegan un 20 % más con los ataques de su tipo, para compensar que tienen menos variedad.',
     'Single-type Pokémon deal 20% more damage with moves of their type, to make up for having less variety.'],
    ['Al aprender un ataque nuevo ya no se cambia solo a él: sigues con el que estabas usando y cambias cuando tú quieras.',
     'Learning a new move no longer switches to it on its own: you keep the one you were using and switch whenever you want.'],
    ['El juego sólo se puede jugar en su web oficial, pokesurvivor.com: si otra web lo mete dentro de la suya (por ejemplo, para ponerle anuncios alrededor), sale un aviso con un botón para ir a la oficial.',
     'The game can only be played on its official website, pokesurvivor.com: if another site embeds it in its own page (for example, to put ads around it), a notice appears with a button to go to the official one.']
  ], fix: [
    ['Movimiento inicial: ya se puede volver al ataque de serie aunque no sea de su tipo (por ejemplo Confusión en Psyduck).',
     'Starting move: you can now go back to the default move even if it is not of its type (for example Confusion on Psyduck).'],
    ['Cooperativo: el jefe que tocaba al volver de una grieta podía salir a miles de metros, donde nadie lo encontraba, y la partida se quedaba sin más grietas. Ahora sale cerca, y si un jefe se queda lejísimos de todos, vuelve a aparecer cerca a los pocos segundos.',
     'Co-op: the boss due when coming back from a rift could appear thousands of metres away, where nobody could find it, and the run got no more rifts. Now it appears nearby, and if a boss ends up very far from everyone, it shows up close again after a few seconds.'],
    ['Al recargar, a veces la página nueva se juntaba con los estilos viejos guardados en el navegador (por ejemplo, la frase del título salía en grande pegada a «PokéSurvivor»). Ya no pasa.',
     'When reloading, the new page sometimes got mixed with the old styles saved in the browser (for example, the title line showed up big and stuck to "PokéSurvivor"). That no longer happens.']
  ] },
  { d: '2026-10-18', title: ['Físico y especial, mando, botón Guardar y rankings desde cero', 'Physical and special, controller, Save button and fresh leaderboards'], new: [
    ['Ataques físicos y especiales, como en los juegos: cada Pokémon tiene su Ataque, Ataque Especial, Defensa y Defensa Especial. Los ataques físicos pegan con su Ataque y los especiales con su Ataque Especial: Machamp pega fuerte con Golpe Kárate y flojo con Bola Sombra. Con los de su lado bueno pega lo mismo que antes. Al subir de nivel, cada carta dice si el ataque es físico o especial y cuánto rinde con tu Pokémon, y en la colección se ven todas sus estadísticas.',
     'Physical and special moves, like in the games: every Pokémon has its Attack, Special Attack, Defense and Special Defense. Physical moves use its Attack and special moves its Special Attack: Machamp hits hard with Karate Chop and weakly with Shadow Ball. With moves on its strong side it hits as hard as before. When leveling up, each card says whether the move is physical or special and how well it works with your Pokémon, and the collection shows all its stats.'],
    ['Danza Espada y Danza Dragón suben sólo el Ataque (físico), como en los juegos, y llega Maquinación, que sube el Ataque Especial y la puede aprender cualquier Pokémon. Al subir de nivel, los ataques del lado bueno de tu Pokémon salen el doble de a menudo.',
     'Swords Dance and Dragon Dance now raise only (physical) Attack, like in the games, and Nasty Plot arrives, raising Special Attack, learnable by any Pokémon. When leveling up, moves on your Pokémon’s strong side show up twice as often.'],
    ['Resumen de la partida en la pausa: cada ataque con su categoría, el daño que lleva hecho y su daño por segundo; tus estadísticas con todo lo que has subido; y el objeto y las cartas de mejora que llevas.',
     'Run summary in the pause screen: each move with its category, the damage it has dealt and its damage per second; your stats with everything you have raised; and your item and the upgrade cards you have.'],
    ['Las defensas también cuentan (un poco): los enemigos se defienden de tus ataques físicos con su Defensa y de los especiales con su Defensa Especial, y cada enemigo te pega con su lado fuerte, que paras con tu Defensa o tu Defensa Especial.',
     'Defenses count too (a little): enemies resist your physical moves with their Defense and special moves with their Special Defense, and each enemy hits you with its strong side, which you block with your Defense or Special Defense.'],
    ['Ya se puede jugar con mando (Xbox, PlayStation, Switch y la mayoría de mandos USB o Bluetooth): moverte, cambiar de ataque, pausar, elegir cartas y manejar todos los menús, con vibración al recibir daño. Se configura en Ajustes > Controles.',
     'You can now play with a controller (Xbox, PlayStation, Switch and most USB or Bluetooth controllers): move, switch attacks, pause, pick cards and use every menu, with vibration when you take damage. Set it up in Settings > Controls.'],
    ['Colección: buscador por nombre o número, pestaña con todas las generaciones, filtros que se combinan (tengo / me faltan, varias rarezas a la vez, shiny, favoritos y tipo) y orden por número, nombre, rareza, recién conseguidos o más usados. Y favoritos: márcalos en la ficha de cada Pokémon; van con tu cuenta, en todos tus aparatos.',
     'Collection: search by name or number, a tab with every generation, filters that combine (owned / missing, several rarities at once, shiny, favorites and type) and sorting by number, name, rarity, recently caught or most played. Plus favorites: mark them on each Pokémon’s page; they go with your account, on all your devices.'],
    ['Nueva pestaña Accesibilidad en Ajustes con «Apuntar a mano»: tus ataques van hacia el ratón o hacia donde empujes el stick derecho del mando, en vez de al enemigo más cercano. Viene desactivado.',
     'New Accessibility tab in Settings with “Manual aim”: your attacks go towards the mouse or wherever you push the controller’s right stick, instead of the nearest enemy. It is off by default.'],
    ['Botón Guardar arriba a la derecha: sube tu partida a la nube al momento. Úsalo antes de cerrar el juego o de cambiar de aparato.',
     'Save button at the top right: it uploads your game to the cloud right away. Use it before closing the game or switching devices.']
  ], chg: [
    ['Las cartas de nivel, de vínculo y de objeto no se pueden elegir durante un momento al aparecer (se ven apagadas): pulsar 1-4 o tocar la pantalla para cambiar de ataque en plena pelea ya no elige una carta sin querer.',
     'Level-up, bond and item cards can’t be picked for a moment after they appear (they look dimmed): pressing 1-4 or tapping to switch attacks mid-fight no longer picks a card by accident.'],
    ['Con mando ya se pueden elegir en la colección los Pokémon que aún no tienes, y en el móvil las pestañas de Ajustes caben en una fila que se desliza.',
     'With a controller you can now select the Pokémon you don’t have yet in the collection, and on mobile the Settings tabs fit in one row that scrolls sideways.'],
    ['La partida se guarda en la nube automáticamente cada 10 minutos.',
     'Your game is saved to the cloud automatically every 10 minutes.'],
    ['Ranking histórico: si estás por debajo del puesto 1.000, sale «#1000+» en vez del número exacto.',
     'All-time leaderboard: if you are below rank 1,000, it shows “#1000+” instead of the exact number.'],
    ['Los Pokémon grandes (Onix, Gyarados, Wailord, Eternatus, los legendarios...) ya se pueden jugar bien: se ven algo más pequeños, aunque siguen siendo de los más grandes, y chocan como uno normal, así que caben por todos los pasillos y no reciben más golpes por su tamaño.',
     'Big Pokémon (Onix, Gyarados, Wailord, Eternatus, the legendaries...) are now properly playable: they look a bit smaller, while still being among the biggest, and collide like a normal one, so they fit through every corridor and don’t take extra hits because of their size.'],
    ['Como mucho hay 3 curanderos, 3 escuderos y 3 invocadores a la vez.',
     'There are at most 3 healers, 3 shielders and 3 summoners at a time.'],
    ['Los curanderos y escuderos ya no hacen inmatable a un jefe: lo que le curan y el escudo que le ponen van con el daño que le estás haciendo, y sólo recibe un escudo cada 6 segundos.',
     'Healers and shielders no longer make a boss unkillable: their healing and shields scale with the damage you are dealing to it, and it only gets one shield every 6 seconds.'],
    ['Sentencia de Arceus: la velocidad tiene un tope suave (lo que pase de cierto punto cuenta mucho menos) y los legendarios corren casi tanto como tú. Desde los 5 minutos de Sentencia Arceus acelera sin parar, y desde los 7 su toque quita cada vez más vida, hasta dejarte KO de un golpe hacia el minuto 40.',
     'Judgment of Arceus: speed has a soft cap (anything above a certain point counts much less) and legendaries run almost as fast as you. After 5 minutes of Judgment, Arceus keeps speeding up, and after 7 its touch takes more and more HP, until it knocks you out in one hit around minute 40.'],
    ['El veneno sigue quitando un porcentaje de la vida, pero contra enemigos con muchísima vida (los legendarios de la Sentencia) ese porcentaje es menor.',
     'Poison still takes a percentage of HP, but against enemies with huge HP (the Judgment legendaries) that percentage is smaller.'],
    ['Todos los rankings empiezan de cero (hoy, semana, mes, año e histórico): las marcas de huir de Arceus ya no se podrían alcanzar.',
     'All leaderboards start from scratch (daily, weekly, monthly, yearly and all-time): records from running away from Arceus could no longer be reached.']
  ], fix: [
    ['Seguridad: se ha cerrado un agujero por el que alguien podía meter código en su fila del ranking o en su perfil y hacer que se ejecutara en el navegador de quien los abría (a algunos les llevaba a un vídeo). Ahora todo lo que viene de otros jugadores se limpia, el servidor sólo deja guardar lo que debe, y el navegador no ejecuta nada que no sea del juego.',
     'Security: we closed a hole that let someone put code in their leaderboard row or profile and make it run in the browser of whoever opened them (some people were sent to a video). Now everything coming from other players is cleaned, the server only accepts what it should, and the browser runs nothing that isn’t part of the game.'],
    ['En el ranking ya salen en shiny los Pokémon de quien jugó con su shiny.',
     'The leaderboard now shows Pokémon in shiny form for players who played with their shiny.']
  ] },
  { d: '2026-10-15', title: ['Actualizaciones obligatorias', 'Required updates'], chg: [
    ['Cuando una actualización sea obligatoria (por ejemplo, para arreglar un fallo importante), la partida en curso se termina tras un aviso de 10 s y el juego se recarga. No pierdes nada: las monedas, los tickets, los récords y el ranking de esa partida se guardan como al abandonarla.',
     'When an update is required (for example, to fix an important bug), your current run ends after a 10 s notice and the game reloads. You lose nothing: that run’s coins, tickets, records and leaderboard entry are saved as if you had quit.']
  ] },
  { d: '2026-10-14', title: ['Recupera tu cuenta con Gmail', 'Recover your account with Gmail'], new: [
    ['Si juegas con nombre y contraseña, puedes vincular tu Gmail: si un día olvidas la contraseña, entras con Google y es tu misma cuenta. Te lo ofrecemos al entrar.',
     'If you play with a name and password, you can link your Gmail: if you ever forget your password, sign in with Google and it is the same account. We offer it when you sign in.'],
    ['Móvil: ya puedes colocar los botones donde quieras. En Ajustes > Controles > Colocar los botones arrastras los ataques (con el objeto), la pausa y el joystick, que ahora también puede ser fijo en vez de aparecer donde pones el dedo.',
     'Mobile: you can now place the buttons wherever you want. In Settings > Controls > Place the buttons, drag the attacks (with the item), the pause button and the joystick, which can now also be fixed instead of appearing where you put your finger.']
  ], chg: [
    ['Las tablas de la semana y del mes del ranking empiezan de cero, como el histórico: ahora sólo cuentan partidas con la Sentencia de Arceus y todas las tablas cuadran entre sí.',
     'The weekly and monthly leaderboards start from scratch, like the all-time one: now only runs with the Judgment of Arceus count, and all boards match each other.'],
    ['Aviso importante: la única web oficial de PokéSurvivor es pokesurvivor.com. El juego es y será gratis: si alguna otra web te pide pagar (por tickets, monedas o lo que sea), no somos nosotros. Lo verás también al entrar y en el Aviso legal.',
     'Important: the only official PokéSurvivor website is pokesurvivor.com. The game is and always will be free: if any other website asks you to pay (for tickets, coins or anything else), it isn’t us. You will also see this when signing in and in the Legal notice.'],
    ['El código del juego pasa a una licencia no comercial (PolyForm Noncommercial 1.0.0): se puede seguir estudiando y modificando, pero nadie puede cobrar por él.',
     'The game’s code moves to a non-commercial license (PolyForm Noncommercial 1.0.0): you can still study and modify it, but nobody may charge for it.']
  ], fix: [
    ['Cooperativo: la partida ya no se queda parada con cada uno esperando a que el otro elija. Un objeto y las cartas de nivel ya no se tapan, y si la conexión pierde un aviso se arregla solo.',
     'Co-op: the game no longer freezes with each player waiting for the other to choose. An item and the level-up cards no longer cover each other, and if the connection drops a message it fixes itself.'],
    ['Cooperativo: al volver de una grieta, quien no era el anfitrión ya ve a todos los enemigos (antes algunos eran invisibles y sólo se veían sus ataques).',
     'Co-op: after coming back from a rift, players who are not the host can see every enemy again (some used to be invisible, with only their attacks showing).'],
    ['Amigos: si tu móvil u ordenador tiene la hora (o la zona horaria) mal puesta, tus amigos ya no salen siempre desconectados y sus invitaciones te llegan.',
     'Friends: if your phone or computer has the wrong time (or time zone), your friends no longer always show as offline and their invitations reach you.'],
    ['Jugar en dos aparatos (PC y móvil) ya no hace perder monedas ni tickets: antes, si uno tenía la partida abierta con datos viejos y guardaba, borraba lo ganado en el otro. Ahora se suma lo de los dos. Y al volver al juego tras un rato fuera, se trae lo conseguido en el otro aparato (Pokémon, shinies...) sin recargar.',
     'Playing on two devices (PC and phone) no longer loses coins or tickets: before, if one had the game open with old data and saved, it erased what you earned on the other. Now both are added up. And when you come back to the game after a while away, it brings in what you got on the other device (Pokémon, shinies...) without reloading.'],
    ['Los avisos grandes de la partida (un Gholdengo cerca, una marea...) ya salen siempre centrados.',
     'Big in-game announcements (a nearby Gholdengo, a swarm...) are always centered now.']
  ] },
  { d: '2026-10-13', title: ['La Sentencia de Arceus', 'The Judgment of Arceus'], new: [
    ['La Sentencia de Arceus: al llegar al minuto 30, Arceus baja del cielo y te lleva a las Ruinas del Juicio. Es invencible, te persigue cada vez más deprisa y lanza pilares de luz, rayos y ondas; si te toca, te quita casi media vida. Cada 5 segundos acude un legendario con el doble de vida y de daño que el anterior. ¿Cuánto aguantarás?',
     'The Judgment of Arceus: at minute 30, Arceus descends from the sky and takes you to the Ruins of Judgment. It is invincible, chases you faster and faster and casts pillars of light, beams and shockwaves; if it touches you, you lose almost half your HP. Every 5 seconds a legendary joins, each with twice the HP and damage of the previous one. How long can you last?'],
    ['Tres logros nuevos: La Sentencia (llega al minuto 30), Ante el Creador (aguanta 1 minuto ante Arceus) y Desafío divino (derrota a 3 legendarios ante Arceus en una partida).',
     'Three new achievements: The Judgment (reach minute 30), Before the Creator (survive 1 minute against Arceus) and Divine challenge (defeat 3 legendaries against Arceus in a single run).'],
    ['Música nueva para la pelea contra Arceus.', 'New music for the fight against Arceus.'],
    ['Botón para reportar marcas sospechosas en el ranking (la banderita de cada fila).',
     'A button to report suspicious records on the leaderboard (the little flag on each row).']
  ], chg: [
    ['El ranking histórico empieza de cero: ahora que las partidas acaban ante Arceus, las marcas de antes ya no se podrían alcanzar. Las tablas de hoy, de la semana y del mes siguen igual.',
     'The all-time leaderboard starts from scratch: now that runs end against Arceus, older records could no longer be reached. The daily, weekly and monthly boards are unchanged.'],
    ['Se quita el tiempo extra del minuto 60 (ya no se llega hasta ahí).',
     'Overtime from minute 60 is removed (runs no longer get that far).'],
    ['Desde el minuto 28 ya no se abren grietas, para que la Sentencia no te pille dentro de una.',
     'Rifts no longer open from minute 28 on, so the Judgment does not catch you inside one.'],
    ['Ranking protegido contra trampas: el servidor comprueba que cada marca se ha jugado de verdad. Nunca se pierde nada de lo que ganas jugando.',
     'Leaderboard protected against cheating: the server checks that every record was really played. You never lose anything you earn by playing.'],
    ['Se han quitado del ranking las marcas de más de 35 minutos: con la Sentencia de Arceus ya no son posibles.',
     'Records over 35 minutes have been removed from the leaderboard: with the Judgment of Arceus they are no longer possible.']
  ], fix: [
    ['Las tiradas del gacha, los Pokémon nuevos y los premios se guardan en la nube al momento. Si abriste el juego en otro aparato o navegador y te faltaba algo, vuelve a abrirlo donde lo conseguiste: se recupera solo.',
     'Gacha pulls, new Pokémon and rewards are saved to the cloud right away. If you opened the game on another device or browser and something was missing, open it again where you got it: it comes back on its own.']
  ] },
  { d: '2026-10-12', title: ['Tiempo extra y grietas con menos azar', 'Overtime and less random rifts'], new: [
    ['Tiempo extra: desde el minuto 60 los Pokémon salvajes se vuelven cada vez más fuertes (más vida y más daño), y cada vez más deprisa. Antes, con las mejoras al máximo, algunas partidas no acababan nunca; ahora las mejores rondarán la hora y media.',
     'Overtime: from minute 60 on, wild Pokémon keep getting stronger (more HP and more damage), faster and faster. Before, with maxed upgrades, some runs never ended; now the best ones will last about an hour and a half.'],
    ['El juego se actualiza solo cuando sale una versión nueva: si estás en el menú, a los 5 segundos; si estás jugando, al acabar la partida (sin perder nada).',
     'The game now updates itself when a new version is out: within 5 seconds if you are in the menu, or after your run if you are playing (without losing anything).'],
    ['Botón de Novedades (esta ventana) con todos los cambios del juego.',
     'A "What\'s new" button (this window) with every change to the game.'],
    ['Números más fáciles de leer: el 2, el 5 y el 8 ya no se confunden.',
     'Easier to read numbers: 2, 5 and 8 no longer look alike.'],
    ['Elige la versión normal o shiny de tu compañero desde el menú principal, debajo de él.',
     'Pick the normal or shiny version of your partner right from the main menu, under it.'],
    ['Mejoras nuevas para cada Pokémon: Golpe Crítico (+3 % de críticos por nivel, que hacen x1,5 de daño), Cambio de cartas (+1 cambio de las cartas de nivel por run) y Veto (bloquea movimientos para que no te salgan en las cartas; se eligen en Mejoras).',
     'New upgrades for each Pokémon: Critical Hit (+3% critical chance per level, crits deal x1.5 damage), Card reroll (+1 level-up card reroll per run) and Ban (block moves so they never show up in your cards; pick them in Upgrades).'],
    ['Atajos de movimientos (en Mejoras, para cada Pokémon): elige qué movimiento va siempre en cada hueco, por ejemplo Confusión siempre en el 1, para la memoria muscular.',
     'Move shortcuts (in Upgrades, for each Pokémon): choose which move always goes in each slot, for example Confusion always on 1, for muscle memory.']
  ], chg: [
    ['Avalancha hace menos daño (21 en vez de 26): derrotaba casi el doble que la media de los movimientos.',
     'Rock Slide deals less damage (21 instead of 26): it defeated almost twice as many as the average move.'],
    ['Los cambios de cartas de nivel ya no se ganan venciendo jefes: tienes 1 gratis por run y el resto se compra en Mejoras.',
     'Level-up card rerolls are no longer earned by defeating bosses: you get 1 free per run and can buy more in Upgrades.'],
    ['Los legendarios de grieta ya no dan siempre tickets x10: dan uno la mitad de las veces (antes daban 2 siempre y salían demasiados).',
     'Rift legendaries no longer always drop x10 tickets: they drop one half of the time (they used to always drop 2, which was too many).'],
    ['Cooperativo: si vuestras redes no consiguen conectar entre sí, la sala lo avisa y lo reintenta sola, en vez de jugar a tirones por un servidor lento.',
     'Co-op: if your networks cannot connect to each other, the room says so and keeps retrying, instead of playing laggy through a slow server.'],
    ['Hemos cambiado de servidores para que el juego siga siendo gratis: puede que tengas que volver a iniciar sesión (con la misma cuenta y contraseña, o con Google). Tu partida y tus Pokémon siguen igual.',
     'We moved to new servers so the game can stay free: you may need to sign in again (with the same account and password, or with Google). Your save and your Pokémon are unchanged.'],
    ['Gacha: los shiny ya no salen repetidos. Si te toca uno que ya tienes, sale otro de la misma rareza que te falte.',
     'Gacha: shinies no longer come out as duplicates. If you roll one you already have, you get another of the same rarity that you are missing.'],
    ['Grietas con menos azar: cada vez que no sale una, la siguiente es más probable (como mucho 2,5 minutos sin grieta).',
     'Less random rifts: every time one does not show up, the next one is more likely (at most 2.5 minutes without a rift).'],
    ['Los legendarios que aún no has vencido salen 4 veces más en las grietas.',
     'Legendaries you have not beaten yet show up 4 times as often in rifts.'],
    ['Los curanderos curan más cuanto más fuerte pegas, pero cada vez menos y con un tope (como mucho el 2,5x).',
     'Healers heal more the harder you hit, but with diminishing returns and a cap (2.5x at most).'],
    ['Ataques cuerpo a cuerpo más fuertes: mientras llevas uno activo recibes un 25 % menos de daño, llegan un 25 % más lejos y hacen un 20 % más de daño.',
     'Stronger melee attacks: while one is active you take 25% less damage, and they reach 25% further and deal 20% more damage.'],
    ['Cooperativo: al elegir con qué objeto quedarte, la partida se para para todos (antes seguía y te pegaban mientras elegías).',
     'Co-op: choosing which held item to keep now pauses the run for everyone (it used to keep going and you got hit while choosing).'],
    ['Cooperativo: mientras alguien elige una fusión, la partida se para para todos.',
     'Co-op: while someone is choosing a fusion, the run pauses for everyone.'],
    ['Cooperativo: si el anfitrión cambia de pestaña o se le para el juego, la partida se pausa para todos hasta que vuelva.',
     'Co-op: if the host switches tabs or their game stalls, the run pauses for everyone until they are back.'],
    ['Las runs de menos de 1 minuto ya no cuentan para el ranking.',
     'Runs shorter than 1 minute no longer count for the leaderboard.']
  ], fix: [
    ['Quitadas del ranking las marcas rotas por el fallo del minuto 84 (el reloj seguía corriendo con el juego parado) y alguna imposible. Si tenías una, tu próxima partida vuelve a contar.',
     'Removed broken records from the leaderboard caused by the minute 84 bug (the clock kept running while the game was frozen) and a few impossible ones. If you had one, your next run counts again.'],
    ['iPhone (Safari y Chrome): a veces no se podía cambiar de movimiento tocando los iconos, sobre todo con el otro dedo en el joystick. Además los botones quedan por encima de la barra de inicio.',
     'iPhone (Safari and Chrome): sometimes you could not switch moves by tapping the icons, especially with your other finger on the joystick. Buttons also sit above the home bar now.'],
    ['En las partidas de más de 84 minutos la pantalla se quedaba en negro, el juego se paraba o empezabas a subir de nivel sin fin. Ya puedes jugar todo lo que aguantes.',
     'In runs longer than 84 minutes the screen went black, the game froze or you kept levelling up forever. Now you can play for as long as you survive.'],
    ['Si el juego fallara, la partida se cierra sola y se guarda (tiempo, derrotados, récords y ranking) en vez de perderse.',
     'If the game ever crashes, the run ends by itself and is saved (time, defeated, records and leaderboard) instead of being lost.'],
    ['Las partidas muy largas a veces se tomaban por trampas y no contaban para el ranking.',
     'Very long runs were sometimes flagged as cheating and did not count for the leaderboard.'],
    ['Cooperativo: si el anfitrión cambiaba de pestaña, los enemigos se quedaban quietos y los demás jugaban con ventaja.',
     'Co-op: if the host switched tabs, enemies stood still and everyone else got a free advantage.'],
    ['iPhone: mantener el dedo en el joystick sacaba "Copiar / Seleccionar todo".',
     'iPhone: holding your finger on the joystick brought up "Copy / Select all".'],
    ['iPhone: a veces no salía la pantalla completa. Ahora el botón explica cómo tenerla (Compartir y "Añadir a pantalla de inicio").',
     'iPhone: fullscreen sometimes did not show up. Now the button explains how to get it (Share and "Add to Home Screen").']
  ] },
  { d: '2026-10-11', title: ['Vínculos', 'Bonds'], new: [
    ['Vínculos: al vencer a un legendario fusionas movimientos que se lanzan a la vez desde un solo hueco (hasta 4).',
     'Bonds: defeating a legendary lets you fuse moves that fire at the same time from a single slot (up to 4).'],
    ['Botón para cambiar las cartas de subir de nivel.',
     'A button to reroll the level-up cards.']
  ], chg: [
    ['Más grietas.', 'More rifts.'],
    ['Movimientos psíquicos y curanderos más flojos.', 'Weaker psychic moves and healers.'],
    ['Las mejoras de las cartas de nivel (velocidad, recarga, experiencia, imán, coraza y potencia) tienen un tope de veces.',
     'Level-up card upgrades (speed, cooldown, experience, magnet, armor and power) can only be taken a limited number of times.'],
    ['En el móvil, la ficha del Pokémon sale al lado; entrar es más rápido y el gacha x10 se puede cerrar.',
     'On mobile, the Pokémon details show alongside; logging in is faster and the x10 gacha can be closed.']
  ], fix: [
    ['Pantalla negra en partidas de más de una hora por llenarse la memoria de imágenes.',
     'Black screen in runs longer than an hour because image memory filled up.'],
    ['Los tickets se perdían si se cerraba la pestaña antes de acabar la partida: ahora se guardan al cogerlos.',
     'Tickets were lost if the tab closed before the run ended: now they are saved as soon as you pick them up.'],
    ['Una mejora comprada justo después de guardar se cobraba y no se apuntaba.',
     'An upgrade bought right after saving was charged but not applied.'],
    ['El juego se quedaba congelado para siempre si algo fallaba a mitad de partida.',
     'The game froze forever if something went wrong mid-run.']
  ] },
  { d: '2026-10-10', title: ['Más reto', 'More challenge'], new: [
    ['Jefes y legendarios con 4 ataques avisados que se enfurecen a media vida.',
     'Bosses and legendaries with 4 telegraphed attacks that get enraged at half health.'],
    ['12 movimientos nuevos y 8 formas de atacar nuevas: bumerán, cadena, minas, meteoros, torreta, embestida, rastro y abanico.',
     '12 new moves and 8 new ways to attack: boomerang, chain, mines, meteors, turret, dash, trail and spray.'],
    ['Eventos a mitad de partida (hordas de un tipo, hora dorada, Pokémon perdidos) y Meowth y Gholdengo que huyen cargados de monedas.',
     'Mid-run events (single-type hordes, golden hour, lost Pokémon) and Meowth and Gholdengo running away loaded with coins.'],
    ['Estatuas para los Pokémon grandes.', 'Statues for big Pokémon.']
  ], chg: [
    ['Más difícil: menos enemigos pero más duros.', 'Harder: fewer but tougher enemies.'],
    ['Subir de nivel es más lento, los tickets son más raros y los jefes dan ticket x10 una de cada tres veces.',
     'Levelling up is slower, tickets are rarer and bosses drop a x10 ticket one time in three.'],
    ['Carga más rápida.', 'Faster loading.']
  ], fix: [
    ['Los enemigos rezagados desaparecían delante de ti: ahora sólo fuera de la vista.',
     'Straggling enemies vanished in front of you: now only off-screen.'],
    ['Los menús y pantallas se montaban encima de la barra de arriba.',
     'Menus and screens overlapped the top bar.']
  ] },
  { d: '2026-10-09', title: ['Móvil e inglés', 'Mobile and English'], new: [
    ['Se puede jugar en móvil y tablet con joystick táctil, e instalar como app.',
     'Play on phones and tablets with a touch joystick, and install it as an app.'],
    ['El juego, en español y en inglés.', 'The game in English and Spanish.'],
    ['Pantalla de ajustes con calidad gráfica automática.', 'Settings screen with automatic graphics quality.']
  ], chg: [
    ['Menos enemigos en pantalla pero más fuertes.', 'Fewer but stronger enemies on screen.'],
    ['Gigadrenado pasa a ser Hierba Lazo (ya no cura).', 'Giga Drain becomes Grass Knot (no more healing).']
  ] },
  { d: '2026-10-08', title: ['Misiones, grietas y cooperativo', 'Missions, rifts and co-op'], new: [
    ['Misiones diarias y semanales, logros con medallas y títulos, y perfil público.',
     'Daily and weekly missions, achievements with medals and titles, and a public profile.'],
    ['Objetos equipables, evoluciones de movimientos y enemigos que curan, protegen, invocan o explotan.',
     'Held items, move evolutions and enemies that heal, shield, summon or explode.'],
    ['Grietas que llevan a 18 arenas legendarias, una por tipo, y clima que cambia la batalla.',
     'Rifts leading to 18 legendary arenas, one per type, and weather that changes the fight.'],
    ['Cooperativo con tu lista de amigos y ranking.', 'Co-op with your friends list and leaderboards.'],
    ['Mejoras para cada Pokémon, gacha tragaperras con tickets y tabla de tipos.',
     'Upgrades for each Pokémon, a slot-machine ticket gacha and a type chart.']
  ], chg: [
    ['Cámara más lejos y enemigos que rodean los obstáculos.', 'Camera further out and enemies that walk around obstacles.']
  ] },
  { d: '2026-10-07', title: ['Primera versión', 'First version'], new: [
    ['Primera versión pública de PokéSurvivor.', 'First public version of PokéSurvivor.']
  ] }
];
