// Motor de un duelo jugable, de principio a fin, contra un rival controlado
// por la computadora (IA simple). Primera version: solo monstruos (Magia/
// Trampa/Ritual quedan para una siguiente etapa, ver README).
//
// Reglas reales aplicadas (ver data/reglas_combate.md):
// - Mano inicial de 5 cartas, se roba 1 por turno despues de la primera.
// - 1 carta por turno se puede colocar en el campo (maximo 5 monstruos).
// - El jugador que empieza NO puede atacar en su primer turno.
// - Combate: gana el mayor ATK/DEF, con el bono de Estrella Guardiana
//   (+500/+500) si corresponde. Ver motor_combate.js para las formulas.
// - 8000 LP cada quien. Gana quien deja al rival en 0.

import { statsEnCombate, resolverCombate, tieneVentajaEstelar } from "./motor_combate.js";
import { cargarJSON } from "./utils.js";

const LP_INICIAL = 8000;
const TAMANO_MANO_INICIAL = 5;
const MAX_CAMPO = 5;

function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Arma un mazo de 40 cartas de monstruo al azar a partir de la base de 722.
 * TEMPORAL: mientras no este listo el constructor de mazos con las cartas
 * que el jugador va ganando en la historia, usamos un mazo de practica
 * armado al azar (respetando el limite de 3 copias).
 */
export function armarMazoDePractica(todasLasCartas) {
  const monstruos = todasLasCartas.filter((c) => c.tipo_carta === "Monster Card" && c.atk != null);
  const barajadas = barajar(monstruos);
  const mazo = [];
  const conteo = {};
  for (const carta of barajadas) {
    if (mazo.length >= 40) break;
    const usados = conteo[carta.nombre] || 0;
    if (usados >= 3) continue;
    conteo[carta.nombre] = usados + 1;
    mazo.push(carta);
  }
  return mazo;
}

export class Duelo {
  constructor(mazoJugador, mazoRival) {
    this.jugador = this._crearJugador(mazoJugador);
    this.rival = this._crearJugador(mazoRival);
    this.turno = 0; // 0 = jugador, 1 = rival
    this.numeroTurno = 1;
    this.terminado = false;
    this.ganador = null; // "jugador" | "rival"
    this.log = [];

    for (let i = 0; i < TAMANO_MANO_INICIAL; i++) {
      this._robar(this.jugador);
      this._robar(this.rival);
    }
  }

  _crearJugador(mazo) {
    return {
      lp: LP_INICIAL,
      mazo: barajar(mazo),
      mano: [],
      campo: [], // { carta, estrella, modo: 'ataque'|'defensa', atacoEsteTurno }
      yaColocoEsteTurno: false,
    };
  }

  _robar(j) {
    if (j.mazo.length === 0) return null;
    const carta = j.mazo.shift();
    j.mano.push(carta);
    return carta;
  }

  _agregarLog(texto) {
    this.log.push(texto);
    if (this.log.length > 50) this.log.shift();
  }

  jugadorActivo() {
    return this.turno === 0 ? this.jugador : this.rival;
  }

  rivalDelActivo() {
    return this.turno === 0 ? this.rival : this.jugador;
  }

  /** Coloca una carta de la mano en el campo, en modo ataque o defensa. */
  colocarCarta(indiceEnMano, estrella, modo) {
    const activo = this.jugadorActivo();
    if (activo.yaColocoEsteTurno) return { ok: false, error: "Ya colocaste una carta este turno." };
    if (activo.campo.length >= MAX_CAMPO) return { ok: false, error: "El campo ya esta lleno (max 5)." };
    const carta = activo.mano[indiceEnMano];
    if (!carta) return { ok: false, error: "Esa carta no existe en tu mano." };
    if (!carta.estrellas_guardianas.includes(estrella)) {
      return { ok: false, error: "Esa carta no tiene esa Estrella Guardiana." };
    }

    activo.mano.splice(indiceEnMano, 1);
    activo.campo.push({ carta, estrella, modo, atacoEsteTurno: false });
    activo.yaColocoEsteTurno = true;
    this._agregarLog(`${this.turno === 0 ? "Tu" : "Rival"} coloca a ${carta.nombre} en modo ${modo}.`);
    return { ok: true };
  }

