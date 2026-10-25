/* ============ hud.js — interfaz dentro del canvas ============
 * Se dibuja en coordenadas de PANTALLA (sin la transformación de cámara).
 */
G.HUD = (() => {
  // (Accesibilidad: el tamaño del texto se puede agrandar en Ajustes.)
  const F = (w, s) => `${w} ${Math.round(s * (G.Settings.get('hudScale') || 1))}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  /** Cartel encima de una esfera: su nombre y, con el ratón encima, también lo que hace. */
  function orbTip(ctx, id, cx, by, full, w) {
    const o = G.Orbs.BY[id], name = G.T(o.name);
    const lines = [];
    if (full) {
      ctx.font = F(600, 11);
      let cur = '';
      for (const word of G.T(o.desc).split(' ')) {
        const t = cur ? cur + ' ' + word : word;
        if (ctx.measureText(t).width > 240 && cur) { lines.push(cur); cur = word; } else cur = t;
      }
      if (cur) lines.push(cur);
    }
    ctx.font = F(800, 12);
    let bw = ctx.measureText(name).width;
    ctx.font = F(600, 11);
    for (const l of lines) bw = Math.max(bw, ctx.measureText(l).width);
    bw += 16;
    const bh = 20 + lines.length * 14, bx = G.U.clamp(cx - bw / 2, 4, w - bw - 4), y = by - bh;
    ctx.save();
    roundRect(ctx, bx, y, bw, bh, 8);
    ctx.fillStyle = 'rgba(10,14,28,.92)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = o.col; ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = F(800, 12); ctx.fillStyle = o.col;
    ctx.fillText(name, bx + bw / 2, y + 14);
    ctx.font = F(600, 11); ctx.fillStyle = '#e6ecff';
    lines.forEach((l, k) => ctx.fillText(l, bx + bw / 2, y + 28 + k * 14));
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function bar(ctx, x, y, w, h, frac, col, bg = 'rgba(0,0,0,.55)') {
    roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    if (frac > 0) {
      ctx.save();
      roundRect(ctx, x, y, w, h, h / 2); ctx.clip();
      ctx.fillStyle = col;
      ctx.fillRect(x, y, w * G.U.clamp(frac, 0, 1), h);
      ctx.restore();
    }
  }

  function draw(ctx, w, h, pl, st) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    G.Touch.clearButtons();
    const touch = G.Touch.active;

    // ---------- barra de experiencia (borde superior) ----------
    // (25-10-2026: más gruesa, y destella cuando estás a punto de subir.)
    const xpF = pl.xp / pl.xpNext, XH = 10;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, 0, w, XH);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#4fd1ff'); g.addColorStop(1, '#a98bff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w * G.U.clamp(xpF, 0, 1), XH);
    if (xpF > 0.88) {
      ctx.save();
      ctx.globalAlpha = 0.25 + Math.sin(performance.now() / 110) * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w * G.U.clamp(xpF, 0, 1), XH);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(0, XH - 1, w, 1);

    // ---------- vida + nivel ----------
    const sa = G.Touch.safeArea();
    const px = 16 + sa.left, py = 20 + sa.top;     // lejos de la muesca del iPhone
    ctx.font = F(800, 13);
    ctx.fillStyle = '#eaf2ff';
    ctx.textAlign = 'left';
    ctx.fillText(pl.mon.name, px, py + 10);
    // Revivir guardado: su icono al lado del nombre.
    if (pl.revives > 0) G.Icons.draw(ctx, 'revive', px + ctx.measureText(pl.mon.name).width + 6, py - 2, 14);

    ctx.font = F(700, 11);
    ctx.fillStyle = '#ffcb3d';
    ctx.fillText('Nv. ' + pl.level, px, py + 26);

    bar(ctx, px + 48, py + 17, 168, 11, pl.hp / pl.maxHp, '#ff5f6d');
    ctx.font = F(700, 10);
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.textAlign = 'center';
    ctx.fillText(Math.ceil(pl.hp) + ' / ' + Math.round(pl.maxHp), px + 48 + 84, py + 26);

    // buffs activos
    const COL = { atk: '#ff6b4d', patk: '#ff6b4d', satk: '#c47bff', spd: '#7fe0ff', def: '#b0b8c8', regen: '#5fe08a' };
    const LBL = { atk: 'ATK', patk: 'ATK', satk: 'AT.E', spd: 'VEL', def: 'DEF', regen: 'REG' };
    let bx = px;
    ctx.textAlign = 'left';
    for (const k in pl.buffs) {
      const b = pl.buffs[k];
      if (b.n <= 0) continue;
      ctx.font = F(800, 9);
      const txt = LBL[k] + ' ×' + b.n;
      const tw = ctx.measureText(txt).width + 12;
      roundRect(ctx, bx, py + 34, tw, 15, 7);
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
      ctx.fillStyle = COL[k];
      ctx.fillText(txt, bx + 6, py + 45);
      bx += tw + 5;
    }

    // ---------- reloj / bioma / kills ----------
    ctx.textAlign = 'center';
    ctx.font = F(800, 26);
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.fillText(G.U.mmss(st.time), w / 2, 42);
    ctx.font = F(600, 10);
    ctx.fillStyle = '#8fa3c4';
    ctx.fillText(G.Dungeon.active ? G.Dungeon.hudText(pl) + '  ·  ' + pl.coins + ' MONEDAS'
      : G.World.biomeName().toUpperCase() + '  ·  ' + pl.kills + ' DERROTADOS  ·  ' + pl.coins + ' MONEDAS', w / 2, 58);

    // ---------- clima (arriba a la derecha) ----------
    const wx = G.Weather.current;
    if (wx) {
      ctx.font = F(800, 11);
      ctx.textAlign = 'left';
      const txt = wx.name.toUpperCase() + ' · ' + Math.ceil(wx.left) + 's';
      const tw = ctx.measureText(txt).width + 40;
      const x0 = w - tw - 16 - sa.right - (touch ? 56 : 0), y0 = 14 + sa.top;
      roundRect(ctx, x0, y0, tw, 26, 9);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
      G.Icons.draw(ctx, wx.icon, x0 + 6, y0 + 3, 20);
      ctx.fillStyle = wx.color;
      ctx.fillText(txt, x0 + 32, y0 + 17);
    }

    // ---------- barra del jefe ----------
    // (25-10-2026: una barra por jefe, hasta 3 a la vez: grieta verde, jefe de zona + jefe...)
    const bosses = G.EnemyMgr.all().filter(e => e.boss && !e.dead && !e.arceus)
      .sort((a, b) => (b.legend ? 1 : 0) - (a.legend ? 1 : 0) || b.maxHp - a.maxHp);
    const boss = bosses[0];
    let bossBottom = 0;
    if (boss) {
      const n = Math.min(3, bosses.length), bw = Math.min(420, w - 80) * (n > 1 ? 0.8 : 1);
      for (let i = 0; i < n; i++) {
        const e = bosses[i], bh = n > 1 ? 10 : 12, y = 70 + i * (bh + 6);
        bar(ctx, (w - bw) / 2, y, bw, bh, e.hp / e.maxHp, e.zoneBoss != null ? G.ZoneBoss.color(e.zoneBoss) : e.legend ? '#c9a6ff' : '#ffcb3d');
        ctx.font = F(800, n > 1 ? 9 : 10);
        ctx.fillStyle = '#20160a';
        ctx.textAlign = 'center';
        ctx.fillText(e.name.toUpperCase() + (e.ai && e.ai.fury ? ' !' : ''), w / 2, y + bh - 2);
        bossBottom = y + bh;
      }
      if (bosses.length > 3) {
        ctx.font = F(700, 9); ctx.fillStyle = '#ffcb3d';
        ctx.fillText('+' + (bosses.length - 3), w / 2 + bw / 2 + 14, bossBottom - 2);
      }
    }

    // ---------- aviso ----------
    // ---------- shinies fuera de pantalla: destello en el borde ----------
    const cam = G.Camera, pulse = 0.6 + Math.sin(performance.now() / 160) * 0.4;
    for (const e of G.EnemyMgr.shinies()) {
      const sx = (e.x - cam.left()) * cam.scale, sy = (e.y - cam.top()) * cam.scale;
      if (sx > 0 && sx < w && sy > 0 && sy < h) continue;
      const M = 34;
      const ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 60, h - M - 70);
      const a = Math.atan2(sy - ey, sx - ex);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.translate(ex, ey);
      ctx.fillStyle = '#9ae6ff';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
      ctx.lineTo(Math.cos(a + 2.5) * 12, Math.sin(a + 2.5) * 12);
      ctx.lineTo(Math.cos(a - 2.5) * 12, Math.sin(a - 2.5) * 12);
      ctx.fill();
      ctx.globalAlpha = 1;
      G.Icons.draw(ctx, 'shiny', -12, -12, 24);
      ctx.restore();
    }
    // Cofre dorado y jefes fuera de pantalla: flecha en el borde con su icono y distancia (25-10-2026).
    const edge = (wx, wy, color, icon, label) => {
      const sx = (wx - cam.left()) * cam.scale, sy = (wy - cam.top()) * cam.scale;
      if (sx > 0 && sx < w && sy > 0 && sy < h) return;
      const M = 40, ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 70, h - 150), a = Math.atan2(sy - ey, sx - ex);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.2832); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28);
      ctx.lineTo(Math.cos(a + 0.5) * 17, Math.sin(a + 0.5) * 17);
      ctx.lineTo(Math.cos(a - 0.5) * 17, Math.sin(a - 0.5) * 17);
      ctx.fill();
      ctx.globalAlpha = 1;
      G.Icons.draw(ctx, icon, -11, -11, 22);
      ctx.font = F(800, 9); ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.strokeText(label, 0, 30); ctx.fillStyle = color; ctx.fillText(label, 0, 30);
      ctx.restore();
    };
    const dist = (x, y) => Math.round(G.U.dist(pl.x, pl.y, x, y) / 32) + ' m';
    const gc = G.GoldChest.chest;
    if (gc) edge(gc.x, gc.y - 20, '#ffd23f', 'gchest', dist(gc.x, gc.y));
    for (const e of bosses) {
      if (e.legend && G.Rift.inArena) continue;
      edge(e.x, e.y - 20, e.zoneBoss != null ? G.ZoneBoss.color(e.zoneBoss) : '#ff8a5a', 'crown', dist(e.x, e.y));
    }

    // Poder de altar activo.
    if (pl.power) {
      const pw = pl.power, txt = pw.def.name.toUpperCase() + ' ' + Math.ceil(pw.t) + 's';
      ctx.font = F(800, 9);
      ctx.textAlign = 'left';
      const tw = ctx.measureText(txt).width + 12;
      roundRect(ctx, bx, py + 34, tw, 15, 7);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
      ctx.fillStyle = pw.def.color;
      ctx.fillText(txt, bx + 6, py + 45);
      bx += tw + 5;
    }
    // Más efectos activos (25-10-2026): objeto, camino, temporada, talento y maestría.
    const chip = (label, color, icon) => {
      ctx.font = F(800, 9); ctx.textAlign = 'left';
      const tw = ctx.measureText(label).width + 12 + (icon ? 14 : 0);
      if (bx + tw > px + 330) return;
      roundRect(ctx, bx, py + 34, tw, 15, 7);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
      if (icon) G.Icons.draw(ctx, icon, bx + 3, py + 35, 13);
      ctx.fillStyle = color;
      ctx.fillText(label, bx + 6 + (icon ? 13 : 0), py + 45);
      bx += tw + 5;
    };
    if (pl.revives > 0) chip(G.T('REVIVIR') + (pl.revives > 1 ? ' ×' + pl.revives : ''), '#ffe680', 'revive');
    if (pl.item && G.Items.BY[pl.item]) chip(G.T(G.Items.BY[pl.item].name).toUpperCase(), '#ffd23f', pl.item);
    if (pl.path) { const pa = G.Paths.PATHS.find(x => x.id === pl.path); if (pa) chip(G.T(pa.title).toUpperCase(), pa.color, pa.icon); }
    if (pl.season) chip(G.T('TEMPORADA') + ' +10%', '#c9a6ff', 'medal3');
    if (pl.mastery > 0) chip(G.T('MAESTRÍA') + ' +' + pl.mastery + '%', '#7dffa0', null);

    if (G.Coop.active) drawCoop(ctx, w, h, pl, px, py + (bx > px ? 56 : 40));

    // Grieta: flecha grande que late en el borde si no se ve, y si se ve, una
    // flecha que bota encima; en la arena, cuenta atrás.
    const rift = G.Rift.rift;
    if (rift) {
      const sx = (rift.x - cam.left()) * cam.scale, sy = (rift.y - 40 - cam.top()) * cam.scale;
      const now = performance.now() / 1000, beat = 0.5 + Math.sin(now * 7) * 0.5;
      const label = 'GRIETA · ' + Math.round(G.U.dist(pl.x, pl.y, rift.x, rift.y) / 32) + ' m · ' + Math.ceil(rift.ttl) + ' s';
      const off = sx < 0 || sx > w || sy < 0 || sy > h;
      // Grieta verde (3 legendarios): los mismos avisos, en verde.
      const C1 = rift.trio ? '#6dff8a' : '#b48aff', C2 = rift.trio ? '#d0ffd9' : '#e2d0ff', C3 = rift.trio ? '#2fd65a' : '#a06bff', CD = rift.trio ? '#06240f' : '#1a0b33';
      ctx.save();
      if (off) {
        const M = 52, ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 70, h - M - 80);
        const a = Math.atan2(sy - ey, sx - ex), ca = Math.cos(a), sa = Math.sin(a);
        ctx.translate(ex, ey);
        // Halo que late.
        ctx.globalAlpha = 0.18 + beat * 0.22;
        ctx.fillStyle = C1;
        ctx.beginPath(); ctx.arc(0, 0, 30 + beat * 8, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        const tri = (k) => {
          ctx.beginPath();
          ctx.moveTo(ca * 40 * k, sa * 40 * k);
          ctx.lineTo(Math.cos(a + 2.45) * 20 * k, Math.sin(a + 2.45) * 20 * k);
          ctx.lineTo(Math.cos(a - 2.45) * 20 * k, Math.sin(a - 2.45) * 20 * k);
          ctx.closePath();
        };
        tri(1.12); ctx.fillStyle = CD; ctx.fill();
        tri(1); ctx.fillStyle = beat > 0.5 ? C2 : C3; ctx.fill();
        ctx.font = F(800, 12);
        ctx.textAlign = ca > 0.3 ? 'right' : ca < -0.3 ? 'left' : 'center';
        const lx = -ca * 34, ly = -sa * 30 + 4;
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
        ctx.strokeText(label, lx, ly);
        ctx.fillStyle = C2;
        ctx.fillText(label, lx, ly);
      } else {
        // Encima de la grieta: flecha hacia abajo que bota.
        const by = sy - 46 - Math.abs(Math.sin(now * 4)) * 10;
        ctx.translate(sx, by);
        ctx.beginPath(); ctx.moveTo(-15, -12); ctx.lineTo(15, -12); ctx.lineTo(0, 8); ctx.closePath();
        ctx.lineWidth = 4; ctx.strokeStyle = CD; ctx.stroke();
        ctx.fillStyle = beat > 0.5 ? C2 : C3; ctx.fill();
        ctx.font = F(800, 11); ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
        const l2 = 'GRIETA · ' + Math.ceil(rift.ttl) + ' s';
        ctx.strokeText(l2, 0, -18); ctx.fillStyle = C2; ctx.fillText(l2, 0, -18);
      }
      ctx.restore();
    }
    if (G.Rift.inArena) {
      ctx.textAlign = 'center';
      ctx.font = F(800, 12);
      const ar = G.Rift.arena;
      ctx.fillStyle = ar && ar.trio ? '#c2ffd0' : '#d9c2ff';
      ctx.fillText('GRIETA · ' + G.U.mmss(G.Rift.timeLeft), w / 2, boss ? bossBottom + 16 : 76);
    }

    // Eventos: cuenta atrás, flecha al Pokémon perdido / a la marca y a los duendes.
    G.Events.drawHud(ctx, w, h, pl, F);

    // Aviso propio al abrirse una grieta (no lo tapan los otros avisos).
    if (rift && rift.t < 4.5) {
      const a = Math.min(1, rift.t * 4, (4.5 - rift.t) * 2), pop = 1 + Math.max(0, 0.25 - rift.t) * 1.6;
      const y0 = h * 0.2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(w / 2, y0); ctx.scale(pop, pop);
      ctx.font = F(800, 20);
      const t1 = rift.trio ? '¡SE HA ABIERTO UNA GRIETA VERDE!' : '¡SE HA ABIERTO UNA GRIETA!';
      const t2 = rift.trio ? 'Sigue la flecha verde: dentro te esperan 3 legendarios' : 'Sigue la flecha morada: dentro te espera un legendario';
      const bw = Math.min(w - 24, Math.max(ctx.measureText(t1).width, (ctx.font = F(700, 11), ctx.measureText(t2).width)) + 36);
      roundRect(ctx, -bw / 2, -26, bw, 52, 10);
      ctx.fillStyle = rift.trio ? 'rgba(6,36,15,.9)' : 'rgba(26,11,51,.88)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rift.trio ? '#6dff8a' : '#b48aff'; ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = F(800, 20); ctx.fillStyle = rift.trio ? '#d0ffd9' : '#e2d0ff'; ctx.fillText(t1, 0, -2);
      ctx.font = F(700, 11); ctx.fillStyle = rift.trio ? '#a6f5b6' : '#c9b0ff'; ctx.fillText(t2, 0, 16);
      ctx.restore();
    }

    // Avisos apilados (el más nuevo abajo, más grande).
    const bans = G.Spawner.banners();
    bans.forEach((ban, i) => {
      const last = i === bans.length - 1;
      const a = Math.min(1, ban.t * 1.6, ban.age * 5);
      ctx.save();
      ctx.globalAlpha = a * (last ? 1 : 0.85);
      // Siempre centrado (antes heredaba la alineación de lo último dibujado, p.
      // ej. la flecha de un duende del tesoro, y salía descolocado).
      ctx.textAlign = 'center';
      ctx.font = F(800, last ? 22 : 17);
      ctx.fillStyle = '#ffcb3d';
      ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 4;
      const y = h * 0.3 - (bans.length - 1 - i) * 26;
      ctx.strokeText(ban.text, w / 2, y);
      ctx.fillText(ban.text, w / 2, y);
      ctx.restore();
    });

    // ---------- ranura de movimientos ----------
    const S = 54, GAP = 9;
    const n = Math.max(1, pl.slots.length);
    const totalW = n * S + (n - 1) * GAP;
    let sx = (w - totalW) / 2;
    // Por encima de la barra de inicio del iPhone (allí los toques a veces no llegan).
    let sy = h - S - 18 - (touch ? Math.min(28, G.Touch.safeArea().bottom) : 0);
    // En móvil, donde la haya puesto el jugador: el bloque objeto + todos los
    // huecos (aunque aún no estén llenos), por su centro, como en el editor
    // (layout-ui.js); los ataques nuevos van saliendo hacia la derecha.
    const pb = touch && G.Touch.spot('bar');
    if (pb) {
      const nAll = Math.max(n, pl.maxMoves), bw = S + 18 + nAll * S + (nAll - 1) * GAP;
      sx = G.U.clamp(pb[0] * w - bw / 2, 6, Math.max(6, w - bw - 6)) + S + 18;
      sy = G.U.clamp(pb[1] * h - S / 2, 24, h - S - 6);
    }
    const BOND = '#ff8ad8';
    const cdOf = m => m.kind === 'orbit' ? 0 : G.U.clamp(m.t / (m.cd * pl.cdMul), 0, 1);

    for (let i = 0; i < n; i++) {
      const g = pl.slots[i] || [];
      const m = g[0];
      const fused = g.length > 1;
      const on = i === pl.active;
      const x = sx + i * (S + GAP);
      const y = on ? sy - 6 : sy;
      // Tocar (o hacer clic en) un icono activa ese movimiento.
      if (m) G.Touch.addButton(x, y, S, S, () => { if (G.Game.state === 'playing' && pl.active !== i) { pl.setActive(i); G.Audio.sfx('click'); } }, GAP / 2 + 3);
      const col = m ? G.U.TYPE_COLOR[m.type] : '#4a5468';

      // fondo
      roundRect(ctx, x, y, S, S, 12);
      ctx.fillStyle = on ? 'rgba(20,30,50,.95)' : 'rgba(10,16,28,.8)';
      ctx.fill();
      ctx.lineWidth = on ? 2.5 : fused || (m && m.evolved) ? 2 : 1.2;
      // Vínculo: borde rosa. Evolucionado: dorado.
      ctx.strokeStyle = fused ? BOND : m && m.evolved ? '#ffd23f' : on ? col : 'rgba(140,170,210,.22)';
      ctx.stroke();

      if (!m) continue;

      if (fused) {
        // Vínculo: los movimientos en una cuadrícula de 2×2, cada uno con su recarga.
        const C = 22, P = (S - C * 2) / 3;
        g.forEach((gm, k) => {
          const cx = x + P + (k % 2) * (C + P), cy = y + P + Math.floor(k / 2) * (C + P);
          G.Icons.draw(ctx, 'move:' + gm.id, cx, cy, C);
          const f = cdOf(gm);
          if (f > 0) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(cx, cy, C, C * f); }
          if (gm.evolved) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, cy + 0.5, C - 1, C - 1); }
          // Destello al lanzarse.
          const fl = 1 - (performance.now() - (gm.castAt || 0)) / 180;
          if (fl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (fl * 0.55).toFixed(2) + ')'; ctx.fillRect(cx, cy, C, C); }
        });
      } else {
        // recarga: se vacía de abajo a arriba
        const cdFrac = cdOf(m);
        if (cdFrac > 0) {
          ctx.save();
          roundRect(ctx, x, y, S, S, 12); ctx.clip();
          ctx.fillStyle = 'rgba(0,0,0,.6)';
          ctx.fillRect(x, y, S, S * cdFrac);
          ctx.restore();
        }

        // emblema del tipo + insignia de la familia
        G.Icons.draw(ctx, 'move:' + m.id, x + (S - 32) / 2, y + (S - 32) / 2 - 2, 32);

        // nivel del movimiento (puntitos)
        const dots = m.def.maxLvl;
        const dw = 4, dgap = 2;
        const tw = dots * dw + (dots - 1) * dgap;
        for (let d = 0; d < dots; d++) {
          ctx.fillStyle = d < m.lvl ? col : 'rgba(255,255,255,.18)';
          ctx.fillRect(x + (S - tw) / 2 + d * (dw + dgap), y + S - 9, dw, 3);
        }
      }

      // tecla
      ctx.font = F(800, 9);
      ctx.fillStyle = fused ? BOND : on ? col : 'rgba(180,200,230,.6)';
      ctx.textAlign = 'left';
      ctx.fillText(String(i + 1), x + 3, y + 10);

      // nombre encima del activo (con un vínculo: "Ascuas +2")
      if (on) {
        ctx.font = F(700, 10);
        ctx.textAlign = 'center';
        ctx.fillStyle = fused ? BOND : col;
        ctx.fillText(fused ? G.T(m.name, 'move') + ' +' + (g.length - 1) : G.T(m.name, 'move'), x + S / 2, y - 7);
      }
    }

    // ---------- vínculo guardado (aún no hay dos movimientos sueltos) ----------
    if (pl.bonds > 0) {
      const bx = sx + totalW + 12, by = sy + S / 2 - 12;
      G.Icons.draw(ctx, 'bond', bx, by, 24);
      if (pl.bonds > 1) {
        ctx.font = F(800, 10);
        ctx.textAlign = 'left';
        ctx.fillStyle = BOND;
        ctx.fillText('×' + pl.bonds, bx + 25, by + 20);
      }
    }

    // ---------- objeto equipado (a la izquierda de los movimientos) ----------
    {
      const ix = sx - S - 18, iy = sy;
      roundRect(ctx, ix, iy, S, S, 12);
      ctx.fillStyle = pl.item ? 'rgba(40,30,10,.9)' : 'rgba(10,16,28,.55)';
      ctx.fill();
      ctx.lineWidth = pl.item ? 2 : 1;
      ctx.strokeStyle = pl.item ? '#ffd23f' : 'rgba(140,170,210,.18)';
      ctx.stroke();
      if (pl.item) {
        G.Icons.draw(ctx, pl.item, ix + (S - 36) / 2, iy + (S - 36) / 2, 36);
        ctx.font = F(700, 9);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd23f';
        ctx.fillText(G.Items.BY[pl.item].name, ix + S / 2, iy - 6);
        // Metrónomo: 6 rayitas que se van llenando; al máximo, todo naranja y parpadea.
        if (pl.item === 'metronome') {
          const n = pl.metroStacks(), full = n >= 6, blink = full && Math.sin(performance.now() / 140) > 0;
          const bw = (S - 14) / 6;
          for (let i = 0; i < 6; i++) {
            ctx.fillStyle = i < n ? (full ? (blink ? '#ffd23f' : '#ff9a3d') : '#ffd23f') : 'rgba(255,255,255,.18)';
            ctx.fillRect(ix + 7 + i * bw, iy + S - 7, bw - 2, 4);
          }
          if (full) {
            roundRect(ctx, ix - 2, iy - 2, S + 4, S + 4, 14);
            ctx.lineWidth = 3; ctx.strokeStyle = blink ? '#ff9a3d' : 'rgba(255,154,61,.45)'; ctx.stroke();
            // Etiqueta dentro de la casilla, arriba a la derecha (abajo está la ayuda de teclas).
            ctx.font = F(700, 9); ctx.textAlign = 'right'; ctx.fillStyle = '#ff9a3d';
            ctx.fillText(G.T('MÁX'), ix + S - 5, iy + 11);
            ctx.textAlign = 'center';
          }
        }
      }
    }

    // ---------- esferas (encima de los ataques; teclas 5-8) y sus mejoras activas ----------
    const orbs = pl.orbs || [], ob = pl.orbBuff || {};
    const buffs = Object.keys(ob).filter(id => ob[id] > 0);
    if (orbs.some(Boolean) || buffs.length) {
      const OS = 40, OG = 6, ow = G.Orbs.SLOTS * OS + (G.Orbs.SLOTS - 1) * OG;
      const ox = sx + totalW / 2 - ow / 2, oy = sy - 30 - OS;
      const cdF = G.U.clamp(G.Orbs.cd, 0, 1);
      for (let i = 0; i < G.Orbs.SLOTS; i++) {
        const o = orbs[i], x = ox + i * (OS + OG);
        roundRect(ctx, x, oy, OS, OS, 9);
        ctx.fillStyle = o ? 'rgba(20,24,44,.88)' : 'rgba(10,16,28,.45)';
        ctx.fill();
        const pick = o && !!G.Pad.name && i === G.Orbs.sel;      // con mando: la que usa X
        ctx.lineWidth = pick ? 2.5 : 1.2;
        ctx.strokeStyle = pick ? '#ffd23f' : o ? G.Orbs.BY[o.id].col : 'rgba(140,170,210,.18)';
        ctx.stroke();
        if (!o) continue;
        G.Touch.addButton(x, oy, OS, OS, () => G.Orbs.use(pl, i), OG / 2 + 2);
        G.Icons.draw(ctx, 'orb:' + o.id, x + (OS - 24) / 2, oy + (OS - 24) / 2, 24);
        if (cdF > 0) {
          ctx.save(); roundRect(ctx, x, oy, OS, OS, 9); ctx.clip();
          ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, oy, OS, OS * cdF);
          ctx.restore();
        }
        ctx.font = F(800, 9);
        if (!touch) { ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(180,200,230,.7)'; ctx.fillText(String(i + 5), x + 3, oy + 10); }
        if (o.n > 1) { ctx.textAlign = 'right'; ctx.fillStyle = '#f4f8ff'; ctx.fillText('×' + o.n, x + OS - 3, oy + OS - 4); }
      }
      // Qué hace cada una: ratón encima (PC), la elegida con mando, o la que acabas de coger (3 s).
      const mo = G.Input.mouse(), fresh = pl.orbNew && performance.now() - pl.orbNew.at < 3000 ? pl.orbNew.i : -1;
      let tip = -1, full = false;
      if (!touch) for (let i = 0; i < G.Orbs.SLOTS; i++) {
        const x = ox + i * (OS + OG);
        if (orbs[i] && mo.x >= x && mo.x <= x + OS && mo.y >= oy && mo.y <= oy + OS) { tip = i; full = true; }
      }
      if (tip < 0 && G.Pad.name && orbs[G.Orbs.sel]) tip = G.Orbs.sel;
      if (tip < 0 && fresh >= 0 && orbs[fresh]) tip = fresh;
      if (fresh >= 0 && orbs[fresh]) {
        const x = ox + fresh * (OS + OG), a = 1 - (performance.now() - pl.orbNew.at) / 3000;
        ctx.save(); ctx.globalAlpha = a;
        roundRect(ctx, x - 2, oy - 2, OS + 4, OS + 4, 11);
        ctx.lineWidth = 3; ctx.strokeStyle = G.Orbs.BY[orbs[fresh].id].col; ctx.stroke();
        ctx.restore();
      }
      if (tip >= 0) orbTip(ctx, orbs[tip].id, ox + tip * (OS + OG) + OS / 2, oy - 8, full, w);

      // Mejoras activas: icono y segundos que quedan.
      buffs.forEach((id, k) => {
        const bx = ox + ow + 10 + k * 30, by = oy + 4;
        G.Icons.draw(ctx, 'orb:' + id, bx, by, 24);
        ctx.font = F(800, 10); ctx.textAlign = 'center';
        ctx.fillStyle = G.Orbs.BY[id].col;
        ctx.fillText(Math.ceil(ob[id]) + 's', bx + 12, by + 35);
      });
    }

    // ---------- botón de pausa (táctil) ----------
    if (touch) {
      const sa = G.Touch.safeArea();
      const pp = G.Touch.spot('pause');
      const bx = pp ? G.U.clamp(pp[0] * w - 20, 4, w - 44) : w - 52 - Math.min(44, sa.right);
      const by = pp ? G.U.clamp(pp[1] * h - 20, 10, h - 44) : 12 + Math.min(20, sa.top), bs = 40;
      roundRect(ctx, bx, by, bs, bs, 10);
      ctx.fillStyle = 'rgba(10,16,28,.7)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(244,248,255,.8)'; ctx.stroke();
      ctx.fillStyle = '#f4f8ff';
      ctx.fillRect(bx + 13, by + 11, 5, 18); ctx.fillRect(bx + 22, by + 11, 5, 18);
      G.Touch.addButton(bx, by, bs, bs, () => G.Game.togglePause(), 8);
    }

    // pista de controles
    if (st.time < 14) {
      ctx.font = F(600, 10);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(180,200,230,.55)';
      ctx.fillText(touch ? 'Arrastra el dedo para moverte  ·  toca un ataque para cambiarlo'
                         : 'WASD moverse  ·  1-4 / Q / E o clic en un ataque para cambiarlo  ·  Esc pausa', w / 2, h - 4);
    }

    ctx.restore();
  }

  // ---------------- cooperativo ----------------

  /**
   * - Vida de cada compañero debajo de la tuya.
   * - Flecha en el borde de la pantalla hacia los que no se ven, con su nombre
   *   y a cuántos metros están (roja y parpadeando si está caído).
   * - Si has caído tú: aviso y barra de "te están levantando".
   */
  function drawCoop(ctx, w, h, pl, px, top) {
    const cam = G.Camera;
    const t = performance.now() / 1000;
    let y = top;
    ctx.textAlign = 'left';
    for (const m of G.Coop.mates) {
      if (!m.connected) continue;
      const o = m.pl;
      ctx.font = F(800, 10);
      ctx.fillStyle = m.color;
      G.I18n.rawCanvas(ctx, 'fillText', m.name, px, y + 9);
      const lx = px + 78;
      bar(ctx, lx, y + 1, 110, 8, o.dead ? 0 : o.hp / o.maxHp, o.dead ? '#ff5f6d' : '#5fe08a');
      if (o.dead) {
        ctx.font = F(800, 9);
        ctx.fillStyle = Math.sin(t * 8) > 0 ? '#ff8a96' : '#ffd0d5';
        ctx.fillText('CAÍDO', lx + 116, y + 9);
      }
      y += 15;
    }

    // Flechas hacia los compañeros fuera de la vista.
    for (const m of G.Coop.mates) {
      if (!m.connected) continue;
      const o = m.pl;
      const sx = (o.x - cam.left()) * cam.scale, sy = (o.y - o.bodyH * 0.5 - cam.top()) * cam.scale;
      if (sx > 0 && sx < w && sy > 0 && sy < h) continue;
      const M = 42;
      const ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 70, h - M - 80);
      const a = Math.atan2(sy - ey, sx - ex);
      const metres = Math.round(G.U.dist(pl.x, pl.y, o.x, o.y) / 32);
      const col = o.dead ? (Math.sin(t * 8) > 0 ? '#ff5f6d' : '#ffd0d5') : m.color;
      ctx.save();
      ctx.translate(ex, ey);
      // Flecha
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.2832); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28);
      ctx.lineTo(Math.cos(a + 2.4) * 14, Math.sin(a + 2.4) * 14);
      ctx.lineTo(Math.cos(a - 2.4) * 14, Math.sin(a - 2.4) * 14);
      ctx.closePath(); ctx.fill();
      // Inicial del compañero dentro del círculo
      ctx.font = F(800, 14);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      G.I18n.rawCanvas(ctx, 'fillText', m.name.charAt(0).toUpperCase(), 0, 5);
      // Nombre y distancia: al lado contrario de la flecha, para que no se salga
      const lx = -Math.cos(a) * 30, ly = -Math.sin(a) * 26 + 4;
      ctx.font = F(800, 12);
      const label = o.dead ? G.I18n.f('¡{x} necesita ayuda! · {x} m', m.name, metres) : m.name + ' · ' + metres + ' m';
      ctx.textAlign = Math.cos(a) > 0.3 ? 'right' : Math.cos(a) < -0.3 ? 'left' : 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      G.I18n.rawCanvas(ctx, 'strokeText', label, lx, ly);
      ctx.fillStyle = col;
      G.I18n.rawCanvas(ctx, 'fillText', label, lx, ly);
      ctx.restore();
    }

    // Tú, caído.
    if (pl.dead) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = F(800, 20);
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.75)';
      const msg = G.Coop.players().every(p => p.dead) ? 'Habéis caído todos…' : 'Has caído: un compañero puede levantarte';
      ctx.strokeText(msg, w / 2, h * 0.62);
      ctx.fillStyle = '#ffb0b8';
      ctx.fillText(msg, w / 2, h * 0.62);
      const f = (pl.reviveT || 0) / G.Player.REVIVE_TIME;
      if (f > 0) bar(ctx, w / 2 - 110, h * 0.62 + 12, 220, 10, f, '#5fe08a');
      // Mirar a un compañero vivo mientras tanto (botón, Q / E o LB / RB).
      const w0 = G.Game.watching;
      if (w0 || G.Coop.puppets().some(p => !p.dead)) {
        const m = w0 && G.Coop.mates.find(x => x.pl === w0);
        const label = (m ? G.I18n.f('Viendo a {x}', m.name) + ' · ' + G.I18n.t('cambiar') : G.I18n.t('Ver a un compañero'))
          + (G.Touch.active ? '' : '  (E)');
        ctx.font = F(800, 13);
        const bw = ctx.measureText(label).width + 28, bh = 28, bx = w / 2 - bw / 2, by = h * 0.62 + 32;
        roundRect(ctx, bx, by, bw, bh, 8);
        ctx.fillStyle = 'rgba(10,16,28,.75)'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = m ? m.color : 'rgba(244,248,255,.8)'; ctx.stroke();
        ctx.fillStyle = '#f4f8ff';
        G.I18n.rawCanvas(ctx, 'fillText', label, w / 2, by + 19);
        G.Touch.addButton(bx, by, bw, bh, () => G.Game.cycleWatch(1), 8);
      }
      ctx.restore();
    }
  }

  return { draw, roundRect, bar };
})();
