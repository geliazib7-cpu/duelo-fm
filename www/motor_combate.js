// Motor de combate - replica de las reglas reales de
// Yu-Gi-Oh! Forbidden Memories (PS1). Ver /data/reglas_combate.md
// Este modulo no sabe nada de la pantalla: solo recibe datos de cartas
// y devuelve el resultado del combate. Lo usa tanto el duelo en pantalla
// plana como, mas adelante, la capa de AR.

export const BONO_ESTRELLA_GUARDIANA = 500;

export const CICLOS_ESTRELLAS = {
  // ciclo de 4
  Sun: { fuerteContra: "Moon" },
  Mercury: { fuerteContra: "Sun" },
  Venus: { fuerteContra: "Mercury" },
  Moon: { fuerteContra: "Venus" },
  // ciclo de 6
  Mars: { fuerteContra: "Jupiter" },
  Jupiter: { fuerteContra: "Saturn" },
  Saturn: { fuerteContra: "Uranus" },
  Uranus: { fuerteContra: "Pluto" },
  Pluto: { fuerteContra: "Neptune" },
  Neptune: { fuerteContra: "Mars" },
};

/**
 * Indica si la estrella `propia` tiene ventaja sobre la estrella `rival`.
 */
export function tieneVentajaEstelar(propia, rival) {
  const relacion = CICLOS_ESTRELLAS[propia];
  return !!relacion && relacion.fuerteContra === rival;
}

/**
 * Calcula el ATK/DEF efectivos de una carta en combate, dada la Estrella
 * Guardiana que eligio el jugador para ese monstruo y la que eligio el
 * rival para el suyo.
 *
 * carta: { atk, defensa, estrellas_guardianas: [..] }
 * estrellaPropia: una de las dos estrellas de la carta, elegida al jugarla
 * estrellaRival: la estrella que el rival eligio para SU carta
 */
export function statsEnCombate(carta, estrellaPropia, estrellaRival, bonoTerreno = 0, bonoEquipo = 0) {
  let atk = carta.atk ?? 0;
  let defensa = carta.defensa ?? 0;

  if (tieneVentajaEstelar(estrellaPropia, estrellaRival)) {
    atk += BONO_ESTRELLA_GUARDIANA;
    defensa += BONO_ESTRELLA_GUARDIANA;
  }

  atk += bonoTerreno + bonoEquipo;
  defensa += bonoTerreno + bonoEquipo;

  return { atk, defensa };
}

/**
 * Resuelve un combate entre un atacante y un defensor.
 * atacante / defensor: { atk, defensa } ya calculados con statsEnCombate()
 * modoDefensor: "ataque" | "defensa"
 *
 * Devuelve: { resultado, cartaDestruida, danoLP }
 *   resultado: "gana_atacante" | "gana_defensor" | "empate"
 *   cartaDestruida: "atacante" | "defensor" | "ninguna"
 *   danoLP: { atacante: n, defensor: n } (dano que recibe cada jugador)
 */
export function resolverCombate(atacante, defensor, modoDefensor) {
  if (modoDefensor === "defensa") {
    if (atacante.atk > defensor.defensa) {
      // Atacante gana: defensor destruido, SIN dano a LP del defensor
      return {
        resultado: "gana_atacante",
        cartaDestruida: "defensor",
        danoLP: { atacante: 0, defensor: 0 },
      };
    } else if (atacante.atk < defensor.defensa) {
      // Atacante pierde atacando: su propio LP recibe (DEF rival - su ATK)
      const dano = defensor.defensa - atacante.atk;
      return {
        resultado: "gana_defensor",
        cartaDestruida: "ninguna",
        danoLP: { atacante: dano, defensor: 0 },
      };
    }
    return { resultado: "empate", cartaDestruida: "ninguna", danoLP: { atacante: 0, defensor: 0 } };
  }

  // Defensor en modo Ataque: ataque contra ataque
  if (atacante.atk > defensor.atk) {
    const exceso = atacante.atk - defensor.atk;
    return {
      resultado: "gana_atacante",
      cartaDestruida: "defensor",
      danoLP: { atacante: 0, defensor: exceso },
    };
  } else if (atacante.atk < defensor.atk) {
    const exceso = defensor.atk - atacante.atk;
    return {
      resultado: "gana_defensor",
      cartaDestruida: "atacante",
      danoLP: { atacante: exceso, defensor: 0 },
    };
  }
  // Empate exacto: ambas destruidas, sin dano a LP (regla clasica de TCG;
  // el juego original resuelve empates ATK=ATK destruyendo ambas)
  return { resultado: "empate", cartaDestruida: "ambas", danoLP: { atacante: 0, defensor: 0 } };
}

/**
 * Reglas de mazo: 40 cartas, maximo 3 copias de cualquier carta,
 * excepto las piezas de Exodia (1 copia cada una).
 */
export const TAMANO_MAZO = 40;
export const MAX_COPIAS_NORMAL = 3;
export const MAX_COPIAS_EXODIA = 1;
export const NOMBRES_EXODIA = [
  "Exodia the Forbidden",
  "Right Arm of the Forbidden One",
  "Left Arm of the Forbidden One",
  "Right Leg of the Forbidden One",
  "Left Leg of the Forbidden One",
];

export function validarMazo(listaCartas) {
  const errores = [];
  if (listaCartas.length !== TAMANO_MAZO) {
    errores.push(`El mazo debe tener exactamente ${TAMANO_MAZO} cartas (tiene ${listaCartas.length}).`);
  }
  const conteo = {};
  for (const nombre of listaCartas) {
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  }
  for (const [nombre, cantidad] of Object.entries(conteo)) {
    const limite = NOMBRES_EXODIA.includes(nombre) ? MAX_COPIAS_EXODIA : MAX_COPIAS_NORMAL;
    if (cantidad > limite) {
      errores.push(`"${nombre}" tiene ${cantidad} copias (maximo ${limite}).`);
    }
  }
  return { valido: errores.length === 0, errores };
}
