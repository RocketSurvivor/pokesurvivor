/* ============ firebase-config.js — conexión con tu proyecto de Firebase ============
 * Pega aquí la configuración de tu app web de Firebase (Consola de Firebase >
 * Configuración del proyecto > Tus apps > SDK setup and configuration > Config).
 * Los pasos completos están en docs/FIREBASE.md.
 *
 * Estos datos NO son secretos: Firebase los diseña para ir en la web. Lo que
 * protege las partidas son las reglas de Firestore (firestore.rules).
 *
 * Si se pone a null, el juego funciona en modo local (sólo en el navegador).
 */
// Proyecto propio: rocketsurvivor-cb999 (plan gratis Spark). ¡No activar nunca
// "Identity Platform" en la consola de Firebase: cobra por usuario!
G.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDtHA97uSSejXFDcvSTz5_G8CWf7vUynLI',
  authDomain: 'rocketsurvivor-cb999.firebaseapp.com',
  projectId: 'rocketsurvivor-cb999',
  storageBucket: 'rocketsurvivor-cb999.firebasestorage.app',
  messagingSenderId: '95467635253',
  appId: '1:95467635253:web:df08ea7225f949f31da77c',
  databaseURL: 'https://rocketsurvivor-cb999-default-rtdb.europe-west1.firebasedatabase.app'
};

/* Ejemplo de cómo debe quedar:
G.FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123'
};
*/
