# Duelo FM — recreacion de Yu-Gi-Oh! Forbidden Memories

Proyecto personal (circulo de amigos, sin publicar) que recrea el juego de
PS1 "Yu-Gi-Oh! Forbidden Memories": misma historia, mismas cartas reales,
mismas reglas. Fase 1 (esta carpeta) es pantalla plana, igual stack que
DogMy. Fase 2 (mas adelante, con computadora) agrega una capa de Realidad
Aumentada en 3D para los duelos presenciales entre amigos, usando Unity.

## Como se compila (igual que DogMy)

1. Sube todo el contenido de esta carpeta a un repositorio de GitHub.
2. Rellena `www/firebase-config.js` con los datos de tu proyecto de
   Firebase (puede ser uno nuevo, distinto al de DogMy).
3. En Firebase Realtime Database, pon reglas de lectura/escritura para el
   nodo `usuarios` (igual que se hizo en DogMy).
4. En GitHub, pestana "Actions" -> ejecuta el workflow "Compilar APK de
   Android" (o simplemente haz push a `main`, se dispara solo).
5. Descarga el APK del resultado del workflow.

## Que ya esta armado

- `data/cards.json` — las 722 cartas reales del juego (nombre, ATK, DEF,
  tipo de monstruo, Estrellas Guardianas), extraidas y verificadas contra
  el disco original.
- `data/guardian_stars.json` y `www/motor_combate.js` — el sistema real de
  Estrellas Guardianas (+500 ATK/DEF por ventaja) y la resolucion de
  combate (ataque vs ataque, ataque vs defensa), ya probado contra un
  ejemplo real del juego.
- `data/duelistas_historia.json` — el orden real de los 3 arcos de la
  historia (Antiguo Egipto -> Torneo moderno -> Regreso a Egipto).
- `data/reglas_combate.md` — reglas completas documentadas (mazo de 40,
  limite de copias, Magia/Trampa/Ritual, Terreno, etc.)
- Registro/ingreso de usuario con correo real + contrasena (hash SHA-256 +
  sal, igual que DogMy), guardado en Firebase.
- Pantallas de ejemplo: `historia.html` (lista los duelistas en orden) y
  `coleccion.html` (muestra que la base de 722 cartas carga bien).

## Lo que falta (roadmap)

1. **Motor de duelo jugable completo** en pantalla: mano, robar cartas,
   invocar monstruos, elegir Estrella Guardiana, atacar/defender, Magia/
   Trampa/Ritual, turnos, LP. (`motor_combate.js` ya trae las reglas de
   combate, falta la logica de turno completo y la interfaz.)
2. **Progreso de historia real**: guardar en Firebase que carta ganaste de
   cada duelista, desbloquear el siguiente duelo.
3. **Constructor de mazo (40 cartas)** usando `validarMazo()` de
   `motor_combate.js`, a partir de las cartas que el jugador ya gano.
4. **Duelo en vivo contra un amigo** (pantalla plana primero) via Firebase
   Realtime Database, reutilizando el mismo patron de sincronizacion en
   tiempo real que ya probamos en DogMy.
5. **Tabla de Fusiones**: el juego original la lee en vivo de la memoria
   RAM mientras corre (no es un archivo fijo en el disco). Para sacarla
   completa hay que correr el juego recompilado una vez (fase posterior,
   cuando haya computadora) y volcarla.
6. **Capa de AR (fase 2, con computadora)**: Unity + AR Foundation, se
   conecta como "modo de presentacion" del mismo duelo que ya funciona en
   pantalla plana — no se tira nada de lo construido en fase 1.

## Nota sobre el disco original

El archivo .bin/.iso del juego SOLO se uso para extraer datos reales (y
confirmar que coinciden con una base de datos independiente). El juego
final NO corre el disco ni necesita un emulador: es una app nueva,
compilada en APK, que usa esos datos como contenido — igual que Pokemon
GO es su propia app, no una copia corriendo por dentro de otro juego.
