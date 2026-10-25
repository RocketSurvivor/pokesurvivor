/* ============ adminstats-ui.js — panel de estadísticas para administradores (25-10-2026) ============
 * Botón "Panel" arriba a la izquierda (al lado de la Movedex), sólo para las
 * cuentas de administrador. Sale de los rankings (los top 50 de cada tabla,
 * en solitario y en grupo): cuánta gente hay en cada uno, qué Pokémon se usan
 * más, en qué minuto acaban las partidas y el nivel medio. No lee las partidas
 * de nadie: sólo lo que ya es público en el ranking.
 */
G.AdminStatsUI = (() => {
  const $ = G.UI.$;
  const P = [['d', 'Hoy'], ['w', 'Esta semana'], ['m', 'Este mes'], ['a', 'Histórico']];
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

  async function render() {
    const box = $('as-body');
    box.innerHTML = `<p class="sub">${G.T('Cargando…')}</p>`;
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
