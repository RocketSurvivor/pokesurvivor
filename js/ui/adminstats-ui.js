/* ============ adminstats-ui.js — panel de estadísticas para administradores (25-10-2026) ============
 * Botón "Panel" arriba a la izquierda (al lado de la Movedex), sólo para las
 * cuentas de administrador. Sale de los rankings (los top 50 de cada tabla,
 * en solitario y en grupo): cuánta gente hay en cada uno, qué Pokémon se usan
 * más, en qué minuto acaban las partidas y el nivel medio. No lee las partidas
 * de nadie: sólo lo que ya es público en el ranking.
 */
G.AdminStatsUI = (() => {
  const $ = G.UI.$;
  const P = [['d', 'Hoy'], ['w', 'Esta semana'], ['m', 'Este mes'], ['a', 'Histórico'], ['errs', 'Fallos'], ['news', 'Avisos']];
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let period = 'w';

  function init() {
    $('btn-adminstats').onclick = open;
    G.DB.onSync(refreshBtn);
  }
  function refreshBtn() { $('btn-adminstats').classList.toggle('hidden', !G.Admin.isMe() || $('btn-movedex').classList.contains('hidden')); }

  function open() {
    G.UI.show('scr-adminstats', true);
    const tabs = $('as-tabs');
    tabs.innerHTML = P.map(([k, l]) => `<button class="chip ${k === period ? 'on' : ''}" data-p="${k}">${G.T(l)}</button>`).join('');
    tabs.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { period = b.dataset.p; open(); });
    render();
  }

  /** Los informes de fallos que manda el juego (js/core/errlog.js). */
  async function renderErrs(box) {
    let list = [];
    try { list = await G.ErrLog.list(); }
    catch (e) { box.innerHTML = `<p class="sub">${G.T('No se han podido leer los fallos. ¿Has publicado las reglas nuevas de Firestore?')}</p>`; return; }
    if (!list.length) { box.innerHTML = `<p class="sub">${G.T('No hay fallos. ¡Bien!')}</p>`; return; }
    box.innerHTML = list.map(r => `<div class="panel as-err">
      <div class="row between"><b>${esc(r.msg)}</b><button class="btn small ghost" data-del="${esc(r.id)}">${G.T('Borrar')}</button></div>
      <small>${esc(new Date(r.at).toLocaleString(G.I18n.locale))} · ${esc(r.name || r.uid)} · ${esc(r.where)} · v${esc(r.v)}</small>
      <details><summary>${G.T('Detalles')}</summary><pre>${esc(r.stack)}\n\n${esc(r.ua)}</pre></details></div>`).join('');
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { b.disabled = true; try { await G.ErrLog.remove(b.dataset.del); } catch (e) { /* nada */ } render(); });
  }

  /** Avisos para todos (ui/notice-ui.js): escribir, cuánto dura y publicar o quitar. */
  async function renderNews(box) {
    const n = await G.NoticeUI.fetchNow();
    const live = n && n.text && n.until > Date.now();
    box.innerHTML = `<p class="sub">${G.T('Lo que escribas sale a todos los jugadores arriba del menú (y como aviso la primera vez).')}</p>
      ${live ? `<div class="panel as-err"><b>${esc(n.text)}</b><small>${esc(n.by)} · ${G.T('hasta')} ${esc(new Date(n.until).toLocaleString(G.I18n.locale))}</small></div>` : `<p class="sub">${G.T('Ahora no hay ningún aviso.')}</p>`}
      <textarea id="nt-text" class="field" maxlength="240" rows="3" style="width:100%;margin-top:8px" placeholder="${G.T('Ej.: ¡Evento de shiny este fin de semana!')}">${live ? esc(n.text) : ''}</textarea>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">
        <select id="nt-hours" class="field"><option value="6">6 h</option><option value="24" selected>1 ${G.T('día')}</option><option value="72">3 ${G.T('días')}</option><option value="168">7 ${G.T('días')}</option></select>
        <button id="nt-pub" class="btn gold">${G.T('Publicar aviso')}</button>
        ${live ? `<button id="nt-del" class="btn ghost">${G.T('Quitar aviso')}</button>` : ''}
      </div><p id="nt-msg" class="note"></p>`;
    const msg = t => { $('nt-msg').textContent = t; };
    $('nt-pub').onclick = async () => {
      const t = $('nt-text').value.trim();
      if (!t) { msg(G.T('Escribe algo primero.')); return; }
      try { await G.NoticeUI.publish(t, +$('nt-hours').value); msg(G.T('¡Publicado!')); renderNews(box); }
      catch (e) { msg(G.T('No se ha podido publicar. ¿Has publicado las reglas nuevas de Firestore?')); }
    };
    if ($('nt-del')) $('nt-del').onclick = async () => {
      try { await G.NoticeUI.publish('', 0); renderNews(box); } catch (e) { msg(G.T('No se ha podido quitar.')); }
    };
  }

  async function render() {
    const box = $('as-body');
    box.innerHTML = `<p class="sub">${G.T('Cargando…')}</p>`;
    if (period === 'errs') { renderErrs(box); return; }
    if (period === 'news') { renderNews(box); return; }
    let solo = [], group = [];
    try { [solo, group] = await Promise.all([G.Ranking.top('s', period), G.Ranking.top('g', period)]); }
    catch (e) { box.innerHTML = `<p class="sub">${G.T('No se ha podido leer el ranking.')}</p>`; return; }
    const rows = solo.concat(group);
    if (!rows.length) { box.innerHTML = `<p class="sub">${G.T('Aún no hay partidas en este periodo.')}</p>`; return; }
    // Pokémon más usados.
    const cnt = {};
    for (const r of rows) for (const d of r.dex || []) cnt[d] = (cnt[d] || 0) + 1;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxC = top.length ? top[0][1] : 1;
    // En qué minuto acaban (tramos de 5 min).
    const buckets = {};
    for (const r of rows) { const b = Math.min(45, Math.floor(r.t / 300) * 5); buckets[b] = (buckets[b] || 0) + 1; }
    const keys = Object.keys(buckets).map(Number).sort((a, b) => a - b), maxB = Math.max(...Object.values(buckets));
    const avg = (a, f) => a.length ? a.reduce((s, x) => s + f(x), 0) / a.length : 0;
    const med = a => { const s = a.map(r => r.t).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
    box.innerHTML = `
      <div class="as-cards">
        <div class="panel"><span>${G.T('Marcas en solitario')}</span><b>${solo.length}</b></div>
        <div class="panel"><span>${G.T('Marcas en grupo')}</span><b>${group.length}</b></div>
        <div class="panel"><span>${G.T('Tiempo medio')}</span><b>${G.U.mmss(Math.round(avg(rows, r => r.t)))}</b></div>
        <div class="panel"><span>${G.T('Tiempo mediano')}</span><b>${G.U.mmss(med(rows))}</b></div>
        <div class="panel"><span>${G.T('Nivel medio')}</span><b>${avg(rows, r => r.lv || 1).toFixed(1)}</b></div>
        <div class="panel"><span>${G.T('Derrotados de media')}</span><b>${Math.round(avg(rows, r => r.kills || 0)).toLocaleString(G.I18n.locale)}</b></div>
      </div>
      <h3>${G.T('Pokémon más usados')}</h3>
      <div class="over-bars">${top.map(([d, n]) => `<div class="ob-row"><span class="ob-name">${G.T((G.DEX_BY[d] || {}).name || '?')}</span>
        <span class="ob-bar"><i style="width:${n / maxC * 100}%;background:${G.U.TYPE_COLOR[(G.DEX_BY[d] || { types: ['normal'] }).types[0]]}"></i></span><span class="ob-num">${n}</span></div>`).join('')}</div>
      <h3>${G.T('En qué minuto acaban las partidas')}</h3>
      <div class="over-bars">${keys.map(k => `<div class="ob-row"><span class="ob-name">${k >= 45 ? '45+' : k + '–' + (k + 5)} min</span>
        <span class="ob-bar"><i style="width:${buckets[k] / maxB * 100}%;background:#7fe0ff"></i></span><span class="ob-num">${buckets[k]}</span></div>`).join('')}</div>
      <p class="sub" style="margin-top:10px;font-size:12px">${G.T('Sale de los rankings (los 50 mejores de cada tabla), así que muestra a los que mejor juegan, no a todos.')}</p>`;
  }

  return { init, open, refreshBtn };
})();
