/* ============ errlog.js — informes de fallos (25-10-2026) ============
 * Si el juego da un error (en un fotograma, una promesa o donde sea), se apunta
 * un informe corto: el mensaje, dónde pasó (pila), la versión, qué estaba
 * pasando en el juego y el navegador. Con cuenta en la nube se sube a
 * Firestore (colección errs, ver firestore.rules), y los administradores lo ven
 * en su Panel (pestaña Fallos). Como mucho 5 por sesión y sin repetir el mismo.
 */
G.ErrLog = (() => {
  const MAX = 5, seen = new Set();
  let sent = 0;
  const local = [];

  function ctx() {
    try {
      const g = G.Game, p = g && g.player;
      return [g ? g.state : '?', p ? 'min ' + Math.floor((g.st.time || 0) / 60) : '', p ? p.mon.name : '',
              G.Rift && G.Rift.inArena ? (G.Rift.arena && G.Rift.arena.trio ? 'grieta verde' : 'grieta') : '',
              G.Coop && G.Coop.active ? 'coop' : '', G.Mode ? G.Mode.cur : ''].filter(Boolean).join(' · ');
    } catch (e) { return '?'; }
  }

  function add(err, where = '') {
    try {
      const msg = String((err && err.message) || err || 'error').slice(0, 300);
      const stack = String((err && err.stack) || '').slice(0, 1500);
      const key = msg + '|' + stack.slice(0, 200);
      if (seen.has(key)) return;
      seen.add(key);
      const r = { msg, stack, where: (where + ' ' + ctx()).trim().slice(0, 200),
                  v: String((G.Updater && G.Updater.version) || '').slice(0, 40),
                  ua: navigator.userAgent.slice(0, 160) };
      local.push(r);
      if (local.length > 20) local.shift();
      upload(r);
    } catch (e) { /* nada */ }
  }

  function upload(r) {
    if (sent >= MAX || !G.DB || !G.DB.online || !G.DB.fb || !G.DB.fb.uid) return;
    sent++;
    const fb = G.DB.fb;
    fb.fs.collection('errs').add(Object.assign({}, r, {
      uid: fb.uid, name: String((G.Social && G.Social.me && G.Social.me.name) || G.DB.user || '').slice(0, 24),
      at: firebase.firestore.FieldValue.serverTimestamp()
    })).catch(() => {});
  }

  /** Administradores: los últimos informes. */
  async function list() {
    const fb = G.DB.online && G.DB.fb;
    if (!fb) return [];
    const s = await fb.fs.collection('errs').orderBy('at', 'desc').limit(60).get();
    return s.docs.map(d => Object.assign({ id: d.id }, d.data(), { at: d.data().at && d.data().at.toMillis ? d.data().at.toMillis() : 0 }));
  }
  async function remove(id) { const fb = G.DB.online && G.DB.fb; if (fb) await fb.fs.collection('errs').doc(id).delete(); }

  addEventListener('error', e => add(e.error || e.message, 'window'));
  addEventListener('unhandledrejection', e => { const r = e.reason; if (r && /permission|network|offline|quota/i.test(String(r.code || r.message))) return; add(r, 'promesa'); });

  return { add, list, remove, get local() { return local.slice(); } };
})();
