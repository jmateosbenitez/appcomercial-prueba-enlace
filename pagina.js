// LIC-2a · Página TEMPORAL de la prueba previa (solo AppComercialTestEnlace).
// - La autorización llega tras «#»: el navegador no la envía al servidor.
// - Nada sale de esta página: sin analítica, sin peticiones, sin cookies.
// - No activa nada: solo ofrece abrir la app, que pide confirmar.
// - Caduca sola: después de CADUCA no ofrece ningún botón.

export const PAQUETE = "com.appcomercial.androidtestenlace";
export const ESQUEMA = "appcomercialprueba";
export const CADUCA = Date.UTC(2026, 10, 30, 23, 59); // 30-11-2026
const FORMATO = /^MKV1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** La autorización del fragmento, o null si no hay una bien formada. */
export function autorizacionDelFragmento(hash) {
  let t = "";
  try {
    t = decodeURIComponent(String(hash || "").replace(/^#/, "")).trim();
  } catch {
    return null;
  }
  return t.length <= 4096 && FORMATO.test(t) ? t : null;
}

/** Enlace de Android que abre la app de la prueba con la autorización (sin red). */
export function enlaceIntent(token) {
  return `intent://activar?t=${encodeURIComponent(token)}#Intent;scheme=${ESQUEMA};package=${PAQUETE};end`;
}

/** Enlace directo al esquema de la app (otros navegadores). */
export function enlaceDirecto(token) {
  return `${ESQUEMA}://activar?t=${encodeURIComponent(token)}`;
}

/** Qué navegador ha abierto la página (diagnóstico visible para la prueba). */
export function navegador(ua) {
  const u = String(ua || "");
  if (/WhatsApp/i.test(u)) return "navegador interno de WhatsApp";
  if (/; wv\)/.test(u)) return "vista web dentro de otra app";
  if (/SamsungBrowser/i.test(u)) return "Samsung Internet";
  if (/Chrome\//.test(u)) return "Chrome";
  return "otro navegador";
}

function mostrar(id, visible) {
  const e = document.getElementById(id);
  if (e) e.hidden = !visible;
}

export function iniciar(win = window) {
  const doc = win.document;
  const token = autorizacionDelFragmento(win.location.hash);
  // La autorización no se queda en la barra de direcciones ni en el historial.
  if (win.location.hash) win.history.replaceState(null, "", win.location.pathname + win.location.search);
  doc.getElementById("navegador").textContent = navegador(win.navigator.userAgent);
  if (Date.now() > CADUCA) {
    mostrar("caducada", true);
    return;
  }
  if (!token) {
    mostrar("sin-autorizacion", true);
    return;
  }
  doc.getElementById("abrir").setAttribute("href", enlaceIntent(token));
  doc.getElementById("abrir-directo").setAttribute("href", enlaceDirecto(token));
  mostrar("con-autorizacion", true);
}

if (typeof window !== "undefined" && window.document?.getElementById("abrir")) iniciar();
