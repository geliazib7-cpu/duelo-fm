import { db } from "./firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { cargarJSON } from "./utils.js";
import { Duelo, armarMazoDePractica } from "./duelo.js";

const uid = localStorage.getItem("ygo_uid");
if (!uid) window.location.href = "index.html";

const params = new URLSearchParams(window.location.search);
const nombreRivalParam = params.get("rival") || "Duelista de practica";
const arco = params.get("arco");
const indice = params.get("indice");

document.getElementById("nombreRival").textContent = nombreRivalParam;

const cartas = await cargarJSON("data/cards.json");
const mazoJugador = armarMazoDePractica(cartas);
const mazoRival = armarMazoDePractica(cartas);
const duelo = new Duelo(mazoJugador, mazoRival);

let seleccionMano = null; // indice de la carta de mano seleccionada
let seleccionCampoPropio = null; // indice del campo propio seleccionado para atacar
let modoColocar = false;
let modoAtacar = false;

function pintar() {
  document.getElementById("lpJugador").textContent = `Tu: ${duelo.jugador.lp} LP`;
  document.getElementById("lpRival").textContent = `Rival: ${duelo.rival.lp} LP`;
  document.getElementById("indicadorTurno").textContent = duelo.turno === 0 ? "Tu turno" : "Turno del rival";

  pintarCampo("campoRival", duelo.rival.campo, false);
  pintarCampo("campoJugador", duelo.jugador.campo, true);
  pintarMano();

  const logEl = document.getElementById("log");
  logEl.innerHTML = duelo.log.map((l) => `<div>${l}</div>`).join("");
  logEl.scrollTop = logEl.scrollHeight;

  document.getElementById("btnColocar").disabled = duelo.turno !== 0 || duelo.jugador.yaColocoEsteTurno;
  document.getElementById("btnAtacar").disabled = duelo.turno !== 0;
  document.getElementById("btnTerminar").disabled = duelo.turno !== 0;

  if (duelo.terminado) {
    mostrarFinDePartida();
  } else if (duelo.turno === 1) {
    document.getElementById("ayuda").textContent = "El rival esta jugando...";
    setTimeout(() => {
      duelo.jugarTurnoIA();
      pintar();
    }, 900);
  }
}

function pintarCampo(idContenedor, campo, esPropio) {
  const cont = document.getElementById(idContenedor);
  cont.innerHTML = "";
  campo.forEach((entrada, i) => {
    const div = document.createElement("div");
    div.className = "carta-campo";
    if (esPropio && i === seleccionCampoPropio) div.classList.add("seleccionada");
    div.innerHTML = `
      <div class="nombre">${entrada.carta.nombre}</div>
      <div>${entrada.modo === "ataque" ? "ATK " + entrada.carta.atk : '<span class="defensa">DEF ' + entrada.carta.defensa + "</span>"}</div>
      <div style="color:#888;">${entrada.estrella}</div>
    `;
    div.addEventListener("click", () => {
      if (esPropio && modoAtacar && entrada.modo === "ataque" && !entrada.atacoEsteTurno) {
        seleccionCampoPropio = i;
        pintar();
      } else if (!esPropio && modoAtacar && seleccionCampoPropio !== null) {
        const r = duelo.atacar(seleccionCampoPropio, i);
        terminarSeleccionAtaque(r);
      }
    });
    cont.appendChild(div);
  });

  if (!esPropio && modoAtacar && seleccionCampoPropio !== null && campo.length === 0) {
    // sin monstruos rivales: boton de ataque directo
    const div = document.createElement("div");
    div.className = "carta-campo";
    div.style.borderStyle = "dashed";
    div.textContent = "Atacar directo";
    div.addEventListener("click", () => {
      const r = duelo.atacar(seleccionCampoPropio, null);
      terminarSeleccionAtaque(r);
    });
    cont.appendChild(div);
  }
}

function terminarSeleccionAtaque(resultado) {
  if (!resultado.ok) {
    document.getElementById("ayuda").textContent = resultado.error;
  }
  modoAtacar = false;
  seleccionCampoPropio = null;
  pintar();
}

function pintarMano() {
  const cont = document.getElementById("mano");
  cont.innerHTML = "";
  duelo.jugador.mano.forEach((carta, i) => {
    const div = document.createElement("div");
    div.className = "carta-mano";
    if (i === seleccionMano) div.classList.add("seleccionada");
    div.innerHTML = `<div class="nombre">${carta.nombre}</div><div>ATK ${carta.atk} / DEF ${carta.defensa}</div>`;
    div.addEventListener("click", () => {
      if (!modoColocar) return;
      seleccionMano = i;
      colocarCartaSeleccionada();
    });
    cont.appendChild(div);
  });
}

function colocarCartaSeleccionada() {
  const carta = duelo.jugador.mano[seleccionMano];
  if (!carta) return;
  const estrella = carta.estrellas_guardianas[0]; // simplificado: usa la primera estrella
  const modo = "ataque";
  const r = duelo.colocarCarta(seleccionMano, estrella, modo);
  if (!r.ok) document.getElementById("ayuda").textContent = r.error;
  modoColocar = false;
  seleccionMano = null;
  pintar();
}

document.getElementById("btnColocar").addEventListener("click", () => {
  modoColocar = !modoColocar;
  modoAtacar = false;
  document.getElementById("ayuda").textContent = modoColocar ? "Toca una carta de tu mano para colocarla (modo ataque)." : "";
});

document.getElementById("btnAtacar").addEventListener("click", () => {
  modoAtacar = !modoAtacar;
  modoColocar = false;
  seleccionCampoPropio = null;
  document.getElementById("ayuda").textContent = modoAtacar ? "Toca una de tus cartas en el campo, luego la carta rival (o 'Atacar directo')." : "";
  pintar();
});

document.getElementById("btnTerminar").addEventListener("click", () => {
  duelo.terminarTurno();
  pintar();
});

document.getElementById("btnVolver").addEventListener("click", () => {
  window.location.href = "historia.html";
});

async function mostrarFinDePartida() {
  const gano = duelo.ganador === "jugador";
  document.getElementById("tituloFin").textContent = gano ? "¡Ganaste el duelo!" : "Perdiste el duelo";
  document.getElementById("tituloFin").style.color = gano ? "#d4af37" : "#c0392b";

  if (gano && arco !== null && indice !== null) {
    try {
      // Carta ganada: una al azar del mazo del rival (regla real: te quedas con una carta de quien venciste)
      const cartaGanada = mazoRival[Math.floor(Math.random() * mazoRival.length)];
      const refUsuario = ref(db, `usuarios/${uid}`);
      const snap = await get(refUsuario);
      const datos = snap.val() || {};
      const coleccion = datos.coleccion || {};
      coleccion[cartaGanada.numero] = (coleccion[cartaGanada.numero] || 0) + 1;

      await update(refUsuario, {
        coleccion,
        progresoHistoria: { arco: Number(arco), indice: Number(indice) + 1 },
      });

      document.getElementById("mensajeFin").textContent = `Ganaste: ${cartaGanada.nombre}`;
    } catch (e) {
      document.getElementById("mensajeFin").textContent = "Duelo ganado, pero no se pudo guardar el progreso: " + e.message;
    }
  } else if (!gano) {
    document.getElementById("mensajeFin").textContent = "Puedes volver a intentarlo cuando quieras.";
  }

  document.getElementById("overlayFin").style.display = "flex";
}

pintar();
