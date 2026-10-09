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