  /** Ataca con una carta del campo propio a una del campo rival (o directo si el rival no tiene nada). */
  atacar(indiceCampoPropio, indiceCampoRival) {
    if (this.numeroTurno === 1 && this.turno === 0) {
      return { ok: false, error: "No puedes atacar en el primer turno de la partida." };
    }
    const activo = this.jugadorActivo();
    const rival = this.rivalDelActivo();
    const propio = activo.campo[indiceCampoPropio];
    if (!propio) return { ok: false, error: "No tienes esa carta en el campo." };
    if (propio.atacoEsteTurno) return { ok: false, error: "Esa carta ya ataco este turno." };
    if (propio.modo !== "ataque") return { ok: false, error: "Solo puedes atacar con cartas en modo ataque." };

    propio.atacoEsteTurno = true;

    // Sin monstruos rivales: dano directo a LP
    if (rival.campo.length === 0) {
      rival.lp = Math.max(0, rival.lp - propio.carta.atk);
      this._agregarLog(`${this.turno === 0 ? "Tu" : "Rival"} ataca directo con ${propio.carta.nombre} (${propio.carta.atk} de dano).`);
      this._revisarFinDePartida();
      return { ok: true, directo: true };
    }

    const objetivo = rival.campo[indiceCampoRival];
    if (!objetivo) return { ok: false, error: "No existe ese objetivo." };

    const statsPropio = statsEnCombate(propio.carta, propio.estrella, objetivo.estrella);
    const statsRival = statsEnCombate(objetivo.carta, objetivo.estrella, propio.estrella);
    const resultado = resolverCombate(statsPropio, statsRival, objetivo.modo);

    // Aplicar dano de LP (siempre al jugador atacante o al defensor, segun las reglas)
    activo.lp = Math.max(0, activo.lp - resultado.danoLP.atacante);
    rival.lp = Math.max(0, rival.lp - resultado.danoLP.defensor);

    // Destruir cartas segun el resultado
    if (resultado.cartaDestruida === "atacante" || resultado.cartaDestruida === "ambas") {
      activo.campo.splice(indiceCampoPropio, 1);
    }
    if (resultado.cartaDestruida === "defensor" || resultado.cartaDestruida === "ambas") {
      // el indice puede haber cambiado si se borro una carta de activo.campo, pero son arreglos distintos
      const idx = rival.campo.indexOf(objetivo);
      if (idx !== -1) rival.campo.splice(idx, 1);
    }

    this._agregarLog(
      `${this.turno === 0 ? "Tu" : "Rival"} ataca con ${propio.carta.nombre} (${statsPropio.atk}) a ${objetivo.carta.nombre} (${objetivo.modo === "ataque" ? statsRival.atk : statsRival.defensa}): ${resultado.resultado}.`
    );

    this._revisarFinDePartida();
    return { ok: true, resultado };
  }

  /** Termina el turno del jugador activo y pasa al siguiente. */
  terminarTurno() {
    const activo = this.jugadorActivo();
    activo.yaColocoEsteTurno = false;
    for (const c of activo.campo) c.atacoEsteTurno = false;

    this.turno = this.turno === 0 ? 1 : 0;
    this.numeroTurno++;
    const nuevoActivo = this.jugadorActivo();
    this._robar(nuevoActivo);
    this._agregarLog(`--- Turno de ${this.turno === 0 ? "el jugador" : "el rival"} ---`);
  }

  _revisarFinDePartida() {
    if (this.jugador.lp <= 0) {
      this.terminado = true;
      this.ganador = "rival";
    } else if (this.rival.lp <= 0) {
      this.terminado = true;
      this.ganador = "jugador";
    }
  }

  // ---------------- IA simple para el rival ----------------
  /** Juega un turno completo de la IA: coloca una carta si puede y ataca si le conviene. */
  jugarTurnoIA() {
    const yo = this.rival;
    const enemigo = this.jugador;

    // Colocar la carta mas fuerte de la mano, si hay espacio
    if (!yo.yaColocoEsteTurno && yo.campo.length < MAX_CAMPO && yo.mano.length > 0) {
      let mejorIdx = 0;
      for (let i = 1; i < yo.mano.length; i++) {
        if ((yo.mano[i].atk || 0) > (yo.mano[mejorIdx].atk || 0)) mejorIdx = i;
      }
      const carta = yo.mano[mejorIdx];
      const estrella = carta.estrellas_guardianas[0];
      this.colocarCarta(mejorIdx, estrella, "ataque");
    }

    // Atacar con todo lo que pueda y convenga
    let siguio = true;
    while (siguio) {
      siguio = false;
      for (let i = 0; i < yo.campo.length; i++) {
        const propio = yo.campo[i];
        if (propio.atacoEsteTurno || propio.modo !== "ataque") continue;

        if (enemigo.campo.length === 0) {
          this.atacar(i, null);
          siguio = true;
          break;
        }
        // Busca el mejor objetivo: uno que pueda destruir sin perder
        let mejorObjetivo = -1;
        for (let j = 0; j < enemigo.campo.length; j++) {
          const obj = enemigo.campo[j];
          const statsPropio = statsEnCombate(propio.carta, propio.estrella, obj.estrella);
          const defensaOAtaque = obj.modo === "ataque" ? statsEnCombate(obj.carta, obj.estrella, propio.estrella).atk : statsEnCombate(obj.carta, obj.estrella, propio.estrella).defensa;
          if (statsPropio.atk > defensaOAtaque) {
            mejorObjetivo = j;
            break;
          }
        }
        if (mejorObjetivo !== -1) {
          this.atacar(i, mejorObjetivo);
          siguio = true;
          break;
        }
      }
    }

    this.terminarTurno();
  }
}
