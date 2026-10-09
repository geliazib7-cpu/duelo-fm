import { db } from "./firebase-config.js";
import { ref, get, set, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { generarSalt, hashContrasena, verificarContrasena, validarEmail } from "./utils.js";

// ---------- Registro ----------
document.getElementById("btnRegistrar")?.addEventListener("click", async () => {
  const errorEl = document.getElementById("errorRegistrar");
  errorEl.textContent = "";
  try {
    const nombre = document.getElementById("nombreRegistrar").value.trim();
    const correo = document.getElementById("correoRegistrar").value.trim().toLowerCase();
    const clave = document.getElementById("claveRegistrar").value;

    if (!nombre) return (errorEl.textContent = "Escribe tu nombre.");
    if (!validarEmail(correo)) return (errorEl.textContent = "Correo invalido.");
    if (clave.length < 6) return (errorEl.textContent = "La contrasena debe tener al menos 6 caracteres.");

    const idUsuario = correo.replace(/[.#$[\]]/g, "_");
    const refUsuario = ref(db, `usuarios/${idUsuario}`);
    const existe = await get(refUsuario);
    if (existe.exists()) return (errorEl.textContent = "Ya existe una cuenta con ese correo.");

    const salt = generarSalt();
    const hash = await hashContrasena(clave, salt);

    await set(refUsuario, {
      nombre,
      correo,
      salt,
      hash,
      creado: new Date().toISOString(),
      coleccion: {},     // cartas ganadas, por id de carta -> cantidad
      progresoHistoria: { arco: 1, indice: 0 },
    });

    localStorage.setItem("ygo_uid", idUsuario);
    window.location.href = "historia.html";
  } catch (e) {
    console.error(e);
    errorEl.textContent = "Error: " + (e && e.message ? e.message : e);
  }
});

// ---------- Ingresar ----------
document.getElementById("btnIngresar")?.addEventListener("click", async () => {
  const errorEl = document.getElementById("errorIngresar");
  errorEl.textContent = "";
  try {
    const correo = document.getElementById("correoIngresar").value.trim().toLowerCase();
    const clave = document.getElementById("claveIngresar").value;

    const idUsuario = correo.replace(/[.#$[\]]/g, "_");
    const refUsuario = ref(db, `usuarios/${idUsuario}`);
    const snap = await get(refUsuario);
    if (!snap.exists()) return (errorEl.textContent = "No existe esa cuenta.");

    const datos = snap.val();
    const ok = await verificarContrasena(clave, datos.salt, datos.hash);
    if (!ok) return (errorEl.textContent = "Contrasena incorrecta.");

    localStorage.setItem("ygo_uid", idUsuario);
    window.location.href = "historia.html";
  } catch (e) {
    console.error(e);
    errorEl.textContent = "Error: " + (e && e.message ? e.message : e);
  }
});
