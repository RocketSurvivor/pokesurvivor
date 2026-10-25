/* ============ notice-ui.js — avisos de los administradores (25-10-2026) ============
 * Un administrador escribe un aviso desde su Panel (pestaña Avisos) y sale a
 * todos en el menú, arriba, durante el tiempo que elija ("Evento de shiny este
 * finde"...). Así no hace falta subir una versión para avisar.
 *   Firestore notices/cur = { text, by, at, until }   (ver firestore.rules:
 *   lo lee cualquiera; sólo lo escriben y borran los administradores)
 * Se mira al volver al menú y cada 3 minutos mientras estás en él.
 */
G.NoticeUI = (() => {
  const $ = G.UI.$;
  const SEEN = 'ps-notice-seen';
  let cur = null, lastGet = 0, timer = 0;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fs = () => (G.DB.online && G.DB.fb && G.DB.fb.fs) || null;

  async function fetchNow() {
    const db = fs();
    if (!db) return null;
    try {
      const d = await db.collection('notices').doc('cur').get();
      cur = d.exists ? d.data() : null;
    } catch (e) { cur = null; }
    lastGet = Date.now();
    return cur;
  }

  function live(n) { return n && n.text && (+n.until || 0) > Date.now(); }

  function show() {
    const el = $('menu-notice');
    if (!el) return;
    if (!live(cur)) { el.classList.add('hidden'); return; }
    el.innerHTML = `${G.Icons.html('star', 16)} <span>${esc(cur.text)}</span>`;
    el.classList.remove('hidden');
    // Aviso nuevo: también un toast (una vez).
    const at = +cur.at || 0;
    let seen = 0;
    try { seen = +localStorage.getItem(SEEN) || 0; } catch (e) { /* nada */ }
    if (at > seen) {
      try { localStorage.setItem(SEEN, String(at)); } catch (e) { /* nada */ }
      G.UI.toast(G.T('Aviso:') + ' ' + String(cur.text), 4200);
      G.Audio.sfx('shiny');
    }
  }

  async function refresh(force) {
    if (force || Date.now() - lastGet > 60000) await fetchNow();
    show();
  }

  /** Administradores: publicar (o quitar, con texto vacío). */
  async function publish(text, hours) {
    const db = fs();
    if (!db) throw new Error('offline');
    const t = String(text || '').trim().slice(0, 240);
    if (!t) { await db.collection('notices').doc('cur').delete(); cur = null; show(); return; }
    const doc = { text: t, by: String((G.Social.me && G.Social.me.name) || G.DB.user || 'admin').slice(0, 24), at: Date.now(), until: Date.now() + Math.round(hours * 3600e3) };
    await db.collection('notices').doc('cur').set(doc);
    cur = doc; show();
  }

  function init() {
    clearInterval(timer);
    timer = setInterval(() => { if (G.UI.isOpen('scr-menu') && G.Game.state === 'ui') refresh(true); }, 180000);
  }

  return { init, refresh, publish, fetchNow, get cur() { return cur; } };
})();
