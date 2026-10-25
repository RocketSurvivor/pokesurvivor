/* ============ weekly-ui.js — pantalla del Desafío semanal (25-10-2026) ============ */
G.WeeklyUI = (() => {
  const $ = G.UI.$;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function init() {
    $('wk-play').onclick = () => { G.Audio.sfx('confirm'); G.Weekly.play(); };
  }

  /** Cuánto falta para el lunes a las 0:00 (hora de Madrid). */
  function left() {
    const now = new Date();
    const mad = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const days = (8 - (mad.getDay() || 7)) % 7 || 7;
    const end = new Date(mad); end.setDate(mad.getDate() + days); end.setHours(0, 0, 0, 0);
    const h = Math.max(0, Math.floor((end - mad) / 3600000));
    return h >= 24 ? G.I18n.f('{x} d {x} h', Math.floor(h / 24), h % 24) : G.I18n.f('{x} h', h);
  }

  async function open() {
    G.UI.show('scr-weekly', true);
    const w = G.Weekly.info(), mon = G.DEX_BY[w.dex], s = G.DB.save;
    const best = s && s.wk && s.wk.id === w.id ? s.wk.best : 0;
    $('wk-left').textContent = G.I18n.f('Termina en {x}', left());
    $('wk-name').textContent = G.T(mon.name);
    $('wk-types').innerHTML = mon.types.map(t => `<span class="tag-chip" style="background:${G.U.TYPE_COLOR[t]}">${G.T(G.U.TYPE_NAME[t])}</span>`).join('');
    G.UI.sprite($('wk-mon'), mon.dex, { lively: true, scale: 3, hero: true });
    $('wk-mods').innerHTML = w.mods.map(m => `<div class="panel wk-mod"><b>${G.T(m.name)}</b><small>${G.T(m.desc)}</small></div>`).join('');
    $('wk-best').textContent = best ? G.I18n.f('Tu mejor marca esta semana: {x}', G.U.mmss(best)) : G.T('Aún no lo has jugado esta semana.');
    $('wk-play').disabled = !!G.Social.room;
    const list = $('wk-top');
    list.innerHTML = `<p class="sub">${G.T('Cargando…')}</p>`;
    let rows = [];
    try { rows = await G.Ranking.weeklyTop(); } catch (e) { rows = []; }
    const me = G.Social.uid;
    list.innerHTML = rows.length ? rows.slice(0, 20).map((r, i) => `<div class="rk-row${r.uids.includes(me) ? ' mine' : ''}">
        <span class="pos">${i + 1}</span><span class="who"><b translate="no">${r.names.map((n, j) => G.Admin.nameHtml(esc(n), r.uids[j])).join(' · ')}</b>
        <small>${G.I18n.f('Nv. {x} · {x} derrotados', r.lv || 1, r.kills || 0)}</small></span><b class="gold">${G.U.mmss(r.t)}</b></div>`).join('')
      : `<p class="sub">${G.T('Nadie lo ha jugado todavía esta semana (cuentan las partidas de 2 minutos o más, con cuenta en la nube).')}</p>`;
  }

  return { init, open };
})();
