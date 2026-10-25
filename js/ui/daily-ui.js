/* ============ daily-ui.js — premio diario con racha (25-10-2026) ============
 * La primera vez que entras al menú cada día (hora de Madrid, la misma que el
 * ranking y las misiones) sale el premio del día. Si entraste ayer, la racha
 * sigue; si te saltas un día, vuelve a empezar. Los premios van en una semana
 * de 7 días que se repite (el día 7, un ticket shiny).
 *   save.stats.dayLast  último día recogido (AAAAMMDD)   (se fusionan con el
 *   save.stats.streak   días seguidos                    mayor, ver db.js)
 */
G.DailyUI = (() => {
  const $ = G.UI.$;
  const WEEK = [
    { coins: 200 }, { t1: 2 }, { coins: 400 }, { t10: 1 }, { t1: 3, coins: 500 }, { t10: 2 }, { ts: 1, t10: 1 }
  ];
  let waitT = 0;
  const dayNum = d => +String(G.Ranking.periodIds(d).d).slice(1);

  /** → { today, streak (la que tendrás al recoger), idx (0..6), claimed } */
  function state() {
    const s = G.DB.save, st = (s && s.stats) || {};
    const today = dayNum(new Date()), yest = dayNum(new Date(Date.now() - 864e5));
    const last = +st.dayLast || 0, claimed = last >= today;
    const streak = claimed ? (+st.streak || 1) : last === yest ? (+st.streak || 0) + 1 : 1;
    return { today, streak, idx: (streak - 1) % 7, claimed };
  }

  function text(r) {
    const p = [];
    if (r.ts) p.push(G.Icons.html('ticketS', 14) + ' ' + r.ts + ' ' + G.T('shiny'));
    if (r.t10) p.push(G.Icons.html('ticket10', 14) + ' ' + r.t10 + ' ×10');
    if (r.t1) p.push(G.Icons.html('ticket', 14) + ' ' + r.t1);
    if (r.coins) p.push('<span class="coin"></span> ' + r.coins);
    return p.join('<br>');
  }

  function open() {
    const st = state();
    $('daily-sub').textContent = G.I18n.f('Racha: {x} días seguidos', st.streak);
    $('daily-days').innerHTML = WEEK.map((r, i) => `<div class="daily-day ${i < st.idx ? 'done' : i === st.idx ? 'now' : ''}">
      <span>${G.I18n.f('Día {x}', i + 1)}</span><div>${text(r)}</div>${i < st.idx || (i === st.idx && st.claimed) ? '<b>✓</b>' : ''}</div>`).join('');
    const btn = $('daily-claim');
    btn.disabled = st.claimed;
    btn.textContent = st.claimed ? G.T('Vuelve mañana') : G.T('Recoger');
    btn.onclick = claim;
    G.UI.show('scr-daily', true);
  }

  function claim() {
    const st = state(), s = G.DB.save;
    if (st.claimed || !s) return;
    s.stats.dayLast = st.today;
    s.stats.streak = st.streak;
    const r = WEEK[st.idx];
    G.Progress.grant(r);
    G.DB.commit(true);
    G.Audio.sfx(r.ts ? 'legend' : 'shiny');
    const plain = [r.ts && r.ts + ' ' + G.T('ticket shiny'), r.t10 && r.t10 + ' ' + G.T('tickets ×10'), r.t1 && r.t1 + ' ' + G.T('tickets'),
                   r.coins && r.coins + ' ' + G.T('Pokémonedas')].filter(Boolean).join(' · ');
    G.UI.toast(G.T('¡Premio recogido!') + ' ' + plain, 2600);
    G.UI.hide('scr-daily');
  }

  /** Desde el menú: si hoy aún no lo has recogido y no hay otra ventana encima. */
  function maybeShow() {
    const s = G.DB.save;
    if (!s || !s.partner || state().claimed) return;
    // Si hay otra ventana encima (la guía, unas novedades…), espera a que se cierre.
    let tries = 0;
    const go = () => {
      if (!G.UI.isOpen('scr-menu') || G.Game.state !== 'ui' || state().claimed) return;
      if (document.querySelectorAll('.scr:not(.hidden)').length > 1 || document.querySelector('.modal:not(.hidden)')) {
        if (++tries < 90) setTimeout(go, 2000);
        return;
      }
      open();
    };
    clearTimeout(waitT);
    waitT = setTimeout(go, 1300);
  }

  function init() {
    $('daily-close').onclick = () => G.UI.hide('scr-daily');
  }

  return { init, open, maybeShow, state, WEEK };
})();
