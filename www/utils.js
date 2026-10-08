// Utilidades compartidas - mismo patron de seguridad que DogMy
// (hash SHA-256 + sal por usuario, nunca contrasena en texto plano).

export function generarSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashContrasena(contrasena, salt) {
  const datos = new TextEncoder().encode(contrasena + salt);
  const buffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verificarContrasena(contrasena, salt, hashGuardado) {
  const calculado = await hashContrasena(contrasena, salt);
  return calculado === hashGuardado;
}

export function validarEmail(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export async function cargarJSON(ruta) {
  const resp = await fetch(ruta);
  if (!resp.ok) throw new Error(`No se pudo cargar ${ruta}`);
  return resp.json();
}
