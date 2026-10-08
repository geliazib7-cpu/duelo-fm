# Reglas de combate — Yu-Gi-Oh! Forbidden Memories (replica)

Fuente: mecanica real del juego original de PS1, confirmada via Yugipedia
("Guardian Star") y la guia oocities.org/ygofm/20rules.htm.

## Estrellas Guardianas
- Cada monstruo tiene **dos** Estrellas Guardianas posibles; al jugarlo se
  elige una (la IA/rival siempre usa la primera de su carta).
- Si la Estrella elegida es "fuerte contra" la del rival en ese combate,
  el monstruo recibe **+500 ATK y +500 DEF**, solo para ese combate.
- Ver `guardian_stars.json` para las 10 estrellas y sus relaciones
  (dos ciclos: uno de 4 estrellas — Sol/Luna/Venus/Mercurio — y otro de 6 —
  Marte/Jupiter/Saturno/Urano/Pluton/Neptuno).
- Ejemplo real de la guia: Mystical Lamp (400 ATK, Mercurio) ataca a
  Boo Koo (650 ATK, Sol). Mercurio es fuerte contra Sol, asi que
  (400 + 500) - 650 = +250 => gana el atacante.

## Resolucion de combate
- **Ataque contra ataque:** gana el mayor ATK (ya con el bono de Estrella
  Guardiana aplicado si corresponde). La carta perdedora es destruida y el
  exceso de dano pasa a los Puntos de Vida (LP) del perdedor.
- **Atacar a un monstruo en Defensa:** el defensor es destruido, pero sus
  LP no se ven afectados.
- **Si atacas y pierdes:** tus LP reciben dano = `DEF del rival - tu ATK`.
- **Si defiendes y ganas:** los LP del rival reciben dano = `tu DEF - ATK del rival`.
- **Si defiendes y pierdes:** tu carta es destruida, pero no pierdes LP.
- Atacar pone automaticamente al monstruo en modo Ataque.

## Campo y cartas de Magia
- Maximo 5 monstruos en el campo. Maximo 5 cartas de Magia/Trampa/Ritual.
- Tipos de Magia: Equipo (sube stats, a veces solo a un tipo de monstruo),
  Terreno (si el tipo del monstruo coincide con el terreno, +500 ATK/DEF),
  Destruccion (de monstruos, magia, o todo el campo), Directa (dano o cura
  de LP sin importar el campo).
- Boca arriba = efecto inmediato. Boca abajo = queda lista para usarse despues.
- Las cartas de Magia se descartan despues de usarse.

## Trampas
- Se activan cuando ocurre la accion que especifican (p. ej. al ser
  atacado). Algunas destruyen al monstruo atacante, otras invierten un
  efecto positivo del rival en negativo.

## Rituales
- Se invoca un monstruo de alto nivel sacrificando exactamente 3 cartas
  correctas que esten en el campo (segun pida la carta de Ritual). Las
  3 cartas sacrificadas se remueven del campo.

## Mazo y partida
- Mazo de 40 cartas, se roba al azar.
- Solo 1 copia de cada pieza del "Exodia the Forbidden" (Forbidden One +
  Exodia the Forbidden). Hasta 3 copias de cualquier otra carta.
- Ambos jugadores inician con 8000 LP. Gana quien deja al rival en 0.
- Cada turno se roban 5 cartas y se coloca 1 carta por turno. El jugador
  no puede atacar en su primer turno. Luego ataca la IA/rival primero.

## Pendiente de investigar
- Tabla completa de combinaciones de Fusion (que + que = que carta).
- Lista exacta de que 3 cartas pide cada carta de Ritual.
- Tabla de probabilidad de que carta suelta cada duelista de la historia.
