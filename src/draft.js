// Borradores de pantalla: guardan lo que se estaba haciendo para retomarlo si la página se recarga.
// Usan sessionStorage: sobreviven a una recarga, pero se borran al cerrar la app.
export function loadDraft(key) {
  try { return JSON.parse(window.sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
}
export function saveDraft(key, value) {
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
export function clearDraft(key) {
  try { window.sessionStorage.removeItem(key); } catch (e) {}
}
